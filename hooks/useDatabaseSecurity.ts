import { useState, useEffect } from 'react';
import { 
  databaseSecurity, 
  type SearchPathAuditResult, 
  type SecurityValidationResult, 
  type FunctionSecurityAudit 
} from '@/lib/databaseSecurity';

interface SecurityReport {
  mutableFunctions: SearchPathAuditResult[];
  validationResults: SecurityValidationResult[];
  functionAudit: FunctionSecurityAudit[];
  summary: {
    totalFunctions: number;
    vulnerableFunctions: number;
    secureFunctions: number;
    needsReview: number;
  };
}

export function useDatabaseSecurity() {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const securityReport = await databaseSecurity.generateSecurityReport();
      setReport(securityReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating security report');
    } finally {
      setLoading(false);
    }
  };

  const fixSearchPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await databaseSecurity.fixFunctionSearchPaths();
      // Regenerate report after fixing
      await generateReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fixing search paths');
    } finally {
      setLoading(false);
    }
  };

  const checkFunctionSecurity = async (functionName: string, schemaName?: string) => {
    try {
      return await databaseSecurity.checkFunctionSecurity(functionName, schemaName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error checking function security');
      return null;
    }
  };

  const getRecommendations = () => {
    if (!report) return [];
    return databaseSecurity.getSecurityRecommendations(report.functionAudit);
  };

  useEffect(() => {
    // Generate initial report on mount
    generateReport();
  }, []);

  return {
    report,
    loading,
    error,
    generateReport,
    fixSearchPaths,
    checkFunctionSecurity,
    getRecommendations,
  };
}

export function useSearchPathAudit() {
  const [mutableFunctions, setMutableFunctions] = useState<SearchPathAuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectMutableFunctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const functions = await databaseSecurity.detectMutableSearchPathFunctions();
      setMutableFunctions(functions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error detecting mutable functions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectMutableFunctions();
  }, []);

  return {
    mutableFunctions,
    loading,
    error,
    refresh: detectMutableFunctions,
  };
}

export function useSecurityValidation() {
  const [validationResults, setValidationResults] = useState<SecurityValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSecurity = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await databaseSecurity.validateSearchPathSecurity();
      setValidationResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error validating security');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSecurity();
  }, []);

  return {
    validationResults,
    loading,
    error,
    refresh: validateSecurity,
  };
}