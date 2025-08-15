rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other user profiles
    }

    // Business ideas - public read, authenticated write
    match /businessIdeas/{ideaId} {
      allow read: if true; // Anyone can read business ideas
      allow write: if request.auth != null;
    }

    // Investment proposals - only involved parties can access
    match /investmentProposals/{proposalId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.investorId ||
         request.auth.uid == resource.data.authorId);
    }

    // Other collections for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
