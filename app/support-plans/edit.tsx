import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSupportPlans } from '@/hooks/useSupportPlans';
import { useStudents } from '@/hooks/useStudents';
import { X, Save, Plus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Student } from '@/types/database.types';
import { colors } from '@/constants/colors';

export default function EditPlanScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { supportPlans, updateSupportPlan, loading, error } = useSupportPlans();
  const { students } = useStudents();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [supportNeeds, setSupportNeeds] = useState<string[]>(['']);
  const [skills, setSkills] = useState<string[]>(['']);
  const [triggers, setTriggers] = useState<string[]>(['']);
  const [student, setStudent] = useState<Student | undefined>(undefined);

  useEffect(() => {
    if (supportPlans && params.id) {
      const currentPlan = supportPlans.find(p => p.id === params.id);
      if (currentPlan) {
        setSupportNeeds(currentPlan.support_needs?.length > 0 ? currentPlan.support_needs : ['']);
        setSkills(currentPlan.skills?.length > 0 ? currentPlan.skills : ['']);
        setTriggers(currentPlan.triggers?.length > 0 ? currentPlan.triggers : ['']);
        
        const studentData = students.find(s => s.id === currentPlan.student_id);
        setStudent(studentData);
      }
    }
  }, [supportPlans, students, params.id]);

  const addItem = (items: string[], setItems: (items: string[]) => void) => {
    setItems([...items, '']);
  };

  const removeItem = (index: number, items: string[], setItems: (items: string[]) => void) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, value: string, items: string[], setItems: (items: string[]) => void) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!params.id) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      // Filter out empty items
      const filteredSupportNeeds = supportNeeds.filter(item => item.trim() !== '');
      const filteredSkills = skills.filter(item => item.trim() !== '');
      const filteredTriggers = triggers.filter(item => item.trim() !== '');

      if (filteredSupportNeeds.length === 0 && filteredSkills.length === 0 && filteredTriggers.length === 0) {
        throw new Error('Debe agregar al menos un elemento en cualquiera de las secciones');
      }

      const result = await updateSupportPlan(params.id, {
        support_needs: filteredSupportNeeds,
        skills: filteredSkills,
        triggers: filteredTriggers,
      });

      if (result) {
        // Esperar un momento para que la actualización se propague
        await new Promise(resolve => setTimeout(resolve, 500));
        router.back();
      } else {
        throw new Error('No se pudo actualizar el plan de apoyo');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios');
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

  const renderSection = (
    title: string,
    items: string[],
    setItems: (items: string[]) => void,
    placeholder: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={(text) => updateItem(index, text, items, setItems)}
            placeholder={placeholder}
            multiline
          />
          {items.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(index, items, setItems)}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addItem(items, setItems)}
      >
        <Plus size={20} color={colors.primary} />
        <Text style={styles.addButtonText}>Agregar {title.toLowerCase()}</Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerTitle}>Editar Plan de Apoyo</Text>
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
        <View style={styles.studentInfo}>
          <Text style={styles.studentLabel}>Plan para:</Text>
          <Text style={styles.studentName}>{student?.name || 'Cargando...'}</Text>
        </View>

        {renderSection(
          'Necesidades de Apoyo',
          supportNeeds,
          setSupportNeeds,
          'Ej: Apoyo en organización de tareas, pausas activas cada 30 minutos...'
        )}

        {renderSection(
          'Habilidades y Fortalezas',
          skills,
          setSkills,
          'Ej: Habilidad artística, buena memoria visual, creatividad...'
        )}

        {renderSection(
          'Gatillantes y Estresores',
          triggers,
          setTriggers,
          'Ej: Ruidos fuertes, cambios en la rutina, multitareas...'
        )}
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
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
  studentInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  studentLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  removeButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});