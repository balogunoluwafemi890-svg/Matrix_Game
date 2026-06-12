# Firebase Leaderboard Setup

The Matrix Checkers game uses Firebase Firestore for its shared leaderboard, so all players can see the same rankings across different devices and platforms.

## One-Time Setup (5 minutes)

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `matrix-checkers-game` (or any name you prefer)
4. Disable Google Analytics (not needed) and click **Create project**

### Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location close to your users (e.g., `us-central1`)
5. Click **Done**

### Step 3: Create a Web App & Get Config

1. In Firebase Console, click the **gear icon → Project settings**
2. Under **Your apps**, click the **Web icon** (`</>`) to add a web app
3. Register app with nickname: `Matrix Checkers`
4. **Do NOT** check "Firebase Hosting"
5. Click **Register app**
6. Copy the `firebaseConfig` object shown

### Step 4: Update the Game Config

Open `game.js` and find the `firebaseConfig` variable near the top. Replace it with your actual config:

```javascript
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Add Firestore Security Rules

1. In Firebase Console, go to **Firestore Database → Rules**
2. Replace the rules with the contents of `firestore.rules` from this folder
3. Click **Publish**

### Step 6: Create Composite Index

After the first player submits a score, Firestore will require a composite index. You can create it manually:

1. Go to **Firestore Database → Indexes**
2. Click **Create Index**
3. Collection: `leaderboard`
4. Fields: `score` (Descending), `levelsCompleted` (Descending)
5. Click **Create**

Or wait for the error link in the Firebase Console and click it to auto-create.

## That's it!

The game will now sync scores across all devices. If Firebase is unavailable, it automatically falls back to localStorage for offline use.
