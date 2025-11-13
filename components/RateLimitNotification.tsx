import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface RateLimitNotificationProps {
  visible: boolean;
  message: string;
  type?: 'warning' | 'error' | 'info';
  retryAfter?: number;
  onHide?: () => void;
  onRetry?: () => void;
}

export function RateLimitNotification({ 
  visible, 
  message, 
  type = 'warning',
  retryAfter,
  onHide,
  onRetry 
}: RateLimitNotificationProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (visible) {
      if (retryAfter) {
        setCountdown(Math.ceil(retryAfter / 1000));
      }
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(retryAfter || 4000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }
  }, [visible, fadeAnim, onHide, retryAfter]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!visible) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          iconColor: '#dc2626',
          textColor: '#dc2626',
        };
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          iconColor: '#2563eb',
          textColor: '#2563eb',
        };
      default:
        return {
          backgroundColor: '#fffbeb',
          borderColor: '#fed7aa',
          iconColor: '#d97706',
          textColor: '#d97706',
        };
    }
  };

  const notificationStyle = getNotificationStyle();
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[
        styles.notification,
        {
          backgroundColor: notificationStyle.backgroundColor,
          borderColor: notificationStyle.borderColor,
        }
      ]}>
        <AlertTriangle size={20} color={notificationStyle.iconColor} />
        <View style={styles.content}>
          <Text style={[styles.message, { color: notificationStyle.textColor }]}>
            {message}
          </Text>
          {countdown > 0 && (
            <Text style={[styles.countdown, { color: notificationStyle.textColor }]}>
              Reintentando en {countdown}s
            </Text>
          )}
        </View>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={[styles.retryText, { color: notificationStyle.iconColor }]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
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
  content: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
  countdown: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  retryButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});