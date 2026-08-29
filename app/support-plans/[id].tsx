import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSupportPlans } from '@/hooks/useSupportPlans';
import { useStudents } from '@/hooks/useStudents';
import { ArrowLeft, Pencil, Trash2, Brain, TriangleAlert as AlertTriangle, Target } from 'lucide-react-native';
import type { Student, SupportPlan } from '@/types/database.types';
import { colors } from '@/constants/colors';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { supportPlans, deleteSupportPlan, loading, error } = useSupportPlans();
  const { students } = useStudents();
  const [plan, setPlan] = useState<SupportPlan | null>(null);
  const [student, setStudent] = useState<Student | undefined>(undefined);

  useEffect(() => {
    if (supportPlans && id) {
      const currentPlan = supportPlans.find(p => p.id === id);
      if (currentPlan) {
        setPlan(currentPlan);
        const studentData = students.find(s => s.id === currentPlan.student_id);
        setStudent(studentData);
      }
    }
  }, [supportPlans, students, id]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Plan de Apoyo',
      '¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSupportPlan(id);
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

  if (error || !plan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'No se encontró el plan de apoyo'}
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

  const Section = ({
    title,
    icon,
    items,
    emptyText,
  }: {
    title: string;
    icon: React.ReactNode;
    items: string[];
    emptyText: string;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{emptyText}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/support-plans/edit?id=${id}`)}
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
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Plan de Acompañamiento</Text>
          {student && (
            <Text style={styles.studentName}>Para: {student.name}</Text>
          )}
          <Text style={styles.planDate}>
            Creado: {new Date(plan.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          {plan.updated_at !== plan.created_at && (
            <Text style={styles.planDate}>
              Actualizado: {new Date(plan.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          )}
        </View>

        <Section
          title="Necesidades de Apoyo"
          icon={<Target size={24} color={colors.primary} />}
          items={plan.support_needs}
          emptyText="No se han definido necesidades de apoyo específicas"
        />

        <Section
          title="Habilidades y Fortalezas"
          icon={<Brain size={24} color="#10b981" />}
          items={plan.skills}
          emptyText="No se han identificado habilidades específicas"
        />

        <Section
          title="Gatillantes y Estresores"
          icon={<AlertTriangle size={24} color="#f59e0b" />}
          items={plan.triggers}
          emptyText="No se han identificado gatillantes específicos"
        />
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
  headerButton: {
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
  planHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 8,
  },
  planDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  sectionContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});