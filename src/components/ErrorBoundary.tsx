import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { consentStore } from '../services/consentStore';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, errorMessage: '' });
  };

  handleReset = () => {
    consentStore.eraseAllDataAndReset();
    this.props.onReset?.();
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <View style={styles.indicatorBadge}>
              <Text style={styles.indicatorText}>!</Text>
            </View>
            <Text style={styles.title}>Application recovery</Text>
            <Text style={styles.description}>
              TransitWake encountered a temporary rendering exception. You can reload the app or
              clear local state to resume transit monitoring.
            </Text>
            {this.state.errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.errorMessage}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={this.handleReload}
              accessibilityRole="button"
              accessibilityLabel="Retry loading application"
            >
              <Text style={styles.retryBtnText}>Reload application</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="Reset all data and restart app"
            >
              <Text style={styles.resetBtnText}>Erase local data and reset</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  indicatorBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  indicatorText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  errorText: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  retryBtn: {
    width: '100%',
    minHeight: 44,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  resetBtn: {
    width: '100%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
});
