// Main Application Controller for FundFound Platform
// Handles navigation, initialization, and core functionality

const App = {
    // Application state
    state: {
        currentUser: null,
        currentSection: 'home',
        businessIdeas: [],
        filteredIdeas: [],
        isAuthenticated: false,
        loading: false
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
        fundingFilter: null
    },

    // Application initialization
    init() {
        console.log('Initializing FundFound Application...');

        this.cacheElements();
        this.bindEvents();
        this.initializeAuth();
        this.initializeNavigation();
        this.loadBusinessIdeas();
        this.initializeSearch();

        console.log('Application initialized successfully');
    },

    // Cache DOM elements for better performance
    cacheElements() {
        this.elements = {
            sections: Utils.querySelectorAll('.section'),
            navLinks: Utils.querySelectorAll('.nav-link'),
            authButtons: Utils.getElementById('authButtons'),
            userMenu: Utils.getElementById('userMenu'),
            mobileMenuToggle: Utils.getElementById('mobileMenuToggle'),
            navMenu: Utils.getElementById('navMenu'),
            header: Utils.getElementById('mainHeader'),
            businessGrid: Utils.getElementById('businessGrid'),
            loadMoreBtn: Utils.getElementById('loadMoreBtn'),
            searchInput: Utils.getElementById('searchInput'),
            categoryFilter: Utils.getElementById('categoryFilter'),
            fundingFilter: Utils.getElementById('fundingFilter')
        };
    },

    // Bind event listeners
    bindEvents() {
        // Navigation events
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Mobile menu toggle
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Header scroll effect
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // Contact form submission
        const contactForm = Utils.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Search and filter events
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input',
                Utils.debounce(this.handleSearch.bind(this), 300)
            );
        }

        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.addEventListener('change', this.handleFilter.bind(this));
        }

        if (this.elements.fundingFilter) {
            this.elements.fundingFilter.addEventListener('change', this.handleFilter.bind(this));
        }

        // Load more button
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.addEventListener('click', this.loadMoreIdeas.bind(this));
        }

        // Window resize events
        window.addEventListener('resize', Utils.debounce(this.handleResize.bind(this), 250));

        // Click outside to close dropdowns
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    },

    // Initialize authentication state
}
