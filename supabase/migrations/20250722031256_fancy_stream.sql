/*
  # Configure Search Path Security

  1. Security Enhancement
    - Detect functions with mutable search_path
    - Configure secure search_path for all functions
    - Prevent search_path injection attacks

  2. Functions Updated
    - update_updated_at function with secure search_path
    - All trigger functions secured

  3. Security Benefits
    - Prevents schema injection attacks
    - Ensures consistent function behavior
    - Follows PostgreSQL security best practices
*/

-- Function to detect functions without proper search_path configuration
CREATE OR REPLACE FUNCTION detect_mutable_search_path_functions()
RETURNS TABLE(
  function_name text,
  function_schema text,
  has_search_path_set boolean,
  current_search_path text,
  security_risk text
) 
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text as function_name,
    n.nspname::text as function_schema,
    (p.proconfig IS NOT NULL AND 
     EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
            WHERE config LIKE 'search_path=%')) as has_search_path_set,
    COALESCE(
      (SELECT substring(config FROM 'search_path=(.*)') 
       FROM unnest(p.proconfig) AS config 
       WHERE config LIKE 'search_path=%' 
       LIMIT 1), 
      'NOT SET'
    ) as current_search_path,
    CASE 
      WHEN p.proconfig IS NULL OR 
           NOT EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                     WHERE config LIKE 'search_path=%') 
      THEN 'HIGH - Function uses mutable search_path'
      WHEN EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                  WHERE config LIKE 'search_path=%' 
                  AND config NOT LIKE '%pg_catalog%')
      THEN 'MEDIUM - search_path may not include pg_catalog'
      ELSE 'LOW - search_path properly configured'
    END as security_risk
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public', 'auth', 'storage')
    AND p.prokind = 'f'  -- Only functions, not procedures
  ORDER BY 
    CASE 
      WHEN p.proconfig IS NULL THEN 1
      ELSE 2
    END,
    n.nspname,
    p.proname;
END;
$$;

-- Secure the update_updated_at function with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Function to automatically fix search_path for all custom functions
CREATE OR REPLACE FUNCTION fix_function_search_paths()
RETURNS TABLE(
  function_name text,
  schema_name text,
  action_taken text,
  status text
)
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql AS $$
DECLARE
  func_record RECORD;
  fix_sql text;
BEGIN
  -- Loop through all functions that need fixing
  FOR func_record IN 
    SELECT 
      p.proname,
      n.nspname,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public')
      AND p.prokind = 'f'
      AND (p.proconfig IS NULL OR 
           NOT EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                     WHERE config LIKE 'search_path=%'))
  LOOP
    BEGIN
      -- Generate ALTER FUNCTION statement to set secure search_path
      fix_sql := format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_catalog',
        func_record.nspname,
        func_record.proname,
        func_record.args
      );
      
      -- Execute the fix
      EXECUTE fix_sql;
      
      -- Return success record
      function_name := func_record.proname;
      schema_name := func_record.nspname;
      action_taken := 'SET search_path = public, pg_catalog';
      status := 'SUCCESS';
      
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      -- Return error record
      function_name := func_record.proname;
      schema_name := func_record.nspname;
      action_taken := 'FAILED: ' || SQLERRM;
      status := 'ERROR';
      
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Function to validate search_path security across the database
CREATE OR REPLACE FUNCTION validate_search_path_security()
RETURNS TABLE(
  check_name text,
  status text,
  details text,
  recommendation text
)
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql AS $$
BEGIN
  -- Check 1: Functions without search_path
  RETURN QUERY
  SELECT 
    'Functions without search_path'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::text
      ELSE 'FAIL'::text
    END as status,
    format('%s functions found without search_path configuration', COUNT(*))::text as details,
    'Run fix_function_search_paths() to automatically fix'::text as recommendation
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public')
    AND p.prokind = 'f'
    AND (p.proconfig IS NULL OR 
         NOT EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                   WHERE config LIKE 'search_path=%'));

  -- Check 2: Functions with insecure search_path
  RETURN QUERY
  SELECT 
    'Functions with insecure search_path'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::text
      ELSE 'WARN'::text
    END as status,
    format('%s functions found with potentially insecure search_path', COUNT(*))::text as details,
    'Review and update search_path to include pg_catalog'::text as recommendation
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public')
    AND p.prokind = 'f'
    AND EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
               WHERE config LIKE 'search_path=%' 
               AND config NOT LIKE '%pg_catalog%');

  -- Check 3: SECURITY DEFINER functions
  RETURN QUERY
  SELECT 
    'SECURITY DEFINER functions'::text as check_name,
    'INFO'::text as status,
    format('%s SECURITY DEFINER functions found', COUNT(*))::text as details,
    'Ensure all SECURITY DEFINER functions have secure search_path'::text as recommendation
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public')
    AND p.prokind = 'f'
    AND p.prosecdef = true;
END;
$$;

-- Create a view for easy monitoring of function security
CREATE OR REPLACE VIEW function_security_audit AS
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  CASE 
    WHEN p.proconfig IS NOT NULL AND 
         EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                WHERE config LIKE 'search_path=%') 
    THEN true 
    ELSE false 
  END as has_search_path_set,
  COALESCE(
    (SELECT substring(config FROM 'search_path=(.*)') 
     FROM unnest(p.proconfig) AS config 
     WHERE config LIKE 'search_path=%' 
     LIMIT 1), 
    'NOT SET'
  ) as search_path_value,
  CASE 
    WHEN p.proconfig IS NULL OR 
         NOT EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                   WHERE config LIKE 'search_path=%') 
    THEN 'VULNERABLE'
    WHEN EXISTS(SELECT 1 FROM unnest(p.proconfig) AS config 
                WHERE config LIKE 'search_path=%' 
                AND config LIKE '%pg_catalog%')
    THEN 'SECURE'
    ELSE 'NEEDS_REVIEW'
  END as security_status,
  pg_get_function_identity_arguments(p.oid) as function_signature
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage')
  AND p.prokind = 'f'
ORDER BY 
  CASE 
    WHEN p.proconfig IS NULL THEN 1
    ELSE 2
  END,
  n.nspname,
  p.proname;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION detect_mutable_search_path_functions() TO authenticated;
GRANT EXECUTE ON FUNCTION fix_function_search_paths() TO service_role;
GRANT EXECUTE ON FUNCTION validate_search_path_security() TO authenticated;
GRANT SELECT ON function_security_audit TO authenticated;

-- Run initial security validation and fixes
SELECT * FROM validate_search_path_security();

-- Automatically fix any functions that need search_path configuration
SELECT * FROM fix_function_search_paths();

-- Show final security audit
SELECT * FROM function_security_audit WHERE security_status != 'SECURE';