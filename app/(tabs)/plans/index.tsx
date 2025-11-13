import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { FileText, User, Phone, Brain, TriangleAlert as AlertTriangle, History, ChevronRight, Users as Users2, Calendar } from 'lucide-react-native';

interface Student {
  id: string;
  personalInfo: {
    name: string;
    age: number;
    diagnosis: string;
    guardians: {
      name: string;
      relation: string;
      phone: string;
    }[];
  };
  supportPlan: {
    medications: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    supportNeeds: string[];
    skills: string[];
  };
  triggers: string[];
  dysregulation: {
    signs: string[];
    responses: string[];
  };
  interventionHistory: {
    date: string;
    type: string;
    description: string;
    outcome: string;
  }[];
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    personalInfo: {
      name: 'Ana García',
      age: 8,
      diagnosis: 'TDAH',
      guardians: [
        {
          name: 'María García',
          relation: 'Madre',
          phone: '+56 9 1234 5678'
        },
        {
          name: 'Juan García',
          relation: 'Padre',
          phone: '+56 9 8765 4321'
        }
      ]
    },
    supportPlan: {
      medications: [
        {
          name: 'Ritalin',
          dosage: '10mg',
          frequency: 'Una vez al día'
        }
      ],
      supportNeeds: [
        'Apoyo en organización de tareas',
        'Pausas activas cada 30 minutos',
        'Instrucciones claras y concisas'
      ],
      skills: [
        'Habilidad artística',
        'Buena memoria visual',
        'Creatividad'
      ]
    },
    triggers: [
      'Ruidos fuertes o repentinos',
      'Cambios en la rutina sin aviso previo',
      'Multitareas simultáneas'
    ],
    dysregulation: {
      signs: [
        'Inquietud motora aumentada',
        'Dificultad para mantener la atención',
        'Irritabilidad'
      ],
      responses: [
        'Ofrecer un espacio tranquilo',
        'Realizar ejercicios de respiración',
        'Utilizar técnicas de redirección'
      ]
    },
    interventionHistory: [
      {
        date: '2024-02-15',
        type: 'Evaluación Psicopedagógica',
        description: 'Evaluación inicial de necesidades educativas',
        outcome: 'Se identificaron áreas específicas de apoyo'
      },
      {
        date: '2024-02-01',
        type: 'Terapia Ocupacional',
        description: 'Sesión de regulación sensorial',
        outcome: 'Mejora en la autorregulación'
      }
    ]
  },
  {
    id: '2',
    personalInfo: {
      name: 'Carlos Rodríguez',
      age: 10,
      diagnosis: 'Dislexia',
      guardians: [
        {
          name: 'Ana Rodríguez',
          relation: 'Madre',
          phone: '+56 9 2345 6789'
        }
      ]
    },
    supportPlan: {
      medications: [],
      supportNeeds: [
        'Tiempo adicional para lectura',
        'Uso de recursos audiovisuales',
        'Apoyo en comprensión lectora'
      ],
      skills: [
        'Excelente expresión oral',
        'Habilidades matemáticas',
        'Trabajo en equipo'
      ]
    },
    triggers: [
      'Lectura en voz alta sin preparación',
      'Presión de tiempo en evaluaciones',
      'Comparaciones con compañeros'
    ],
    dysregulation: {
      signs: [
        'Evitación de actividades de lectura',
        'Frustración visible',
        'Baja participación en clase'
      ],
      responses: [
        'Ofrecer alternativas de presentación',
        'Dar tiempo adicional',
        'Reforzar logros positivamente'
      ]
    },
    interventionHistory: [
      {
        date: '2024-02-10',
        type: 'Evaluación Fonoaudiológica',
        description: 'Evaluación de habilidades lectoras',
        outcome: 'Se estableció plan de intervención específico'
      }
    ]
  }
];

function StudentDetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function StudentDetail({ student }: { student: Student }) {
  return (
    <ScrollView style={styles.detailContainer}>
      <StudentDetailSection 
        title="Datos Personales" 
        icon={<User size={24} color="#2563eb" />}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{student.personalInfo.name}</Text>
          
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{student.personalInfo.age} años</Text>
          
          <Text style={styles.label}>Diagnóstico:</Text>
          <Text style={styles.value}>{student.personalInfo.diagnosis}</Text>
          
          <Text style={styles.label}>Apoderados:</Text>
          {student.personalInfo.guardians.map((guardian, index) => (
            <View key={index} style={styles.guardianContainer}>
              <Text style={styles.value}>{guardian.name} ({guardian.relation})</Text>
              <View style={styles.phoneContainer}>
                <Phone size={16} color="#64748b" />
                <Text style={styles.phoneText}>{guardian.phone}</Text>
              </View>
            </View>
          ))}
        </View>
      </StudentDetailSection>

      <StudentDetailSection 
        title="Plan de Acompañamiento" 
        icon={<FileText size={24} color="#2563eb" />}
      >
        <View style={styles.infoContainer}>
          {student.supportPlan.medications.length > 0 && (
            <>
              <Text style={styles.label}>Medicamentos:</Text>
              {student.supportPlan.medications.map((med, index) => (
                <Text key={index} style={styles.value}>
                  {med.name} - {med.dosage} ({med.frequency})
                </Text>
              ))}
            </>
          )}
          
          <Text style={styles.label}>Necesidades de Apoyo:</Text>
          {student.supportPlan.supportNeeds.map((need, index) => (
            <Text key={index} style={styles.bulletPoint}>• {need}</Text>
          ))}
          
          <Text style={styles.label}>Habilidades:</Text>
          {student.supportPlan.skills.map((skill, index) => (
            <Text key={index} style={styles.bulletPoint}>• {skill}</Text>
          ))}
        </View>
      </StudentDetailSection>

      <StudentDetailSection 
        title="Gatillantes y Estresores" 
        icon={<AlertTriangle size={24} color="#2563eb" />}
      >
        <View style={styles.infoContainer}>
          {student.triggers.map((trigger, index) => (
            <Text key={index} style={styles.bulletPoint}>• {trigger}</Text>
          ))}
        </View>
      </StudentDetailSection>

      <StudentDetailSection 
        title="Manifestaciones y Respuestas" 
        icon={<Brain size={24} color="#2563eb" />}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Señales de Desregulación:</Text>
          {student.dysregulation.signs.map((sign, index) => (
            <Text key={index} style={styles.bulletPoint}>• {sign}</Text>
          ))}
          
          <Text style={styles.label}>Respuestas Sugeridas:</Text>
          {student.dysregulation.responses.map((response, index) => (
            <Text key={index} style={styles.bulletPoint}>• {response}</Text>
          ))}
        </View>
      </StudentDetailSection>

      <StudentDetailSection 
        title="Historial de Intervenciones" 
        icon={<History size={24} color="#2563eb" />}
      >
        <View style={styles.infoContainer}>
          {student.interventionHistory.map((intervention, index) => (
            <View key={index} style={styles.interventionContainer}>
              <Text style={styles.interventionDate}>{intervention.date}</Text>
              <Text style={styles.interventionType}>{intervention.type}</Text>
              <Text style={styles.interventionDescription}>{intervention.description}</Text>
              <Text style={styles.interventionOutcome}>Resultado: {intervention.outcome}</Text>
            </View>
          ))}
        </View>
      </StudentDetailSection>
    </ScrollView>
  );
}

export default function PlansScreen() {
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const renderStudentItem = ({ item }: { item: Student }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => setSelectedStudent(item)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.personalInfo.name}</Text>
        <Text style={styles.studentDetails}>
          {item.personalInfo.age} años • {item.personalInfo.diagnosis}
        </Text>
      </View>
      <ChevronRight size={24} color="#64748b" />
    </TouchableOpacity>
  );

  if (selectedStudent) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedStudent(null)}
        >
          <Text style={styles.backButtonText}>← Volver a la lista</Text>
        </TouchableOpacity>
        <StudentDetail student={selectedStudent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  },
  backButton: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  infoContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
    paddingLeft: 8,
  },
  guardianContainer: {
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  interventionContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  interventionDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  interventionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  interventionDescription: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  interventionOutcome: {
    fontSize: 14,
    color: '#2563eb',
    fontStyle: 'italic',
  },
});