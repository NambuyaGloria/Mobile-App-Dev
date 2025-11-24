import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import Notification from '@/components/notification';
import API_URL from '@/config/api';
import { SafeAreaView } from 'react-native-safe-area-context';

// Glovo brand colors
const GLOVO_YELLOW = '#FFC244';
const GLOVO_GREEN = '#00A082';
const DANGER_RED = '#FF3B30';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333333';
const MEDIUM_GRAY = '#666666';

export default function DashboardScreen() {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    loadUserData();
    checkForSuccessNotifications();
  }, []);

  const checkForSuccessNotifications = async () => {
    try {
      const loginSuccess = await AsyncStorage.getItem('showLoginSuccess');
      const registerSuccess = await AsyncStorage.getItem('showRegisterSuccess');
      
      if (loginSuccess === 'true') {
        await AsyncStorage.removeItem('showLoginSuccess');
        showNotification('Login successful! Welcome back!', 'success');
      } else if (registerSuccess === 'true') {
        await AsyncStorage.removeItem('showRegisterSuccess');
        showNotification('Account created successfully! Welcome to Glovo!', 'success');
      }
    } catch (error) {
      console.error('Error checking success notifications:', error);
    }
  };
  
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const loadUserData = async () => {
    try {
      console.log('Loading user data...');
      console.log('API_URL:', API_URL);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.replace('/login');
        return;
      }

      if (!API_URL) {
        throw new Error('API URL is not configured. Please check your configuration.');
      }

      console.log('Fetching user data from:', `${API_URL}/auth/me`);
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load user data');
      }

      setUserName(data.user.name);
      setUserEmail(data.user.email);
      // Update stored user data
      await AsyncStorage.setItem('userName', data.user.name);
      await AsyncStorage.setItem('userEmail', data.user.email);
      console.log('User data loaded successfully');
    } catch (error: any) {
      console.error('Error loading user data:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      
      const errorMessage = error?.message || 'Failed to load user data. Please login again.';
      showNotification(errorMessage, 'error');
      
      // Clear invalid token
      try {
        await AsyncStorage.removeItem('token');
      } catch (storageError) {
        console.error('Error clearing token:', storageError);
      }
      
      setTimeout(() => {
        try {
          router.replace('/login');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      console.log('Performing logout...');
      
      // Clear all stored data
      try {
        await AsyncStorage.multiRemove(['token', 'userName', 'userEmail', 'userId']);
        console.log('Storage cleared successfully');
      } catch (multiError) {
        // If multiRemove fails, clear individually
        console.log('multiRemove failed, clearing individually...');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userId');
        console.log('Storage cleared individually');
      }
      
      showNotification('Logged out successfully', 'success');
      
      // Redirect immediately
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still redirect even if clearing fails
      router.replace('/login');
    }
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    // Execute logout immediately
    performLogout();
  };

  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting account...');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        showNotification('Not authenticated. Please login again.', 'error');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
        return;
      }

      console.log('Sending delete request to API:', `${API_URL}/auth/me`);
      console.log('Platform:', Platform.OS);
      console.log('Token exists:', !!token);
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to delete account';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
          console.error('Delete error response:', data);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      console.log('Account deleted from server, clearing local storage...');
      
      // Clear all stored data
      try {
        await AsyncStorage.multiRemove(['token', 'userName', 'userEmail', 'userId']);
        console.log('Local storage cleared successfully');
      } catch (multiError) {
        // If multiRemove fails, clear individually
        console.log('multiRemove failed, clearing individually...');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userId');
        console.log('Local storage cleared individually');
      }

      // Show success notification
      showNotification('Account deleted successfully', 'success');
      
      // Wait a moment for notification to show, then redirect
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      let errorMessage = 'Failed to delete account. Please try again.';
      
      // Check for network errors
      if (error?.message?.includes('Network request failed') || 
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('NetworkError')) {
        errorMessage = 'Network error. Make sure your backend is running and your phone is on the same Wi-Fi network.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    console.log('Delete account button clicked');
    console.log('Platform:', Platform.OS);
    
    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      );
      if (confirmed) {
        console.log('User confirmed account deletion (web)');
        performDeleteAccount();
      } else {
        console.log('Delete account cancelled (web)');
      }
    } else {
      // For native platforms, use Alert
      console.log('Showing Alert.alert for native platform');
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('Delete account cancelled');
            },
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              console.log('User confirmed account deletion (native)');
              performDeleteAccount();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GLOVO_GREEN} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Notification
          message={notification.message}
          type={notification.type}
          visible={notification.visible}
          onClose={hideNotification}
          duration={3000}
        />
        
        <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {getInitials(userName)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.userInfo}>
              <ThemedText style={styles.greeting}>Welcome back,</ThemedText>
              <ThemedText style={styles.userName}>{userName}</ThemedText>
              <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>
            </View>
          </View>
        </View>

        {/* Stats Cards Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <ThemedText style={styles.statIcon}>📦</ThemedText>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Orders</ThemedText>
            </View>
            <View style={[styles.statCard, styles.statCardSecondary]}>
              <ThemedText style={styles.statIcon}>⭐</ThemedText>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Rating</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPrimary]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.actionIcon}>🛒</ThemedText>
              <ThemedText style={styles.actionTitle}>Start Order</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Order food & more</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSecondary]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.actionIcon}>📋</ThemedText>
              <ThemedText style={styles.actionTitle}>Order History</ThemedText>
              <ThemedText style={styles.actionSubtitle}>View past orders</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: GLOVO_YELLOW + '20' }]}>
                  <ThemedText style={styles.settingIcon}>🚪</ThemedText>
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingTitle}>Logout</ThemedText>
                  <ThemedText style={styles.settingSubtitle}>Sign out of your account</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.settingArrow}>›</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, isDeleting && styles.settingItemDisabled]}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: DANGER_RED + '20' }]}>
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={DANGER_RED} />
                  ) : (
                    <ThemedText style={styles.settingIcon}>🗑️</ThemedText>
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingTitle}>
                    {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                  </ThemedText>
                  <ThemedText style={styles.settingSubtitle}>Permanently delete your account</ThemedText>
                </View>
              </View>
              {!isDeleting && <ThemedText style={styles.settingArrow}>›</ThemedText>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Delete Confirmation Modal (Fallback for native) */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Delete Account</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot be undone.
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowDeleteModal(false);
                  console.log('Delete account cancelled (modal)');
                }}
              >
                <ThemedText style={styles.modalButtonCancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={async () => {
                  setShowDeleteModal(false);
                  console.log('User confirmed account deletion (modal)');
                  await performDeleteAccount();
                }}
              >
                <ThemedText style={styles.modalButtonDeleteText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: MEDIUM_GRAY,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: GLOVO_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GLOVO_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: MEDIUM_GRAY,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: GLOVO_GREEN,
  },
  statCardSecondary: {
    borderTopWidth: 3,
    borderTopColor: GLOVO_YELLOW,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: GLOVO_GREEN,
  },
  actionCardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: GLOVO_YELLOW,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: MEDIUM_GRAY,
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: MEDIUM_GRAY,
  },
  settingArrow: {
    fontSize: 24,
    color: MEDIUM_GRAY,
    fontWeight: '300',
  },
  footerSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: MEDIUM_GRAY,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: LIGHT_GRAY,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
  },
  modalButtonDelete: {
    backgroundColor: DANGER_RED,
  },
  modalButtonDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
