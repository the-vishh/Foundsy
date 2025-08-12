// Firebase Configuration for FundFound Platform
// This file initializes Firebase services and provides configuration

// Firebase configuration object
const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "your-api-key-here",
  authDomain: "fundfound-project.firebaseapp.com",
  projectId: "fundfound-project",
  storageBucket: "fundfound-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore collections references
const Collections = {
  USERS: "users",
  BUSINESS_IDEAS: "businessIdeas",
  INVESTMENT_PROPOSALS: "investmentProposals",
  LOAN_APPLICATIONS: "loanApplications",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
};

// User types enum
const UserTypes = {
  ENTREPRENEUR: "business",
  INVESTOR: "investor",
  BANKER: "banker",
  ADVISOR: "advisor",
};

// Status enums
const Status = {
  BUSINESS_IDEA: {
    DRAFT: "draft",
    PUBLISHED: "published",
    FUNDED: "funded",
    CLOSED: "closed",
  },
  PROPOSAL: {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    NEGOTIATING: "negotiating",
  },
  LOAN: {
    PENDING: "pending",
    UNDER_REVIEW: "under_review",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
};

// Firebase service functions
const FirebaseService = {
  // Authentication helpers
  async signUp(email, password, userData) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await user.sendEmailVerification();

      // Create user profile in Firestore
      await this.createUserProfile(user.uid, userData);

      return {
        success: true,
        user,
        message:
          "Account created successfully! Please check your email for verification.",
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // Update last login
      await this.updateUserProfile(user.uid, {
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, user };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      await auth.signOut();
      return { success: true, message: "Signed out successfully" };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  },

  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message };
    }
  },

  // User profile management
  async createUserProfile(uid, userData) {
    try {
      const userProfile = {
        email: userData.email,
        userType: userData.userType,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          company: userData.company || "",
          location: userData.location,
          avatar: "",
        },
        isVerified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection(Collections.USERS).doc(uid).set(userProfile);
      return userProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  },

  async getUserProfile(uid) {
    try {
      const doc = await db.collection(Collections.USERS).doc(uid).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: "User profile not found" };
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      return { success: false, error: error.message };
    }
  },

  async updateUserProfile(uid, updateData) {
    try {
      await db
        .collection(Collections.USERS)
        .doc(uid)
        .update({
          ...updateData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }
  },

  // Business Ideas management
  async createBusinessIdea(ideaData) {
    try {
      const idea = {
        ...ideaData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        interestedInvestors: [],
        status: Status.BUSINESS_IDEA.DRAFT,
      };

      const docRef = await db.collection(Collections.BUSINESS_IDEAS).add(idea);
      return {
        success: true,
        id: docRef.id,
        message: "Business idea created successfully",
      };
    } catch (error) {
      console.error("Error creating business idea:", error);
      return { success: false, error: error.message };
    }
  },

  async getBusinessIdeas(filters = {}) {
    try {
      let query = db.collection(Collections.BUSINESS_IDEAS);

      // Apply filters
      if (filters.category) {
        query = query.where("category", "==", filters.category);
      }
      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }
      if (filters.authorId) {
        query = query.where("authorId", "==", filters.authorId);
      }

      // Order by creation date
      query = query.orderBy("createdAt", "desc");

      // Limit results
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      const ideas = [];

      snapshot.forEach((doc) => {
        ideas.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: ideas };
    } catch (error) {
      console.error("Error getting business ideas:", error);
      return { success: false, error: error.message };
    }
  },

  async updateBusinessIdea(ideaId, updateData) {
    try {
      await db
        .collection(Collections.BUSINESS_IDEAS)
        .doc(ideaId)
        .update({
          ...updateData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      return { success: true, message: "Business idea updated successfully" };
    } catch (error) {
      console.error("Error updating business idea:", error);
      return { success: false, error: error.message };
    }
  },

  // Investment Proposals management
  async createInvestmentProposal(proposalData) {
    try {
      const proposal = {
        ...proposalData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: Status.PROPOSAL.PENDING,
        messages: [],
      };

      const docRef = await db
        .collection(Collections.INVESTMENT_PROPOSALS)
        .add(proposal);

      // Add investor to interested investors list
      await db
        .collection(Collections.BUSINESS_IDEAS)
        .doc(proposalData.businessIdeaId)
        .update({
          interestedInvestors: firebase.firestore.FieldValue.arrayUnion(
            proposalData.investorId
          ),
        });

      return {
        success: true,
        id: docRef.id,
        message: "Investment proposal submitted successfully",
      };
    } catch (error) {
      console.error("Error creating investment proposal:", error);
      return { success: false, error: error.message };
    }
  },

  async getInvestmentProposals(filters = {}) {
    try {
      let query = db.collection(Collections.INVESTMENT_PROPOSALS);

      if (filters.investorId) {
        query = query.where("investorId", "==", filters.investorId);
      }
      if (filters.businessIdeaId) {
        query = query.where("businessIdeaId", "==", filters.businessIdeaId);
      }
      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }

      query = query.orderBy("createdAt", "desc");

      const snapshot = await query.get();
      const proposals = [];

      snapshot.forEach((doc) => {
        proposals.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: proposals };
    } catch (error) {
      console.error("Error getting investment proposals:", error);
      return { success: false, error: error.message };
    }
  },

  // File upload helper
  async uploadFile(file, path) {
    try {
      const storageRef = storage.ref().child(path);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, error: error.message };
    }
  },

  // Real-time listeners
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  },

  onBusinessIdeasChanged(callback, filters = {}) {
    let query = db.collection(Collections.BUSINESS_IDEAS);

    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }

    query = query.orderBy("createdAt", "desc");

    return query.onSnapshot(callback);
  },
};

// Export for use in other modules
window.FirebaseService = FirebaseService;
window.Collections = Collections;
window.UserTypes = UserTypes;
window.Status = Status;
