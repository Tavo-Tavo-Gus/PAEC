import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react-native';
import { useStudents } from '@/hooks/useStudents';
import { useEvents } from '@/hooks/useEvents';
import { useMedications } from '@/hooks/useMedications';
import type { Event, Medication } from '@/types/database.types';
import { addDays, format, isSameDay, isToday, parse, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EVENT_TYPES = [
  { value: 'therapy', label: 'Terapia' },
  { value: 'medication', label: 'Medicación' },
  { value: 'evaluation', label: 'Evaluación' },
];

export default function CalendarScreen() {
  const { student: studentParam } = useLocalSearchParams<{ student?: string }>();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(studentParam ?? null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, loading: eventsLoading, error: eventsError, addEvent } = useEvents(selectedStudent);
  const { medications, loading: medicationsLoading, error: medicationsError } = useMedications(selectedStudent ?? undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('therapy');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newRecurrence, setNewRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [saving, setSaving] = useState(false);

  const occursOnDate = (originalStart: Date, recurrence: string | undefined, targetDate: Date) => {
    if (!recurrence || recurrence === 'none') {
      return isSameDay(originalStart, targetDate);
    }
    const originalDay = new Date(originalStart.getFullYear(), originalStart.getMonth(), originalStart.getDate());
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    if (target < originalDay) return false;
    if (recurrence === 'daily') return true;
    if (recurrence === 'weekly') return originalStart.getDay() === targetDate.getDay();
    return false;
  };

  const projectToDate = (original: Date, targetDate: Date) => {
    return setMinutes(setHours(targetDate, original.getHours()), original.getMinutes());
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'therapy':
        return colors.eventTherapy;
      case 'medication':
        return colors.eventMedication;
      case 'evaluation':
        return colors.eventEvaluation;
      default:
        return '#94a3b8';
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewType('therapy');
    setNewDate(format(selectedDate, 'dd/MM/yyyy'));
    setNewStartTime('09:00');
    setNewEndTime('10:00');
    setNewRecurrence('none');
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const parseTimeToDate = (baseDate: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return setMinutes(setHours(baseDate, hours), minutes);
  };

  const handleSaveEvent = async () => {
    if (!selectedStudent) return;

    if (!newTitle.trim()) {
      Alert.alert('Falta información', 'Escribe un título para el evento.');
      return;
    }

    const parsedDate = parse(newDate, 'dd/MM/yyyy', new Date());
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Fecha inválida', 'Usa el formato DD/MM/AAAA, por ejemplo 15/09/2026.');
      return;
    }

    const startDate = parseTimeToDate(parsedDate, newStartTime);
    const endDate = parseTimeToDate(parsedDate, newEndTime);

    if (!startDate || !endDate) {
      Alert.alert('Hora inválida', 'Usa el formato HH:mm, por ejemplo 09:00.');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Horario inválido', 'La hora de término debe ser posterior a la de inicio.');
      return;
    }

    setSaving(true);
    const result = await addEvent({
      student_id: selectedStudent,
      title: newTitle.trim(),
      type: newType,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      recurrence: newRecurrence,
    });
    setSaving(false);

    if (result) {
      resetForm();
      setIsModalOpen(false);
    } else {
      Alert.alert('Error', 'No se pudo guardar el evento. Intenta de nuevo.');
    }
  };

  if (studentsLoading || eventsLoading || medicationsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (studentsError || eventsError || medicationsError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {studentsError || eventsError || medicationsError}
        </Text>
      </View>
    );
  }

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const dateLabel = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const medicationEvents: Event[] = medications.map((medication: Medication) => ({
    id: `medication-${medication.id}`,
    student_id: medication.student_id,
    title: `Medicamento: ${medication.name}`,
    type: 'medication',
    start_time: medication.next_dose,
    end_time: medication.next_dose,
    recurrence: medication.recurrence,
    created_at: medication.created_at,
    updated_at: medication.updated_at,
  }));
  const eventsForSelectedDate = [...events, ...medicationEvents]
    .filter(event => occursOnDate(new Date(event.start_time), event.recurrence, selectedDate))
    .map(event => {
      const originalStart = new Date(event.start_time);
      const originalEnd = new Date(event.end_time);
      const isRecurringOccurrence = event.recurrence && event.recurrence !== 'none' && !isSameDay(originalStart, selectedDate);
      return isRecurringOccurrence
        ? {
            ...event,
            start_time: projectToDate(originalStart, selectedDate).toISOString(),
            end_time: projectToDate(originalEnd, selectedDate).toISOString(),
          }
        : event;
    })
    .sort((firstEvent, secondEvent) =>
      new Date(firstEvent.start_time).getTime() - new Date(secondEvent.start_time).getTime()
    );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Calendario</Text>
      </View>

      <View style={styles.studentSelector}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownText}>
            {selectedStudentData ? selectedStudentData.name : 'Seleccionar estudiante'}
          </Text>
          <ChevronDown size={20} color="#64748b" />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {students.map(student => (
              <TouchableOpacity
                key={student.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedStudent(student.id);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{student.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedStudent ? (
        <>
          <ScrollView style={styles.content}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Calendario de {selectedStudentData?.name}</Text>
              <View style={styles.dateNavigation}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setSelectedDate(currentDate => addDays(currentDate, -1))}
                  accessibilityLabel="Día anterior"
                >
                  <ChevronLeft size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.todayDate}>{dateLabel}</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setSelectedDate(currentDate => addDays(currentDate, 1))}
                  accessibilityLabel="Día siguiente"
                >
                  <ChevronRight size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {!isToday(selectedDate) && (
                <TouchableOpacity style={styles.todayButton} onPress={() => setSelectedDate(new Date())}>
                  <Text style={styles.todayButtonText}>Volver a hoy</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.timeline}>
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                  <View key={event.id} style={styles.eventContainer}>
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>
                        {format(new Date(event.start_time), 'HH:mm')}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.eventCard,
                        { borderLeftColor: getEventColor(event.type) },
                      ]}
                    >
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No hay eventos programados para este día</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.fab}
            onPress={openModal}
            accessibilityLabel="Agregar evento"
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Selecciona un estudiante para ver su calendario
          </Text>
        </View>
      )}

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
          >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo evento</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} accessibilityLabel="Cerrar">
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Sesión de terapia ocupacional"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.fieldLabel}>Tipo de evento</Text>
            <View style={styles.typeRow}>
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    { borderColor: getEventColor(type.value) },
                    newType === type.value && { backgroundColor: getEventColor(type.value) },
                  ]}
                  onPress={() => setNewType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      newType === type.value && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Repetir</Text>
            <View style={styles.typeRow}>
              {[
                { value: 'none', label: 'No se repite' },
                { value: 'daily', label: 'Todos los días' },
                { value: 'weekly', label: 'Semanal' },
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeChip,
                    { borderColor: colors.primary },
                    newRecurrence === option.value && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setNewRecurrence(option.value as 'none' | 'daily' | 'weekly')}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      newRecurrence === option.value && styles.typeChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Fecha</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={newDate}
              onChangeText={setNewDate}
              placeholderTextColor="#9ca3af"
            />
            {newRecurrence !== 'none' && (
              <Text style={styles.recurrenceHint}>
                {newRecurrence === 'daily'
                  ? 'Se repetirá todos los días a partir de esta fecha.'
                  : 'Se repetirá cada semana en este mismo día, a partir de esta fecha.'}
              </Text>
            )}

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Hora inicio</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  value={newStartTime}
                  onChangeText={setNewStartTime}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Hora término</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10:00"
                  value={newEndTime}
                  onChangeText={setNewEndTime}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveEvent}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Guardando...' : 'Guardar evento'}
              </Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  studentSelector: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  todayHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  todayDate: {
    fontSize: 16,
    color: '#64748b',
    textTransform: 'capitalize',
    flex: 1,
    textAlign: 'center',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateButton: {
    padding: 8,
    backgroundColor: colors.primaryBackground,
    borderRadius: 8,
  },
  todayButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  timeline: {
    padding: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 60,
    paddingTop: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  eventCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginLeft: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#64748b',
  },
  noEventsContainer: {
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  recurrenceHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});