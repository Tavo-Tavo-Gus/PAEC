import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Save, X } from 'lucide-react-native';
import { useStudents } from '@/hooks/useStudents';
import { useState, useEffect } from 'react';
import type { Student } from '@/types/database.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function EditStudentScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { students, updateStudent, loading, error } = useStudents();
  const [student, setStudent] = useState<Partial<Student>>({
    name: '',
    age: 0,
    grade: '',
    diagnosis: '',
    image_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (students && params.id) {
      const currentStudent = students.find(s => s.id === params.id);
      if (currentStudent) {
        setStudent({
          ...currentStudent,
          diagnosis: currentStudent.diagnosis || '',
          image_url: currentStudent.image_url || ''
        });
      }
    }
  }, [students, params.id]);

  const handleSave = async () => {
    if (!params.id) return;

    setSaving(true);
    setSaveError(null);

    try {
      const result = await updateStudent(params.id, student);
      if (result) {
        router.back();
      } else {
        throw new Error('Failed to update student');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'white' }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={24} color={saving ? "#94a3b8" : colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {saveError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{saveError}</Text>
        </View>
      )}

      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={student.name || ''}
              onChangeText={(text) => setStudent(prev => ({ ...prev, name: text }))}
              placeholder="Nombre del estudiante"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={styles.input}
              value={String(student.age || 0)}
              onChangeText={(text) => setStudent(prev => ({ ...prev, age: parseInt(text) || 0 }))}
              keyboardType="numeric"
              placeholder="Edad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grado</Text>
            <TextInput
              style={styles.input}
              value={student.grade || ''}
              onChangeText={(text) => setStudent(prev => ({ ...prev, grade: text }))}
              placeholder="Grado escolar"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diagnóstico</Text>
            <TextInput
              style={styles.input}
              value={student.diagnosis || ''}
              onChangeText={(text) => setStudent(prev => ({ ...prev, diagnosis: text }))}
              placeholder="Diagnóstico"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de la imagen</Text>
            <TextInput
              style={styles.input}
              value={student.image_url || ''}
              onChangeText={(text) => setStudent(prev => ({ ...prev, image_url: text }))}
              placeholder="URL de la imagen"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
});