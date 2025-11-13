import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, User, FileText, Trash2 } from 'lucide-react-native';
import { useSupportPlans } from '../../hooks/useSupportPlans';
import { useStudents } from '../../hooks/useStudents';

export default function SupportPlansScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { supportPlans, loading, deleteSupportPlan } = useSupportPlans();
  const { students } = useStudents();

  const filteredPlans = supportPlans.filter(plan => {
    const student = students.find(s => s.id === plan.student_id);
    const studentName = student?.name || '';
    return studentName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeletePlan = (planId: string) => {
    Alert.alert(
      'Eliminar Plan',
      '¿Estás seguro de que quieres eliminar este plan de acompañamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteSupportPlan(planId),
        },
      ]
    );
  };

  const renderPlanItem = ({ item }: { item: any }) => {
    const student = students.find(s => s.id === item.student_id);
    
    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => router.push(`/support-plans/${item.id}`)}
      >
        <View style={styles.planHeader}>
          <View style={styles.studentInfo}>
            <User size={20} color="#6366f1" />
            <Text style={styles.studentName}>
              {student?.name || 'Estudiante no encontrado'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeletePlan(item.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.planContent}>
          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>Necesidades de Apoyo:</Text>
            <Text style={styles.sectionContent}>
              {item.support_needs?.length > 0 
                ? item.support_needs.slice(0, 2).join(', ') + 
                  (item.support_needs.length > 2 ? '...' : '')
                : 'No especificadas'}
            </Text>
          </View>
          
          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>Habilidades:</Text>
            <Text style={styles.sectionContent}>
              {item.skills?.length > 0 
                ? item.skills.slice(0, 2).join(', ') + 
                  (item.skills.length > 2 ? '...' : '')
                : 'No especificadas'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>
          Actualizado: {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planes de Acompañamiento</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por estudiante..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FlatList
        data={filteredPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay planes</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'No se encontraron planes que coincidan con tu búsqueda'
                : 'Crea el primer plan de acompañamiento'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/support-plans/new')}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#f3f4f6',
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
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  planContent: {
    marginBottom: 12,
  },
  planSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
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
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
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