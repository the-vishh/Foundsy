// Fixed Main Application Controller for FundFound Platform
// Handles navigation, initialization, and core functionality with proper mobile responsiveness

const App = {
  // Application state
  state: {
    currentUser: null,
    currentSection: "home",
    businessIdeas: [],
    filteredIdeas: [],
    isAuthenticated: false,
    loading: false,
    currentPage: 1,
    itemsPerPage: 9,
    isMobileMenuOpen: false,
  },

  // DOM elements cache
  elements: {
    sections: null,
    navLinks: null,
    authButtons: null,
    userMenu: null,
    mobileMenuToggle: null,
    navMenu: null,
    header: null,
    businessGrid: null,
    loadMoreBtn: null,
    searchInput: null,
    categoryFilter: null,
    fundingFilter: null,
  },

  // Application initialization
  init() {
    console.log("Initializing FundFound Application...");

    this.cacheElements();
    this.bindEvents();
    this.initializeAuth();
    this.initializeNavigation();
    // this.loadBusinessIdeas(); // Removed auto-loading to prevent unwanted modals
    this.initializeSearch();
    this.handleInitialResize();

    console.log("Application initialized successfully");
  },

  // Cache DOM elements for better performance
  cacheElements() {
    this.elements = {
      sections: Utils.querySelectorAll(".section"),
      navLinks: Utils.querySelectorAll(".nav-link"),
      authButtons: Utils.getElementById("authButtons"),
      userMenu: Utils.getElementById("userMenu"),
      mobileMenuToggle: Utils.getElementById("mobileMenuToggle"),
      navMenu: Utils.getElementById("navMenu"),
      header: Utils.getElementById("mainHeader"),
      businessGrid: Utils.getElementById("businessGrid"),
      loadMoreBtn: Utils.getElementById("loadMoreBtn"),
      searchInput: Utils.getElementById("searchInput"),
      categoryFilter: Utils.getElementById("categoryFilter"),
      fundingFilter: Utils.getElementById("fundingFilter"),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Navigation events
    this.elements.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section =
          link.dataset.section || link.getAttribute("href").replace("#", "");
        if (section) {
          this.navigateToSection(section);
          this.closeMobileMenu(); // Close mobile menu after navigation
        }
      });
    });

    // Mobile menu toggle - FIXED
    if (this.elements.mobileMenuToggle) {
      this.elements.mobileMenuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Header scroll effect
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // Contact form submission
    const contactForm = Utils.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", this.handleContactForm.bind(this));
    }

    // Search and filter events
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener(
        "input",
        Utils.debounce(this.handleSearch.bind(this), 300)
      );
    }

    if (this.elements.categoryFilter) {
      this.elements.categoryFilter.addEventListener(
        "change",
        this.handleFilter.bind(this)
      );
    }

    if (this.elements.fundingFilter) {
      this.elements.fundingFilter.addEventListener(
        "change",
        this.handleFilter.bind(this)
      );
    }

    // Load more button
    if (this.elements.loadMoreBtn) {
      this.elements.loadMoreBtn.addEventListener(
        "click",
        this.loadMoreIdeas.bind(this)
      );
    }

    // Window resize events - IMPROVED
    window.addEventListener(
      "resize",
      Utils.debounce(this.handleResize.bind(this), 100)
    );

    // Click outside to close dropdowns - IMPROVED
    document.addEventListener("click", this.handleOutsideClick.bind(this));

    // Touch events for mobile interactions
    this.bindTouchEvents();
  },

  // NEW: Bind touch events for better mobile experience
  bindTouchEvents() {
    // Enable touch scrolling on mobile
    if ("ontouchstart" in window) {
      document.body.style.webkitOverflowScrolling = "touch";
    }

    // Prevent zoom on double tap for form inputs
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      function (event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );
  },

  // NEW: Handle initial resize to set proper states
  handleInitialResize() {
    this.handleResize();

    // Ensure mobile menu is closed on desktop
    if (window.innerWidth > 991) {
      this.closeMobileMenu();
    }
  },

  // Initialize authentication state
  initializeAuth() {
    // Listen for authentication state changes
    if (typeof FirebaseService !== "undefined") {
      FirebaseService.onAuthStateChanged((user) => {
        if (user) {
          this.handleUserSignedIn(user);
        } else {
          this.handleUserSignedOut();
        }
      });
    }
  },

  // Handle user signed in
  async handleUserSignedIn(user) {
    try {
      this.state.isAuthenticated = true;

      // Get user profile data (mock for now since Firebase isn't connected)
      // const profileResult = await FirebaseService.getUserProfile(user.uid);

      // Mock user data for testing
      this.state.currentUser = {
        uid: user.uid || "test-uid",
        email: user.email || "test@example.com",
        emailVerified: user.emailVerified || false,
        userType: "business",
        profile: {
          firstName: "John",
          lastName: "Doe",
        },
      };

      this.updateUIForAuthenticatedUser();
      this.loadUserSpecificContent();
    } catch (error) {
      console.error("Error handling user sign in:", error);
      Utils.showError("Authentication error occurred");
    }
  },

  // Handle user signed out
  handleUserSignedOut() {
    this.state.isAuthenticated = false;
    this.state.currentUser = null;
    this.updateUIForUnauthenticatedUser();

    // Navigate to home if on protected pages
    if (
      ["dashboard", "profile", "settings"].includes(this.state.currentSection)
    ) {
      this.navigateToSection("home");
    }
  },

  // Update UI for authenticated user
  updateUIForAuthenticatedUser() {
    // Hide auth buttons, show user menu
    Utils.hide(this.elements.authButtons);
    Utils.show(this.elements.userMenu);

    // Update user display
    this.updateUserDisplay();

    // Show dashboard link in navigation if not visible
    this.updateNavigationForUser();
  },

  // Update UI for unauthenticated user
  updateUIForUnauthenticatedUser() {
    // Show auth buttons, hide user menu
    Utils.show(this.elements.authButtons);
    Utils.hide(this.elements.userMenu);

    // Hide user dropdown if open
    const userDropdown = Utils.getElementById("userDropdown");
    Utils.hide(userDropdown);

    // Update navigation
    this.updateNavigationForGuest();
  },

  // Update user display in header
  updateUserDisplay() {
    if (!this.state.currentUser) return;

    const userName = Utils.getElementById("userName");
    const userType = Utils.getElementById("userType");
    const avatarText = Utils.getElementById("avatarText");
    const avatarImg = Utils.getElementById("avatarImg");

    if (userName && this.state.currentUser.profile) {
      const fullName = `${this.state.currentUser.profile.firstName} ${this.state.currentUser.profile.lastName}`;
      userName.textContent = fullName;
    }

    if (userType) {
      userType.textContent = Utils.formatUserType(
        this.state.currentUser.userType
      );
    }

    if (avatarText && this.state.currentUser.profile) {
      const initials = `${this.state.currentUser.profile.firstName[0]}${this.state.currentUser.profile.lastName[0]}`;
      avatarText.textContent = initials.toUpperCase();
    }

    // Handle avatar image if available
    if (
      this.state.currentUser.profile &&
      this.state.currentUser.profile.avatar &&
      avatarImg
    ) {
      avatarImg.src = this.state.currentUser.profile.avatar;
      Utils.show(avatarImg);
      Utils.hide(avatarText);
    }
  },

  // Initialize navigation
  initializeNavigation() {
    // Set active section based on URL hash
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      this.navigateToSection(hash);
    }

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      const section = window.location.hash.replace("#", "") || "home";
      this.navigateToSection(section, false);
    });
  },

  // Navigate to section - IMPROVED
  navigateToSection(sectionName, updateHistory = true) {
    // Validate section exists
    const targetSection = Utils.getElementById(sectionName);
    if (!targetSection) {
      console.warn(`Section ${sectionName} not found`);
      return;
    }

    // Check if section requires authentication
    const protectedSections = ["dashboard", "profile", "settings"];
    if (
      protectedSections.includes(sectionName) &&
      !this.state.isAuthenticated
    ) {
      Utils.showWarning("Please sign in to access this page");
      if (typeof showAuthModal === "function") {
        showAuthModal("login");
      }
      return;
    }

    // Hide all sections
    this.elements.sections.forEach((section) => {
      Utils.removeClass(section, "active");
    });

    // Show target section
    Utils.addClass(targetSection, "active");

    // Update navigation active state
    this.updateActiveNavLink(sectionName);

    // Update state
    this.state.currentSection = sectionName;

    // Update URL
    if (updateHistory) {
      window.history.pushState({}, "", `#${sectionName}`);
    }

    // Load section-specific content
    this.loadSectionContent(sectionName);

    // Close mobile menu if open
    this.closeMobileMenu();

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // Update active navigation link
  updateActiveNavLink(sectionName) {
    this.elements.navLinks.forEach((link) => {
      Utils.removeClass(link, "active");
      if (
        link.dataset.section === sectionName ||
        link.getAttribute("href") === `#${sectionName}`
      ) {
        Utils.addClass(link, "active");
      }
    });
  },

  // Load section-specific content
  loadSectionContent(sectionName) {
    switch (sectionName) {
      case "browse":
        this.loadBusinessIdeas();
        break;
      case "dashboard":
        this.loadDashboard();
        break;
      case "profile":
        this.loadProfile();
        break;
      default:
        // Re-initialize icons for the section
        if (window.lucide) {
          setTimeout(() => lucide.createIcons(), 100);
        }
        break;
    }
  },

  // Load business ideas - IMPROVED with better error handling
  async loadBusinessIdeas() {
    if (!this.elements.businessGrid) return;

    try {
      this.state.loading = true;
      this.showBusinessGridLoading();

      // Mock data for testing (replace with actual Firebase call)
      const mockIdeas = [
        {
          id: "1",
          title: "AI-Powered Healthcare Platform",
          category: "technology",
          description:
            "Revolutionary healthcare platform using AI to improve patient outcomes and reduce costs.",
          fundingNeeded: 5000000,
          timeline: "18 months",
          status: "published",
          createdAt: new Date(),
          authorId: "user1",
        },
        {
          id: "2",
          title: "Sustainable Food Delivery",
          category: "ecommerce",
          description:
            "Eco-friendly food delivery service with zero-waste packaging and local sourcing.",
          fundingNeeded: 2000000,
          timeline: "12 months",
          status: "published",
          createdAt: new Date(),
          authorId: "user2",
        },
        {
          id: "3",
          title: "EdTech Learning Platform",
          category: "education",
          description:
            "Interactive learning platform for K-12 students with personalized curriculum.",
          fundingNeeded: 3000000,
          timeline: "24 months",
          status: "published",
          createdAt: new Date(),
          authorId: "user3",
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.state.businessIdeas = mockIdeas;
      this.state.filteredIdeas = [...mockIdeas];
      this.renderBusinessIdeas();
      this.updateLoadMoreButton();
    } catch (error) {
      console.error("Error loading business ideas:", error);
      Utils.showError("Failed to load business ideas");
      this.renderBusinessIdeasError();
    } finally {
      this.state.loading = false;
    }
  },

  // Show loading state for business grid
  showBusinessGridLoading() {
    if (!this.elements.businessGrid) return;

    this.elements.businessGrid.innerHTML = `
      <div class="loading-grid">
        ${Array(6)
          .fill()
          .map(
            () => `
            <div class="business-card-skeleton">
              <div class="skeleton skeleton-image"></div>
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-button"></div>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  },

  // Render business ideas - FIXED
  renderBusinessIdeas() {
    if (!this.elements.businessGrid || !this.state.filteredIdeas) return;

    if (this.state.filteredIdeas.length === 0) {
      this.renderBusinessIdeasEmpty();
      return;
    }

    this.elements.businessGrid.innerHTML = this.state.filteredIdeas
      .map((idea) => this.createBusinessIdeaCard(idea))
      .join("");

    // Re-initialize icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  },

  // Create business idea card HTML - IMPROVED
  createBusinessIdeaCard(idea) {
    const fundingAmount = Utils.formatCurrency(idea.fundingNeeded);
    const timeAgo = Utils.timeAgo(idea.createdAt);
    const category = Utils.capitalizeFirst(idea.category);

    // Check if current user is authenticated and not the author
    const currentUser = auth?.currentUser;
    const isAuthor = currentUser && currentUser.uid === idea.authorId;
    const isInvestor = currentUser && currentUser.userType === "investor";

    return `
      <div class="business-card" data-id="${idea.id}">
        <div class="business-card-header">
          <div class="business-category">${category}</div>
          <div class="business-funding">${fundingAmount}</div>
        </div>
        <div class="business-card-content">
          <h3 class="business-title">${idea.title}</h3>
          <p class="business-description">${Utils.truncateText(
            idea.description,
            120
          )}</p>
          <div class="business-meta">
            <span class="business-timeline">
              <i data-lucide="clock"></i>
              ${idea.timeline}
            </span>
            <span class="business-time">
              <i data-lucide="calendar"></i>
              ${timeAgo}
            </span>
          </div>
        </div>
        <div class="business-card-footer">
          <button class="btn btn-outline btn-small" onclick="viewBusinessIdea('${
            idea.id
          }')">
            <i data-lucide="eye"></i>
            View Details
          </button>
          
          ${!isAuthor ? `
            <button class="btn btn-outline btn-small save-idea-btn" data-idea-id="${idea.id}">
              <i data-lucide="bookmark-plus"></i>
              Save
            </button>
          ` : ""}
          
          ${
            !isAuthor && isInvestor
              ? `
              <button class="btn btn-success btn-small invest-btn" data-idea-id="${idea.id}">
                <i data-lucide="trending-up"></i>
                Invest
              </button>
            `
              : ""
          }
        </div>
      </div>
    `;
  },

  // Render empty state
  renderBusinessIdeasEmpty() {
    this.elements.businessGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i data-lucide="search-x"></i>
        </div>
        <h3>No business ideas found</h3>
        <p>Try adjusting your search filters or check back later for new opportunities.</p>
        <button class="btn btn-outline" onclick="App.clearFilters()">
          Clear Filters
        </button>
      </div>
    `;

    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  },

  // Render error state
  renderBusinessIdeasError() {
    this.elements.businessGrid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">
          <i data-lucide="alert-circle"></i>
        </div>
        <h3>Failed to load business ideas</h3>
        <p>Something went wrong while loading the content. Please try again.</p>
        <button class="btn btn-primary" onclick="App.loadBusinessIdeas()">
          <i data-lucide="refresh-cw"></i>
          Retry
        </button>
      </div>
    `;

    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  },

  // Initialize search functionality
  initializeSearch() {
    // Load saved search state
    const savedSearch = Utils.getFromStorage("searchState");
    if (savedSearch) {
      if (this.elements.searchInput) {
        this.elements.searchInput.value = savedSearch.query || "";
      }
      if (this.elements.categoryFilter) {
        this.elements.categoryFilter.value = savedSearch.category || "";
      }
      if (this.elements.fundingFilter) {
        this.elements.fundingFilter.value = savedSearch.funding || "";
      }
    }
  },

  // Handle search input
  handleSearch() {
    const query = this.elements.searchInput
      ? this.elements.searchInput.value.trim()
      : "";
    this.applyFilters({ query });
  },

  // Handle filter changes
  handleFilter() {
    const category = this.elements.categoryFilter
      ? this.elements.categoryFilter.value
      : "";
    const funding = this.elements.fundingFilter
      ? this.elements.fundingFilter.value
      : "";
    this.applyFilters({ category, funding });
  },

  // Apply filters to business ideas
  applyFilters(newFilters = {}) {
    const query =
      newFilters.query !== undefined
        ? newFilters.query
        : this.elements.searchInput
        ? this.elements.searchInput.value.trim()
        : "";
    const category =
      newFilters.category !== undefined
        ? newFilters.category
        : this.elements.categoryFilter
        ? this.elements.categoryFilter.value
        : "";
    const funding =
      newFilters.funding !== undefined
        ? newFilters.funding
        : this.elements.fundingFilter
        ? this.elements.fundingFilter.value
        : "";

    let filtered = [...this.state.businessIdeas];

    // Apply search query
    if (query) {
      filtered = Utils.searchInArray(filtered, query, [
        "title",
        "description",
        "category",
      ]);
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter((idea) => idea.category === category);
    }

    // Apply funding filter
    if (funding) {
      const [min, max] = this.parseFundingRange(funding);
      filtered = filtered.filter((idea) => {
        const amount = idea.fundingNeeded;
        return amount >= min && (max === null || amount <= max);
      });
    }

    this.state.filteredIdeas = filtered;
    this.renderBusinessIdeas();

    // Save search state
    Utils.saveToStorage("searchState", { query, category, funding });

    // Update URL parameters
    Utils.updateUrlParams({ search: query, category, funding });
  },

  // Parse funding range string
  parseFundingRange(range) {
    switch (range) {
      case "0-100000":
        return [0, 100000];
      case "100000-1000000":
        return [100000, 1000000];
      case "1000000-10000000":
        return [1000000, 10000000];
      case "10000000+":
        return [10000000, null];
      default:
        return [0, null];
    }
  },

  // Clear all filters
  clearFilters() {
    if (this.elements.searchInput) this.elements.searchInput.value = "";
    if (this.elements.categoryFilter) this.elements.categoryFilter.value = "";
    if (this.elements.fundingFilter) this.elements.fundingFilter.value = "";

    this.state.filteredIdeas = [...this.state.businessIdeas];
    this.renderBusinessIdeas();

    Utils.removeFromStorage("searchState");
    Utils.updateUrlParams({ search: "", category: "", funding: "" });
  },

  // Load more ideas
  loadMoreIdeas() {
    this.state.currentPage++;
    this.loadBusinessIdeas();
  },

  // Update load more button
  updateLoadMoreButton() {
    if (!this.elements.loadMoreBtn) return;

    const totalLoaded = this.state.filteredIdeas.length;
    const totalAvailable = this.state.businessIdeas.length;

    if (
      totalLoaded >= totalAvailable ||
      totalAvailable <= this.state.itemsPerPage
    ) {
      Utils.hide(this.elements.loadMoreBtn);
    } else {
      Utils.show(this.elements.loadMoreBtn);
    }
  },

  // Load user-specific content
  loadUserSpecificContent() {
    if (!this.state.currentUser) return;

    // Load content based on user type
    switch (this.state.currentUser.userType) {
      case "business":
        this.loadEntrepreneurContent();
        break;
      case "investor":
        this.loadInvestorContent();
        break;
      case "banker":
        this.loadBankerContent();
        break;
      case "advisor":
        this.loadAdvisorContent();
        break;
    }
  },

  // FIXED: Mobile menu toggle functionality
  toggleMobileMenu() {
    if (!this.elements.navMenu || !this.elements.mobileMenuToggle) return;

    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;

    if (this.state.isMobileMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  },

  // FIXED: Open mobile menu
  openMobileMenu() {
    if (!this.elements.navMenu) return;

    this.state.isMobileMenuOpen = true;

    // Add classes for mobile menu
    Utils.addClass(this.elements.navMenu, "mobile-open");
    Utils.addClass(this.elements.navMenu, "active");
    Utils.addClass(document.body, "menu-open");
    Utils.addClass(this.elements.mobileMenuToggle, "active");

    // Update toggle icon
    const icon = this.elements.mobileMenuToggle.querySelector("[data-lucide]");
    if (icon) {
      icon.setAttribute("data-lucide", "x");
      if (window.lucide) {
        lucide.createIcons();
      }
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  },

  // FIXED: Close mobile menu
  closeMobileMenu() {
    if (!this.elements.navMenu) return;

    this.state.isMobileMenuOpen = false;

    // Remove classes for mobile menu
    Utils.removeClass(this.elements.navMenu, "mobile-open");
    Utils.removeClass(this.elements.navMenu, "active");
    Utils.removeClass(document.body, "menu-open");
    Utils.removeClass(this.elements.mobileMenuToggle, "active");

    // Update toggle icon
    const icon = this.elements.mobileMenuToggle.querySelector("[data-lucide]");
    if (icon) {
      icon.setAttribute("data-lucide", "menu");
      if (window.lucide) {
        lucide.createIcons();
      }
    }

    // Restore body scroll
    document.body.style.overflow = "";
  },

  // IMPROVED: Handle scroll events
  handleScroll() {
    const scrollY = window.scrollY;

    // Header scroll effect with better performance
    if (this.elements.header) {
      if (scrollY > 50) {
        Utils.addClass(this.elements.header, "scrolled");
      } else {
        Utils.removeClass(this.elements.header, "scrolled");
      }
    }

    // Close mobile menu on scroll (mobile UX improvement)
    if (this.state.isMobileMenuOpen && window.innerWidth <= 991) {
      this.closeMobileMenu();
    }
  },

  // Handle contact form submission
  async handleContactForm(e) {
    e.preventDefault();

    const form = e.target;
    const formData = Utils.getFormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
      Utils.showLoading(submitBtn, "Sending...");

      // Simulate form submission (replace with actual implementation)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Utils.showSuccess(
        "Message sent successfully! We'll get back to you soon."
      );
      Utils.clearForm(form);
    } catch (error) {
      console.error("Contact form error:", error);
      Utils.showError("Failed to send message. Please try again.");
    } finally {
      Utils.hideLoading(submitBtn);
    }
  },

  // IMPROVED: Handle window resize
  handleResize() {
    const width = window.innerWidth;

    // Close mobile menu on desktop
    if (width > 991 && this.state.isMobileMenuOpen) {
      this.closeMobileMenu();
    }

    // Update mobile menu state
    if (width <= 991) {
      // Ensure mobile menu toggle is visible
      if (this.elements.mobileMenuToggle) {
        this.elements.mobileMenuToggle.style.display = "flex";
      }
    } else {
      // Hide mobile menu toggle on desktop
      if (this.elements.mobileMenuToggle) {
        this.elements.mobileMenuToggle.style.display = "none";
      }

      // Ensure nav menu is visible on desktop
      if (this.elements.navMenu) {
        Utils.removeClass(this.elements.navMenu, "mobile-open");
        Utils.removeClass(this.elements.navMenu, "active");
      }
    }

    // Trigger re-render of responsive elements
    this.triggerResponsiveUpdates();
  },

  // NEW: Trigger responsive updates
  triggerResponsiveUpdates() {
    // Re-initialize any dynamic content that needs responsive updates
    if (this.state.currentSection === "browse" && this.elements.businessGrid) {
      const cards =
        this.elements.businessGrid.querySelectorAll(".business-card");
      cards.forEach((card, index) => {
        // Add a small delay to create staggered animation
        card.style.animationDelay = `${index * 0.1}s`;
      });
    }
  },

  // IMPROVED: Handle clicks outside elements
  handleOutsideClick(e) {
    // Close user dropdown if clicking outside
    const userDropdown = Utils.getElementById("userDropdown");
    const userAvatar = Utils.getElementById("userAvatar");

    if (
      userDropdown &&
      !userDropdown.contains(e.target) &&
      userAvatar &&
      !userAvatar.contains(e.target)
    ) {
      Utils.hide(userDropdown);
    }

    // Close mobile menu if clicking outside (improved logic)
    if (
      this.state.isMobileMenuOpen &&
      this.elements.navMenu &&
      this.elements.mobileMenuToggle &&
      !this.elements.navMenu.contains(e.target) &&
      !this.elements.mobileMenuToggle.contains(e.target)
    ) {
      this.closeMobileMenu();
    }
  },

  // Load dashboard
  loadDashboard() {
    if (!this.state.isAuthenticated) return;
    console.log("Loading dashboard...");
  },

  // Load profile
  loadProfile() {
    if (!this.state.isAuthenticated) return;
    console.log("Loading user profile...");
  },

  // Load user type specific content
  loadEntrepreneurContent() {
    console.log("Loading entrepreneur content...");
  },

  loadInvestorContent() {
    console.log("Loading investor content...");
  },

  loadBankerContent() {
    console.log("Loading banker content...");
  },

  loadAdvisorContent() {
    console.log("Loading advisor content...");
  },

  // Update navigation for authenticated user
  updateNavigationForUser() {
    // Add dashboard link if not present
    console.log("Updating navigation for authenticated user");
  },

  // Update navigation for guest user
  updateNavigationForGuest() {
    // Remove user-specific navigation items
    console.log("Updating navigation for guest user");
  },
};

// Global functions for HTML onclick handlers
window.navigateToSection = (section) => {
  App.navigateToSection(section);
};

window.toggleUserDropdown = () => {
  const dropdown = Utils.getElementById("userDropdown");
  Utils.toggle(dropdown);
};

window.logout = async () => {
  try {
    if (typeof FirebaseService !== "undefined") {
      const result = await FirebaseService.signOut();
      if (result.success) {
        Utils.showSuccess("Signed out successfully");
      }
    } else {
      // Mock logout for testing
      App.handleUserSignedOut();
      Utils.showSuccess("Signed out successfully");
    }
  } catch (error) {
    console.error("Logout error:", error);
    Utils.showError("Failed to sign out");
  }
};

window.viewBusinessIdea = (ideaId) => {
  console.log("Viewing business idea:", ideaId);
  Utils.showInfo(`Viewing business idea: ${ideaId}`);
};

window.showInvestmentModal = (ideaId) => {
  console.log("Showing investment modal for:", ideaId);
  Utils.showInfo(`Opening investment modal for idea: ${ideaId}`);
};

window.hideToast = () => {
  Utils.hideToast();
};

// Export App for global access
window.App = App;

