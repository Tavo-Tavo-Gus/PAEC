import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  error: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth initialization error:', error);
          if (mounted) {
            setError(`Error de conexión: ${error.message}`);
          }
        } else {
          console.log('Auth initialized successfully');
          if (mounted) {
            setSession(session);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        if (mounted) {
          setError('Error de conexión con el servidor');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      if (mounted) {
        setSession(session);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.helpText}>
          Verifica tu conexión a internet y que Supabase esté configurado correctamente.
        </Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ session, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});