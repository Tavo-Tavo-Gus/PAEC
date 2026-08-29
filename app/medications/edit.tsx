import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMedications } from '@/hooks/useMedications';
import { useStudents } from '@/hooks/useStudents';
import { X, Save } from 'lucide-react-native';
import type { Student } from '@/types/database.types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isValid, parseISO } from 'date-fns';
import { colors } from '@/constants/colors';

export default function EditMedicationScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { medications, updateMedication, loading, error } = useMedications();
  const { students } = useStudents();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nextDoseDate, setNextDoseDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [medication, setMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    next_dose: '',
  });
  const [student, setStudent] = useState<Student | undefined>(undefined);

  useEffect(() => {
    if (medications && params.id) {
      const currentMedication = medications.find(m => m.id === params.id);
      if (currentMedication) {
        setMedication({
          name: currentMedication.name,
          dosage: currentMedication.dosage,
          frequency: currentMedication.frequency,
          next_dose: currentMedication.next_dose,
        });
        const parsedDate = parseISO(currentMedication.next_dose);
        setNextDoseDate(isValid(parsedDate) ? parsedDate : null);
        
        const studentData = students.find(s => s.id === currentMedication.student_id);
        setStudent(studentData);
      }
    }
  }, [medications, students, params.id]);

  const handleSave = async () => {
    if (!params.id) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      if (!medication.name || !medication.dosage || !medication.frequency || !nextDoseDate) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      const result = await updateMedication(params.id, {
        ...medication,
        next_dose: nextDoseDate.toISOString(),
      });

      if (result) {
        router.back();
      } else {
        throw new Error('Failed to update medication');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Medicamento</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={24} color={saving ? "#94a3b8" : colors.primary} />
        </TouchableOpacity>
      </View>

      {saveError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{saveError}</Text>
        </View>
      )}

      <ScrollView style={styles.form}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentLabel}>Medicamento para:</Text>
          <Text style={styles.studentName}>{student?.name || 'Cargando...'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Medicamento</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={medication.name}
              onChangeText={(text) => setMedication(prev => ({ ...prev, name: text }))}
              placeholder="Nombre del medicamento"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosis <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={medication.dosage}
              onChangeText={(text) => setMedication(prev => ({ ...prev, dosage: text }))}
              placeholder="Ej: 10mg, 1 tableta"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frecuencia <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={medication.frequency}
              onChangeText={(text) => setMedication(prev => ({ ...prev, frequency: text }))}
              placeholder="Ej: Cada 8 horas, Una vez al día"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Próxima dosis <Text style={styles.required}>*</Text></Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity style={[styles.input, styles.dateTimeButton]} onPress={() => setShowDatePicker(true)}>
                <Text style={nextDoseDate ? styles.dateTimeText : styles.dateTimePlaceholder}>
                  {nextDoseDate ? format(nextDoseDate, 'dd/MM/yyyy') : 'Elegir fecha'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.input, styles.dateTimeButton]}
                onPress={() => nextDoseDate && setShowTimePicker(true)}
                disabled={!nextDoseDate}
              >
                <Text style={nextDoseDate ? styles.dateTimeText : styles.dateTimePlaceholder}>
                  {nextDoseDate ? format(nextDoseDate, 'HH:mm') : 'Elegir hora'}
                </Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={nextDoseDate || new Date()}
                mode="date"
                onChange={(_event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setNextDoseDate(current => {
                      const nextDate = new Date(date);
                      if (current) nextDate.setHours(current.getHours(), current.getMinutes());
                      return nextDate;
                    });
                  }
                }}
              />
            )}
            {showTimePicker && nextDoseDate && (
              <DateTimePicker
                value={nextDoseDate}
                mode="time"
                onChange={(_event, time) => {
                  setShowTimePicker(false);
                  if (time) {
                    setNextDoseDate(current => {
                      if (!current) return time;
                      const nextDate = new Date(current);
                      nextDate.setHours(time.getHours(), time.getMinutes());
                      return nextDate;
                    });
                  }
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  required: {
    color: colors.error,
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
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeButton: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1e293b',
  },
  dateTimePlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});