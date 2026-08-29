import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStudents } from '@/hooks/useStudents';
import { ArrowLeft, Pencil, Trash2, Calendar, Pill, ClipboardList } from 'lucide-react-native';
import type { Student } from '@/types/database.types';
import { colors } from '@/constants/colors';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, deleteStudent, loading, error } = useStudents();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (students && id) {
      const currentStudent = students.find(s => s.id === id);
      if (currentStudent) {
        setStudent(currentStudent);
      }
    }
  }, [students, id]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Estudiante',
      '¿Estás seguro de que deseas eliminar este estudiante? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteStudent(id);
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'No se encontró el estudiante'}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/students/edit?id=${id}`)}
          >
            <Pencil size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: student.image_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.details}>{student.grade} • {student.age} años</Text>
          {student.diagnosis && (
            <View style={styles.diagnosisContainer}>
              <Text style={styles.diagnosisText}>{student.diagnosis}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/calendar?student=${id}`)}
          >
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.actionText}>Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/medications?student=${id}`)}
          >
            <Pill size={24} color={colors.primary} />
            <Text style={styles.actionText}>Medicamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/support-plans?student=${id}`)}
          >
            <ClipboardList size={24} color={colors.primary} />
            <Text style={styles.actionText}>Plan de Apoyo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: colors.primaryBackground,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  details: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  diagnosisContainer: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  diagnosisText: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});