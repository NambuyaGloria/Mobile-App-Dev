import { Platform } from 'react-native';

// Lazy load Constants to avoid initialization errors
let Constants = null;
try {
  Constants = require('expo-constants').default;
} catch (e) {
  // Constants not available - will use fallback
}

// Function to extract IP address from various sources
function getApiUrl() {
  try {
    if (Platform.OS === 'web') {
      // For web, use localhost
      return process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:8080/api';
    }

    // For native devices, try multiple methods to get the API URL
    
    // Method 1: Use tunnel URL if available (best for any device)
    if (process.env.EXPO_PUBLIC_API_URL_TUNNEL) {
      return process.env.EXPO_PUBLIC_API_URL_TUNNEL;
    }
    
    // Method 2: Use environment variable if set
    if (process.env.EXPO_PUBLIC_API_URL_NATIVE) {
      return process.env.EXPO_PUBLIC_API_URL_NATIVE;
    }
    
    // Method 3: Try to extract IP from Expo Constants
    if (Constants) {
      try {
        const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri || Constants?.manifest2?.extra?.expoGo?.hostUri;
        
        if (hostUri) {
          // Extract IP from hostUri (format: "192.168.1.100:8081" or "exp://192.168.1.100:8081")
          const ipMatch = hostUri.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            const ip = ipMatch[1];
            const apiUrl = `http://${ip}:8080/api`;
            return apiUrl;
          }
        }
        
        // Method 4: Try debuggerHost
        const debuggerHost = Constants?.expoConfig?.debuggerHost || Constants?.manifest?.debuggerHost || Constants?.manifest2?.extra?.expoGo?.debuggerHost;
        if (debuggerHost && debuggerHost !== 'localhost' && debuggerHost !== '127.0.0.1') {
          const ip = debuggerHost.split(':')[0];
          const apiUrl = `http://${ip}:8080/api`;
          return apiUrl;
        }
      } catch (constantsError) {
        // Silently fail and use fallback
      }
    }
    
    // Method 5: Fallback
    return 'http://192.168.172.232:8080/api';
  } catch (error) {
    // Ultimate fallback
    return 'http://localhost:8080/api';
  }
}

const API_URL = getApiUrl();

// Only log in development
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('📱 Platform:', Platform.OS);
  console.log('🔗 API_URL:', API_URL);
}

export default API_URL;
