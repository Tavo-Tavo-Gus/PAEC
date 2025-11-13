import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStudents } from '@/hooks/useStudents';
import { X, Save } from 'lucide-react-native';

export default function NewStudentScreen() {
  const { addStudent } = useStudents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState({
    name: '',
    age: '',
    grade: '',
    diagnosis: '',
    image_url: '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!student.name || !student.age || !student.grade) {
        throw new Error('Por favor complete los campos requeridos');
      }

      const newStudent = await addStudent({
        name: student.name,
        age: parseInt(student.age),
        grade: student.grade,
        diagnosis: student.diagnosis || null,
        image_url: student.image_url || null,
      });

      if (newStudent) {
        router.back();
      } else {
        throw new Error('No se pudo crear el estudiante');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear estudiante');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Estudiante</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={24} color={saving ? "#94a3b8" : "#2563eb"} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={student.name}
              onChangeText={(text) => setStudent(prev => ({ ...prev, name: text }))}
              placeholder="Nombre completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Edad <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={student.age}
              onChangeText={(text) => setStudent(prev => ({ ...prev, age: text }))}
              keyboardType="numeric"
              placeholder="Edad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grado <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={student.grade}
              onChangeText={(text) => setStudent(prev => ({ ...prev, grade: text }))}
              placeholder="Grado escolar"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diagnóstico</Text>
            <TextInput
              style={styles.input}
              value={student.diagnosis}
              onChangeText={(text) => setStudent(prev => ({ ...prev, diagnosis: text }))}
              placeholder="Diagnóstico (opcional)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de la imagen</Text>
            <TextInput
              style={styles.input}
              value={student.image_url}
              onChangeText={(text) => setStudent(prev => ({ ...prev, image_url: text }))}
              placeholder="URL de la imagen (opcional)"
            />
          </View>
        </View>
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#fef2f2',
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
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
  required: {
    color: '#dc2626',
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
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});