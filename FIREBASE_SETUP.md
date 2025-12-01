# Firebase Setup Guide

This guide will help you set up Firebase for your expense tracker application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** > **Get started**
2. Enable the following sign-in methods:
   - **Email/Password**: Enable this
   - **Google**: Enable this (you'll need to configure OAuth consent screen)
   - **Phone**: Enable this (requires additional setup)

## Step 3: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
3. Select your preferred location

## Step 4: Set Up Firestore Security Rules

Go to **Firestore Database** > **Rules** and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 5: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General** tab
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration values

## Step 6: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase configuration.

## Step 7: Install Dependencies

If you haven't already, install Firebase:

```bash
npm install firebase --legacy-peer-deps
```

## Step 8: Set Up Google Authentication (Optional)

If you want to enable Google sign-in:

1. Go to **Authentication** > **Sign-in method** > **Google**
2. Enable Google sign-in
3. Add your project's support email
4. Add authorized domains if needed

## Step 9: Set Up Phone Authentication (Optional)

If you want to enable phone sign-in:

1. Go to **Authentication** > **Sign-in method** > **Phone**
2. Enable Phone sign-in
3. Note: Phone authentication requires additional setup and may have costs

## Step 10: Create Firestore Indexes (if needed)

If you encounter query errors, you may need to create composite indexes:

1. Go to **Firestore Database** > **Indexes**
2. Click "Create Index"
3. Create indexes for:
   - Collection: `transactions`
   - Fields: `userId` (Ascending), `date` (Descending)

## Testing

1. Start your development server: `npm run dev`
2. Try signing up with email/password
3. Create some transactions and categories
4. Verify data appears in Firestore Database

## Troubleshooting

- **"Firebase: Error (auth/unauthorized-domain)"**: Add your domain to authorized domains in Firebase Console
- **"Missing or insufficient permissions"**: Check your Firestore security rules
- **"Index required"**: Create the required indexes in Firestore
- **Phone authentication not working**: Ensure reCAPTCHA is properly configured

## Production Considerations

1. Update Firestore security rules for production
2. Set up proper error monitoring
3. Configure Firebase App Check for additional security
4. Set up backup and recovery procedures
5. Monitor usage and costs

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)


