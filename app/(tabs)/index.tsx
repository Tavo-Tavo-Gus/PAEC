import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useStudents } from '@/hooks/useStudents';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { RateLimitNotification } from '@/components/RateLimitNotification';

export default function StudentsScreen() {
  const { students, loading, error, retryAfter, refresh } = useStudents();
  const [showRateLimit, setShowRateLimit] = useState(false);

  // Show rate limit notification when retryAfter is set
  useState(() => {
    if (retryAfter && error) {
      setShowRateLimit(true);
    }
  }, [retryAfter, error]);
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

  return (
    <View style={styles.container}>
      <RateLimitNotification
        visible={showRateLimit}
        message={error || 'Demasiadas solicitudes'}
        type="warning"
        retryAfter={retryAfter || undefined}
        onHide={() => setShowRateLimit(false)}
        onRetry={() => {
          setShowRateLimit(false);
          refresh();
        }}
      />
      
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
});