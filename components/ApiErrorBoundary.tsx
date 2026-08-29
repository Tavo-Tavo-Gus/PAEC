import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { rateLimitHandler } from '@/lib/errorHandler';
import { RateLimitNotification } from './RateLimitNotification';
import { colors } from '@/constants/colors';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRateLimited: boolean;
  retryAfter: number | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRateLimited: false,
      retryAfter: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const isRateLimited = rateLimitHandler.isRateLimitError(error);
    const retryAfter = isRateLimited ? rateLimitHandler.getRetryAfter(error) : null;

    return {
      hasError: true,
      error,
      isRateLimited,
      retryAfter,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      isRateLimited: false,
      retryAfter: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      if (this.state.isRateLimited) {
        return (
          <View style={styles.container}>
            <RateLimitNotification
              visible={true}
              message={rateLimitHandler.createUserMessage(this.state.error)}
              type="error"
              retryAfter={this.state.retryAfter || undefined}
              onRetry={this.handleRetry}
              onHide={() => {}}
            />
            <View style={styles.content}>
              <Text style={styles.title}>Límite de solicitudes excedido</Text>
              <Text style={styles.message}>
                {rateLimitHandler.createUserMessage(this.state.error)}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Error de conexión</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
});