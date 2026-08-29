import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMedications } from '@/hooks/useMedications';
import { useStudents } from '@/hooks/useStudents';
import { X, Save, ChevronDown, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { colors } from '@/constants/colors';

export default function NewMedicationScreen() {
  const params = useLocalSearchParams<{ student: string }>();
  const { addMedication, error: medicationError } = useMedications();
  const { students } = useStudents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(params.student || null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [nextDoseDate, setNextDoseDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [medication, setMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    next_dose: '',
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    if (params.student) {
      setSelectedStudentId(params.student);
    }
  }, [params.student]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!selectedStudentId) {
        throw new Error('Por favor seleccione un estudiante');
      }

      if (!medication.name || !medication.dosage || !medication.frequency || !nextDoseDate) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      const newMedication = await addMedication({
        student_id: selectedStudentId,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        next_dose: nextDoseDate.toISOString(),
      });

      if (newMedication) {
        router.back();
      } else {
        throw new Error(medicationError || 'No se pudo crear el medicamento');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear medicamento');
    } finally {
      setSaving(false);
    }
  };

  const renderStudentSelector = () => (
    <Modal
      visible={showStudentSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowStudentSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Estudiante</Text>
            <TouchableOpacity onPress={() => setShowStudentSelector(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={students}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.studentOption}
                onPress={() => {
                  setSelectedStudentId(item.id);
                  setShowStudentSelector(false);
                }}
              >
                <Text style={[
                  styles.studentOptionText,
                  selectedStudentId === item.id && styles.studentOptionTextSelected
                ]}>
                  {item.name}
                </Text>
                {selectedStudentId === item.id && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.studentList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'white' }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Medicamento</Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={24} color={saving ? "#94a3b8" : colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.form}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentLabel}>Medicamento para:</Text>
          {params.student ? (
            <Text style={styles.studentName}>{selectedStudent?.name || 'Cargando...'}</Text>
          ) : (
            <TouchableOpacity
              style={styles.studentSelectorButton}
              onPress={() => setShowStudentSelector(true)}
            >
              <Text style={[
                styles.studentSelectorText,
                !selectedStudent && styles.studentSelectorPlaceholder
              ]}>
                {selectedStudent ? selectedStudent.name : 'Seleccionar estudiante'}
              </Text>
              <ChevronDown size={20} color="#64748b" />
            </TouchableOpacity>
          )}
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

      {renderStudentSelector()}

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
    marginBottom: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentSelectorText: {
    fontSize: 16,
    color: '#1e293b',
  },
  studentSelectorPlaceholder: {
    color: '#94a3b8',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentList: {
    padding: 16,
  },
  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  studentOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});