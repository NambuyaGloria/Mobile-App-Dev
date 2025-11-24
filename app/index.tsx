import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    // Navigate to login after a short delay
    const timer = setTimeout(() => {
      try {
        router.replace('/login');
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        setTimeout(() => {
          try {
            router.push('/login');
          } catch (e) {
            console.error('Fallback navigation also failed:', e);
          }
        }, 500);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Glovo</Text>
        <Text style={styles.tagline}>Order anything, delivered fast</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A082',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 18,
    opacity: 0.8,
    color: '#FFC244',
  },
});
