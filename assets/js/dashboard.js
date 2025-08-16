// Dashboard functionality for Foundsy Platform
// This file handles the dashboard interface and user interactions

// Dashboard state management
const Dashboard = {
  currentUser: null,
  isInitialized: false,
  currentSection: 'overview',
  
  // Initialize dashboard
  init() {
    console.log('Initializing Dashboard...');
    
    // Only initialize if user is authenticated
    if (typeof auth !== 'undefined' && auth.currentUser) {
      this.currentUser = auth.currentUser;
      this.setupDashboard();
      this.isInitialized = true;
    } else {
      console.log('Dashboard: User not authenticated, skipping initialization');
    }
  },

  // Setup dashboard interface
  setupDashboard() {
    console.log('Setting up dashboard interface...');
    
    // Load dashboard content only when dashboard section is actually accessed
    this.bindEvents();
    
    // Don't load content automatically - wait for user to navigate to dashboard
    console.log('Dashboard setup complete - content will load on navigation');
  },

  // Bind dashboard events
  bindEvents() {
    // Dashboard navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-dashboard-section]')) {
        e.preventDefault();
        const section = e.target.dataset.dashboardSection;
        this.showSection(section);
      }
    });

    // Business idea form submission
    const businessIdeaForm = document.getElementById('businessIdeaForm');
    if (businessIdeaForm) {
      businessIdeaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBusinessIdeaSubmission(e);
      });
    }
  },

  // Show specific dashboard section
  showSection(sectionName) {
    console.log('Showing dashboard section:', sectionName);
    this.currentSection = sectionName;
    
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetSection) {
      targetSection.classList.add('active');
      this.loadSectionContent(sectionName);
    }
  },

  // Load content for specific section
  loadSectionContent(sectionName) {
    console.log('Loading content for section:', sectionName);
    
    switch (sectionName) {
      case 'overview':
        this.loadOverview();
        break;
      case 'business-ideas':
        this.loadBusinessIdeas();
        break;
      case 'investments':
        this.loadInvestments();
        break;
      case 'profile':
        this.loadProfile();
        break;
      default:
        console.log('Unknown section:', sectionName);
    }
  },

  // Load overview section
  loadOverview() {
    console.log('Loading overview section...');
    // Load user stats and recent activity
  },

  // Load business ideas section
  loadBusinessIdeas() {
    console.log('Loading business ideas section...');
    // Load user's business ideas
  },

  // Load investments section
  loadInvestments() {
    console.log('Loading investments section...');
    // Load user's investment portfolio
  },

  // Load profile section
  loadProfile() {
    console.log('Loading profile section...');
    // Load user profile information
  },

  // Handle business idea form submission
  handleBusinessIdeaSubmission(event) {
    console.log('Handling business idea submission...');
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Process form data and submit to Firebase
    // This will be implemented when the business posting system is ready
  }
};

// Dashboard action functions (placeholder implementations)
window.showAddBusinessIdeaModal = () => {
  if (typeof BusinessIdeaManager !== "undefined") {
    BusinessIdeaManager.showBusinessIdeaModal();
  } else {
    console.error("BusinessIdeaManager not loaded");
    Utils.showError("Business idea posting system not available");
  }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard: DOM loaded, checking authentication...');
  
  // Wait for Firebase to initialize
  if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Dashboard: User authenticated, initializing...');
        Dashboard.init();
      } else {
        console.log('Dashboard: User not authenticated');
      }
    });
  } else {
    console.log('Dashboard: Firebase auth not available yet');
  }
});

// Export for use in other modules
window.Dashboard = Dashboard;
