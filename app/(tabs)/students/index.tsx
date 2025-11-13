import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useStudents } from '@/hooks/useStudents';
import { useState } from 'react';

export default function StudentsScreen() {
  const { students, loading, error, refresh } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.diagnosis && student.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
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

  const renderStudent = ({ item }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => router.push(`/students/${item.id}`)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }} 
        style={styles.studentImage} 
      />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentDetails}>{item.grade} • {item.age} años</Text>
        {item.diagnosis && (
          <View style={styles.diagnosisContainer}>
            <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No hay estudiantes</Text>
      <Text style={styles.emptyStateText}>
        Comienza agregando un nuevo estudiante presionando el botón +
      </Text>
    </View>
  );

  const NoResults = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
      <Text style={styles.emptyStateText}>
        Intenta con otros términos de búsqueda
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar estudiantes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={students.length === 0 ? <EmptyState /> : <NoResults />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/students/new')}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1e293b',
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
  listContainer: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  studentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  diagnosisContainer: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  diagnosisText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '500',
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
});