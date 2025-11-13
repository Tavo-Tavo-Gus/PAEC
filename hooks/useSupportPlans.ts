import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SupportPlan } from '@/types/database.types';

export function useSupportPlans(studentId?: string) {
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportPlans();

    // Subscribe to changes
    const subscription = supabase
      .channel('support_plans_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_plans' }, () => {
        fetchSupportPlans();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [studentId]);

  async function fetchSupportPlans() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('support_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSupportPlans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes de apoyo');
    } finally {
      setLoading(false);
    }
  }

  async function addSupportPlan(plan: Omit<SupportPlan, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('support_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear plan de apoyo');
      return null;
    }
  }

  async function updateSupportPlan(id: string, updates: Partial<SupportPlan>) {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('support_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local inmediatamente
      setSupportPlans(prev => 
        prev.map(plan => 
          plan.id === id ? { ...plan, ...updates } : plan
        )
      );

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar plan de apoyo');
      return null;
    }
  }

  async function deleteSupportPlan(id: string) {
    try {
      const { error } = await supabase
        .from('support_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar plan de apoyo');
      return false;
    }
  }

  return {
    supportPlans,
    loading,
    error,
    addSupportPlan,
    updateSupportPlan,
    deleteSupportPlan,
    refresh: fetchSupportPlans,
  };
}