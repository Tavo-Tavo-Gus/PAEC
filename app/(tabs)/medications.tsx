import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Plus, Search, Pill, Clock, User } from 'lucide-react-native';
import { useMedications } from '../../hooks/useMedications';
import { useStudents } from '../../hooks/useStudents';
import { colors } from '@/constants/colors';

export default function MedicationsScreen() {
  const { student: studentParam } = useLocalSearchParams<{ student?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { medications, loading } = useMedications(studentParam ?? undefined);
  const { students } = useStudents();

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getStudentName(medication.student_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMedication = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.medicationCard}
      onPress={() => router.push(`/medications/edit?id=${item.id}`)}
    >
      <View style={styles.medicationHeader}>
        <View style={styles.medicationIcon}>
          <Pill size={24} color={colors.primary} />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <View style={styles.studentInfo}>
            <User size={14} color="#6B7280" />
            <Text style={styles.studentName}>{getStudentName(item.student_id)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.medicationDetails}>
        <Text style={styles.dosage}>Dosis: {item.dosage}</Text>
        <Text style={styles.frequency}>Frecuencia: {item.frequency}</Text>
        <View style={styles.nextDose}>
          <Clock size={14} color="#F59E0B" />
          <Text style={styles.nextDoseText}>
            Próxima: {new Date(item.next_dose).toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando medicamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicamentos</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar medicamentos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <FlatList
        data={filteredMedications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Pill size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No hay medicamentos</Text>
            <Text style={styles.emptySubtitle}>
              Agrega el primer medicamento presionando el botón +
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/medications/new')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  medicationDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  dosage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  nextDose: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDoseText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
});
