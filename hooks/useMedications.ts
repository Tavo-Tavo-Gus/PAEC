import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Medication } from '@/types/database.types';

export function useMedications(studentId?: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async function fetchMedications() {
    try {
      let query = supabase
        .from('medications')
        .select('*')
        .order('next_dose');

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMedications();

    // Subscribe to changes
    const subscription = supabase
      .channel('medications_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => {
        fetchMedications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchMedications]);

  async function addMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    try {
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('medications')
        .insert([{ ...medication, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : 'No se pudo guardar el medicamento';
      setError(message);
      throw new Error(message);
    }
  }

  async function updateMedication(id: string, updates: Partial<Medication>) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }

  async function deleteMedication(id: string) {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }

  return {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
  };
}