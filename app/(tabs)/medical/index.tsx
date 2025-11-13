import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ChevronDown, Pill, Clock, AlertCircle, Plus } from 'lucide-react-native';
import { useMedications } from '@/hooks/useMedications';
import { useStudents } from '@/hooks/useStudents';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MedicalScreen() {
  const { students, loading: studentsLoading } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const { medications, loading: medsLoading, error, refresh } = useMedications(selectedStudent);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loading = studentsLoading || medsLoading;

  if (loading && !medications.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  const renderMedication = ({ item }) => (
    <TouchableOpacity 
      style={styles.medicationCard}
      onPress={() => router.push(`/medical/edit?id=${item.id}`)}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Pill size={24} color="#2563eb" />
        </View>
        <Text style={styles.medicineName}>{item.name}</Text>
      </View>

      <View style={styles.medicationInfo}>
        <Text style={styles.dosageText}>{item.dosage} • {item.frequency}</Text>
        <View style={styles.nextDoseContainer}>
          <Clock size={16} color="#64748b" />
          <Text style={styles.nextDoseText}>
            Próxima dosis: {format(new Date(item.next_dose), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.alertButton}
        onPress={() => {
          // TODO: Implementar reporte de incidentes
          alert('Función de reporte en desarrollo');
        }}
      >
        <AlertCircle size={16} color="#dc2626" />
        <Text style={styles.alertText}>Reportar incidente</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No hay medicamentos registrados</Text>
              <Text style={styles.emptyStateText}>
                Comienza agregando un nuevo medicamento presionando el botón +
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Selecciona un estudiante para ver sus medicamentos
          </Text>
        </View>
      )}

      {selectedStudent && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push(`/medical/new?student=${selectedStudent}`)}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
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
  listContainer: {
    padding: 16,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  medicationInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  dosageText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  nextDoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDoseText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  alertText: {
    marginLeft: 8,
    color: '#dc2626',
    fontWeight: '500',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
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
    right: 16,
    bottom: 16,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});