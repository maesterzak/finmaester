# Troubleshooting Firebase Errors

## Common Errors and Solutions

### Firebase: Error (auth/argument-error)

This error typically occurs when:

1. **Firebase configuration is missing or invalid**
   - **Solution**: Check your `.env.local` file and ensure all Firebase environment variables are set:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```
   - **Important**: Replace placeholder values with your actual Firebase configuration values
   - **Note**: After updating `.env.local`, restart your development server

2. **Empty or null arguments passed to Firebase functions**
   - **Solution**: Ensure all required fields are filled before submitting forms
   - Check that email and password fields are not empty

3. **Firebase not initialized on server-side**
   - **Solution**: This is now handled automatically. Firebase only initializes on the client-side.

### How to Verify Your Configuration

1. **Check if `.env.local` exists**:
   ```bash
   # In your project root
   ls -la .env.local
   # or on Windows
   dir .env.local
   ```

2. **Verify environment variables are loaded**:
   - Open browser console
   - Check for any Firebase initialization errors
   - Look for messages about missing configuration

3. **Test Firebase connection**:
   - Go to Firebase Console
   - Check if your project is active
   - Verify authentication methods are enabled

### Step-by-Step Fix

1. **Create/Update `.env.local` file**:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

2. **Get your Firebase config**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" section
   - Click on your web app or add a new one
   - Copy the configuration values

3. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

4. **Clear browser cache** (if needed):
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache

### Other Common Errors

#### auth/unauthorized-domain
- **Cause**: Your domain is not authorized in Firebase
- **Solution**: 
  - Go to Firebase Console > Authentication > Settings > Authorized domains
  - Add `localhost` for development
  - Add your production domain when deploying

#### auth/invalid-email
- **Cause**: Email format is invalid
- **Solution**: Validate email format before submitting

#### auth/weak-password
- **Cause**: Password is too weak (less than 6 characters)
- **Solution**: Use a password with at least 6 characters

#### auth/user-not-found
- **Cause**: User doesn't exist
- **Solution**: User needs to sign up first

#### auth/wrong-password
- **Cause**: Incorrect password
- **Solution**: Check password or use password reset

### Debugging Tips

1. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for error messages
   - Check Network tab for failed requests

2. **Check Firebase Console**:
   - Go to Authentication > Users
   - Verify users are being created
   - Check for any error logs

3. **Verify Firestore rules**:
   - Go to Firestore Database > Rules
   - Ensure rules allow authenticated users

4. **Test with console.log**:
   ```javascript
   // In your component
   console.log('Firebase config:', {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
   })
   ```

### Still Having Issues?

1. **Verify Firebase is installed**:
   ```bash
   npm list firebase
   ```

2. **Reinstall Firebase**:
   ```bash
   npm uninstall firebase
   npm install firebase --legacy-peer-deps
   ```

3. **Check Node version**:
   ```bash
   node --version
   ```
   Should be Node 18 or higher

4. **Check Next.js version**:
   ```bash
   npm list next
   ```

### Getting Help

If you're still experiencing issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide
3. Check Firebase Console for error logs
4. Verify all environment variables are correct
5. Ensure your Firebase project is active and billing is enabled (if required)


