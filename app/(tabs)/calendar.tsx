import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { useStudents } from '@/hooks/useStudents';
import { useEvents } from '@/hooks/useEvents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarScreen() {
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const { events, loading: eventsLoading, error: eventsError } = useEvents(selectedStudent);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'therapy':
        return '#818cf8';
      case 'medication':
        return '#34d399';
      case 'evaluation':
        return '#fb923c';
      default:
        return '#94a3b8';
    }
  };

  if (studentsLoading || eventsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (studentsError || eventsError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {studentsError || eventsError}
        </Text>
      </View>
    );
  }

  const selectedStudentData = students.find(s => s.id === selectedStudent);

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
            <Text style={styles.todayDate}>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
          </View>

          <View style={styles.timeline}>
            {events.length > 0 ? (
              events.map((event) => (
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
                <Text style={styles.noEventsText}>No hay eventos programados para hoy</Text>
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
    color: '#dc2626',
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