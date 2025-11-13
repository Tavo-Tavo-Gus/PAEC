import { supabase } from './supabase';
import { apiRateLimiter, databaseRateLimiter } from './rateLimiter';
import { rateLimitHandler } from './errorHandler';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  rateLimited: boolean;
  retryAfter?: number;
}

class ApiClient {
  private userId: string | null = null;

  constructor() {
    // Listen for auth changes to update userId
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
    });
  }

  private async checkRateLimit(endpoint: string): Promise<boolean> {
    return databaseRateLimiter.isAllowed(endpoint, this.userId);
  }

  private createRateLimitError(): ApiResponse<null> {
    const resetTime = databaseRateLimiter.getResetTime('database', this.userId);
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
    
    return {
      data: null,
      error: `Demasiadas solicitudes. Intenta de nuevo en ${waitTime} segundos.`,
      rateLimited: true,
      retryAfter: waitTime * 1000,
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    endpoint: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await rateLimitHandler.withRetry(
        async () => {
          if (!this.checkRateLimit(endpoint)) {
            throw new Error('Rate limit exceeded');
          }
          return await operation();
        },
        {
          onRetry: (attempt, delay) => {
            console.log(`Reintentando ${endpoint} (intento ${attempt}) en ${delay}ms`);
          }
        }
      );

      return {
        data: result.data,
        error: result.error?.message || null,
        rateLimited: false,
      };
    } catch (err) {
      if (rateLimitHandler.isRateLimitError(err)) {
        const retryAfter = rateLimitHandler.getRetryAfter(err);
        return {
          data: null,
          error: rateLimitHandler.createUserMessage(err),
          rateLimited: true,
          retryAfter,
        };
      }

      return {
        data: null,
        error: err instanceof Error ? err.message : 'Error desconocido',
        rateLimited: false,
      };
    }
  }
  async getStudents(): Promise<ApiResponse<any[]>> {
    return this.executeWithRetry(
      () => supabase
        .from('students')
        .select('*')
        .order('name'),
      'students:read'
    );
  }

  async createStudent(student: any): Promise<ApiResponse<any>> {
    return this.executeWithRetry(
      () => supabase
        .from('students')
        .insert([student])
        .select()
        .single(),
      'students:create'
    );
  }

  async updateStudent(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.executeWithRetry(
      () => supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'students:update'
    );
  }

  async deleteStudent(id: string): Promise<ApiResponse<boolean>> {
    const result = await this.executeWithRetry(
      () => supabase
        .from('students')
        .delete()
        .eq('id', id),
      'students:delete'
    );

    return {
      ...result,
      data: !result.error,
    };
  }

  async getMedications(studentId?: string): Promise<ApiResponse<any[]>> {
    return this.executeWithRetry(
      () => {
      let query = supabase
        .from('medications')
        .select('*')
        .order('next_dose');

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      return query;
      },
      'medications:read'
    );
  }

  async createMedication(medication: any): Promise<ApiResponse<any>> {
    return this.executeWithRetry(
      () => supabase
        .from('medications')
        .insert([medication])
        .select()
        .single(),
      'medications:create'
    );
  }

  async getSupportPlans(studentId?: string): Promise<ApiResponse<any[]>> {
    return this.executeWithRetry(
      () => {
      let query = supabase
        .from('support_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      return query;
      },
      'support_plans:read'
    );
  }

  async createSupportPlan(plan: any): Promise<ApiResponse<any>> {
    return this.executeWithRetry(
      () => supabase
        .from('support_plans')
        .insert([plan])
        .select()
        .single(),
      'support_plans:create'
    );
  }
}

export const apiClient = new ApiClient();