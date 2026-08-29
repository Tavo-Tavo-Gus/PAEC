import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, RefreshCw, Wrench } from 'lucide-react-native';
import { useDatabaseSecurity } from '@/hooks/useDatabaseSecurity';
import { colors } from '@/constants/colors';

export function SecurityDashboard() {
  const { 
    report, 
    loading, 
    error, 
    generateReport, 
    fixSearchPaths, 
    getRecommendations 
  } = useDatabaseSecurity();

  if (loading && !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generando reporte de seguridad...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generateReport}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return null;
  }

  const recommendations = getRecommendations();
  const { summary } = report;

  const getSecurityScore = () => {
    if (summary.totalFunctions === 0) return 100;
    return Math.round((summary.secureFunctions / summary.totalFunctions) * 100);
  };

  const getSecurityLevel = () => {
    const score = getSecurityScore();
    if (score >= 90) return { level: 'EXCELENTE', color: '#10b981' };
    if (score >= 70) return { level: 'BUENO', color: '#f59e0b' };
    if (score >= 50) return { level: 'REGULAR', color: '#f97316' };
    return { level: 'CRÍTICO', color: colors.error };
  };

  const securityLevel = getSecurityLevel();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield size={32} color={colors.primary} />
        <Text style={styles.title}>Dashboard de Seguridad</Text>
      </View>

      {/* Security Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Puntuación de Seguridad</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: securityLevel.color }]}>
            {getSecurityScore()}%
          </Text>
          <Text style={[styles.scoreLevel, { color: securityLevel.color }]}>
            {securityLevel.level}
          </Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <CheckCircle size={24} color="#10b981" />
          <Text style={styles.summaryNumber}>{summary.secureFunctions}</Text>
          <Text style={styles.summaryLabel}>Seguras</Text>
        </View>

        <View style={styles.summaryCard}>
          <AlertTriangle size={24} color={colors.error} />
          <Text style={styles.summaryNumber}>{summary.vulnerableFunctions}</Text>
          <Text style={styles.summaryLabel}>Vulnerables</Text>
        </View>

        <View style={styles.summaryCard}>
          <RefreshCw size={24} color="#f59e0b" />
          <Text style={styles.summaryNumber}>{summary.needsReview}</Text>
          <Text style={styles.summaryLabel}>Revisar</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]} 
          onPress={generateReport}
          disabled={loading}
        >
          <RefreshCw size={20} color="white" />
          <Text style={styles.primaryButtonText}>
            {loading ? 'Actualizando...' : 'Actualizar Reporte'}
          </Text>
        </TouchableOpacity>

        {summary.vulnerableFunctions > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.warningButton]} 
            onPress={fixSearchPaths}
            disabled={loading}
          >
            <Wrench size={20} color="white" />
            <Text style={styles.warningButtonText}>
              Corregir Automáticamente
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recomendaciones</Text>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Function Details */}
      <View style={styles.functionsContainer}>
        <Text style={styles.sectionTitle}>Funciones Detectadas</Text>
        {report.functionAudit.map((func, index) => (
          <View key={index} style={styles.functionItem}>
            <View style={styles.functionHeader}>
              <Text style={styles.functionName}>{func.function_name}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(func.security_status) }
              ]}>
                <Text style={styles.statusText}>{func.security_status}</Text>
              </View>
            </View>
            <Text style={styles.functionSchema}>Schema: {func.schema_name}</Text>
            <Text style={styles.functionPath}>
              Search Path: {func.search_path_value}
            </Text>
            {func.is_security_definer && (
              <Text style={styles.securityDefiner}>🔒 SECURITY DEFINER</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'SECURE': return '#10b981';
    case 'VULNERABLE': return colors.error;
    case 'NEEDS_REVIEW': return '#f59e0b';
    default: return '#6b7280';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  scoreCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLevel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  warningButton: {
    backgroundColor: colors.error,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  warningButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  recommendationItem: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  functionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  functionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
  },
  functionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  functionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  functionSchema: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  functionPath: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  securityDefiner: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
});