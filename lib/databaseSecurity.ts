import { supabase } from './supabase';

export interface SearchPathAuditResult {
  function_name: string;
  function_schema: string;
  has_search_path_set: boolean;
  current_search_path: string;
  security_risk: string;
}

export interface SecurityValidationResult {
  check_name: string;
  status: string;
  details: string;
  recommendation: string;
}

export interface FunctionSecurityAudit {
  schema_name: string;
  function_name: string;
  is_security_definer: boolean;
  has_search_path_set: boolean;
  search_path_value: string;
  security_status: 'SECURE' | 'VULNERABLE' | 'NEEDS_REVIEW';
  function_signature: string;
}

export class DatabaseSecurityManager {
  /**
   * Detecta funciones con search_path mutable
   */
  async detectMutableSearchPathFunctions(): Promise<SearchPathAuditResult[]> {
    try {
      const { data, error } = await supabase.rpc('detect_mutable_search_path_functions');
      
      if (error) {
        console.error('Error detecting mutable search path functions:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to detect mutable search path functions:', error);
      throw error;
    }
  }

  /**
   * Valida la seguridad del search_path en toda la base de datos
   */
  async validateSearchPathSecurity(): Promise<SecurityValidationResult[]> {
    try {
      const { data, error } = await supabase.rpc('validate_search_path_security');
      
      if (error) {
        console.error('Error validating search path security:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to validate search path security:', error);
      throw error;
    }
  }

  /**
   * Obtiene una auditoría completa de seguridad de funciones
   */
  async getFunctionSecurityAudit(): Promise<FunctionSecurityAudit[]> {
    try {
      const { data, error } = await supabase
        .from('function_security_audit')
        .select('*')
        .order('security_status', { ascending: false });
      
      if (error) {
        console.error('Error getting function security audit:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to get function security audit:', error);
      throw error;
    }
  }

  /**
   * Corrige automáticamente los search_path de las funciones
   * NOTA: Esta función requiere permisos de service_role
   */
  async fixFunctionSearchPaths(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('fix_function_search_paths');
      
      if (error) {
        console.error('Error fixing function search paths:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to fix function search paths:', error);
      throw error;
    }
  }

  /**
   * Genera un reporte de seguridad completo
   */
  async generateSecurityReport(): Promise<{
    mutableFunctions: SearchPathAuditResult[];
    validationResults: SecurityValidationResult[];
    functionAudit: FunctionSecurityAudit[];
    summary: {
      totalFunctions: number;
      vulnerableFunctions: number;
      secureFunctions: number;
      needsReview: number;
    };
  }> {
    try {
      const [mutableFunctions, validationResults, functionAudit] = await Promise.all([
        this.detectMutableSearchPathFunctions(),
        this.validateSearchPathSecurity(),
        this.getFunctionSecurityAudit(),
      ]);

      const summary = {
        totalFunctions: functionAudit.length,
        vulnerableFunctions: functionAudit.filter(f => f.security_status === 'VULNERABLE').length,
        secureFunctions: functionAudit.filter(f => f.security_status === 'SECURE').length,
        needsReview: functionAudit.filter(f => f.security_status === 'NEEDS_REVIEW').length,
      };

      return {
        mutableFunctions,
        validationResults,
        functionAudit,
        summary,
      };
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  }

  /**
   * Verifica si una función específica tiene search_path seguro
   */
  async checkFunctionSecurity(functionName: string, schemaName: string = 'public'): Promise<FunctionSecurityAudit | null> {
    try {
      const { data, error } = await supabase
        .from('function_security_audit')
        .select('*')
        .eq('function_name', functionName)
        .eq('schema_name', schemaName)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking function security:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to check function security:', error);
      throw error;
    }
  }

  /**
   * Obtiene recomendaciones de seguridad
   */
  getSecurityRecommendations(audit: FunctionSecurityAudit[]): string[] {
    const recommendations: string[] = [];
    
    const vulnerable = audit.filter(f => f.security_status === 'VULNERABLE');
    const needsReview = audit.filter(f => f.security_status === 'NEEDS_REVIEW');
    const securityDefiner = audit.filter(f => f.is_security_definer);

    if (vulnerable.length > 0) {
      recommendations.push(
        `🚨 CRÍTICO: ${vulnerable.length} funciones tienen search_path mutable. Ejecuta fix_function_search_paths() para corregir automáticamente.`
      );
    }

    if (needsReview.length > 0) {
      recommendations.push(
        `⚠️ ADVERTENCIA: ${needsReview.length} funciones necesitan revisión de search_path. Asegúrate de incluir 'pg_catalog' en el search_path.`
      );
    }

    if (securityDefiner.length > 0) {
      recommendations.push(
        `🔒 INFO: ${securityDefiner.length} funciones usan SECURITY DEFINER. Verifica que todas tengan search_path seguro.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Todas las funciones tienen configuración de search_path segura.');
    }

    return recommendations;
  }
}

// Instancia singleton para uso en la aplicación
export const databaseSecurity = new DatabaseSecurityManager();

// Función de utilidad para logging de seguridad
export function logSecurityEvent(event: string, details: any) {
  console.log(`[DATABASE SECURITY] ${event}:`, details);
}

// Función para validar search_path en desarrollo
export async function validateDevelopmentSecurity() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const report = await databaseSecurity.generateSecurityReport();
      const recommendations = databaseSecurity.getSecurityRecommendations(report.functionAudit);
      
      console.log('🔍 Database Security Report:', {
        summary: report.summary,
        recommendations,
      });
      
      if (report.summary.vulnerableFunctions > 0) {
        console.warn('⚠️ Funciones vulnerables detectadas. Considera ejecutar las correcciones automáticas.');
      }
    } catch (error) {
      console.error('Error validating development security:', error);
    }
  }
}