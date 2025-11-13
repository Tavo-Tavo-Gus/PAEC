import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';
import type { Student } from '@/types/database.types';
import { useAuth } from './useAuth';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    
    fetchStudents();

    const subscription = supabase
      .channel('students_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'students' 
        }, 
        () => fetchStudents()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  async function fetchStudents() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getStudents();

      if (response.rateLimited) {
        setError(response.error);
        setRetryAfter(response.retryAfter || null);
        return;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      setStudents(response.data || []);
      setRetryAfter(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
      setRetryAfter(null);
    } finally {
      setLoading(false);
    }
  }

  async function addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const response = await apiClient.createStudent(student);

      if (response.rateLimited) {
        setError(response.error);
        setRetryAfter(response.retryAfter || null);
        return null;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
      setRetryAfter(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar estudiante');
      setRetryAfter(null);
      return null;
    }
  }

  async function updateStudent(id: string, updates: Partial<Student>) {
    try {
      const response = await apiClient.updateStudent(id, updates);

      if (response.rateLimited) {
        setError(response.error);
        setRetryAfter(response.retryAfter || null);
        return null;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
      setRetryAfter(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estudiante');
      setRetryAfter(null);
      return null;
    }
  }

  async function deleteStudent(id: string) {
    try {
      const response = await apiClient.deleteStudent(id);

      if (response.rateLimited) {
        setError(response.error);
        setRetryAfter(response.retryAfter || null);
        return false;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data || false;
      setRetryAfter(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estudiante');
      setRetryAfter(null);
      return false;
    }
  }

  return {
    students,
    loading,
    error,
    retryAfter,
    addStudent,
    updateStudent,
    deleteStudent,
    refresh: fetchStudents,
  };
}