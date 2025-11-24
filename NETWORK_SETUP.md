# Network Setup Guide - Make App Work with Any Device

This guide explains how to make your Glovo app work with any device that scans the QR code, regardless of IP address.

## Option 1: Use Expo Tunnel Mode (Recommended for Easy Setup)

Expo's tunnel mode creates a public URL that works from anywhere, even if devices are on different networks.

### Steps:

1. **Start Expo with tunnel mode:**
   ```bash
   cd frontend
   npm run start:tunnel
   ```
   Or manually:
   ```bash
   expo start --tunnel
   ```

2. **For the backend API**, you'll need to use a tunnel service like ngrok (see Option 2 below)

3. **Scan the QR code** - It will work from any device, anywhere!

## Option 2: Use Ngrok for Backend (Works with Any Device)

Ngrok creates a public URL for your local backend server.

### Steps:

1. **Install ngrok:**
   - Download from: https://ngrok.com/download
   - Or use: `npm install -g ngrok`

2. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 8080
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update frontend/.env:**
   ```
   EXPO_PUBLIC_API_URL_TUNNEL=https://abc123.ngrok.io/api
   EXPO_PUBLIC_API_URL_NATIVE=https://abc123.ngrok.io/api
   ```

6. **Restart Expo:**
   ```bash
   cd frontend
   npm start
   ```

Now any device can scan the QR code and connect!

## Option 3: Auto-Detect IP (Current Implementation)

The app now automatically detects the IP address from Expo's connection info. This works when:
- Devices are on the same Wi-Fi network
- Expo is running in LAN mode

### How it works:
- The app extracts the IP from Expo's `hostUri`
- No manual configuration needed
- Works automatically when devices are on the same network

## Option 4: Manual IP Configuration

If auto-detection doesn't work:

1. **Find your computer's IP address:**
   - Windows: Run `ipconfig` and look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig` or `ip addr`

2. **Update frontend/.env:**
   ```
   EXPO_PUBLIC_API_URL_NATIVE=http://YOUR_IP_ADDRESS:8080/api
   ```

3. **Restart Expo**

## Troubleshooting

### "Failed to fetch" errors:
- Make sure backend is running: `cd backend && npm start`
- Check backend is on port 8080
- Verify firewall allows connections on port 8080

### Auto-detection not working:
- Check console logs for "API_URL:" message
- Use tunnel mode or ngrok for best compatibility
- Set `EXPO_PUBLIC_API_URL_NATIVE` manually in `.env`

### Devices on different networks:
- Use Option 1 (Expo tunnel) + Option 2 (ngrok for backend)
- This creates public URLs that work from anywhere

## Recommended Setup for Maximum Compatibility

**Best for development with multiple devices:**
1. Start backend: `cd backend && npm start`
2. Start ngrok: `ngrok http 8080`
3. Add ngrok URL to `frontend/.env`: `EXPO_PUBLIC_API_URL_TUNNEL=https://your-ngrok-url.ngrok.io/api`
4. Start Expo with tunnel: `cd frontend && npm run start:tunnel`
5. Scan QR code from any device, anywhere!



