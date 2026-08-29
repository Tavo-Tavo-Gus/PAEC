import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useStudents } from '@/hooks/useStudents';
import { useEvents } from '@/hooks/useEvents';
import { useMedications } from '@/hooks/useMedications';
import type { Event, Medication } from '@/types/database.types';
import { addDays, format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '@/constants/colors';

export default function CalendarScreen() {
  const { student: studentParam } = useLocalSearchParams<{ student?: string }>();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(studentParam ?? null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, loading: eventsLoading, error: eventsError } = useEvents(selectedStudent);
  const { medications, loading: medicationsLoading, error: medicationsError } = useMedications(selectedStudent ?? undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    created_at: medication.created_at,
    updated_at: medication.updated_at,
  }));
  const eventsForSelectedDate = [...events, ...medicationEvents].filter(event =>
    isSameDay(new Date(event.start_time), selectedDate)
  ).sort((firstEvent, secondEvent) =>
    new Date(firstEvent.start_time).getTime() - new Date(secondEvent.start_time).getTime()
  );

  return (
    <View style={styles.container}>
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
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Selecciona un estudiante para ver su calendario
          </Text>
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
});