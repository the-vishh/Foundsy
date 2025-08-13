// Banking Module for FundFound Platform
// Handles banking-specific functionality and loan management

const Banker = {
  // Banking module state
  state: {
    loanApplications: [],
    filteredApplications: [],
    currentApplication: null,
    isProcessing: false,
    filters: {
      status: "",
      amount: "",
      category: "",
    },
  },

  // DOM elements cache
  elements: {
    applicationsGrid: null,
    filterSelects: null,
    applicationModal: null,
    loanCalculator: null,
  },

  // Initialize banking module
  init() {
    console.log("Initializing Banking Module...");

    this.cacheElements();
    this.bindEvents();

    // Only load if user is a banker
    if (
      window.App &&
      window.App.state.currentUser &&
      window.App.state.currentUser.userType === "banker"
    ) {
      this.loadLoanApplications();
    }

    console.log("Banking Module initialized successfully");
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      applicationsGrid: Utils?.getElementById("loanApplicationsGrid"),
      filterSelects: Utils?.querySelectorAll(".loan-filter"),
      applicationModal: Utils?.getElementById("loanApplicationModal"),
      loanCalculator: Utils?.getElementById("loanCalculator"),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Filter change events
    if (this.elements.filterSelects) {
      this.elements.filterSelects.forEach((filter) => {
        filter.addEventListener("change", this.handleFilterChange.bind(this));
      });
    }

    // Application actions
    document.addEventListener("click", (e) => {
      if (e.target.matches(".review-application-btn")) {
        const applicationId = e.target.dataset.applicationId;
        this.reviewApplication(applicationId);
      }

      if (e.target.matches(".approve-loan-btn")) {
        const applicationId = e.target.dataset.applicationId;
        this.approveLoan(applicationId);
      }

      if (e.target.matches(".reject-loan-btn")) {
        const applicationId = e.target.dataset.applicationId;
        this.rejectLoan(applicationId);
      }
    });
  },

  // Load loan applications
  async loadLoanApplications() {
    try {
      this.state.isProcessing = true;

      // Mock data for now - replace with Firebase call when ready
      const mockApplications = [
        {
          id: "1",
          applicantId: "user123",
          applicantName: "John Doe",
          businessName: "Tech Startup",
          loanAmount: 500000,
          purpose: "Equipment purchase",
          status: "pending",
          submittedAt: new Date(),
          documents: ["business_plan.pdf", "financial_statements.pdf"],
        },
        {
          id: "2",
          applicantId: "user456",
          applicantName: "Jane Smith",
          businessName: "E-commerce Store",
          loanAmount: 1000000,
          purpose: "Inventory expansion",
          status: "under_review",
          submittedAt: new Date(),
          documents: ["business_plan.pdf", "tax_returns.pdf"],
        },
      ];

      this.state.loanApplications = mockApplications;
      this.state.filteredApplications = [...mockApplications];
      this.renderApplications();
    } catch (error) {
      console.error("Error loading loan applications:", error);
      this.renderError("Failed to load loan applications");
    } finally {
      this.state.isProcessing = false;
    }
  },

  // Render applications grid
  renderApplications() {
    if (!this.elements.applicationsGrid) return;

    if (this.state.filteredApplications.length === 0) {
      this.renderEmptyState();
      return;
    }

    const applicationsHTML = this.state.filteredApplications
      .map((app) => this.createApplicationCard(app))
      .join("");

    this.elements.applicationsGrid.innerHTML = applicationsHTML;
  },

  // Create application card HTML
  createApplicationCard(application) {
    const statusClass = `status-${application.status.replace("_", "-")}`;
    const formattedAmount = this.formatCurrency(application.loanAmount);
    const timeAgo = this.timeAgo(application.submittedAt);

    return `
      <div class="application-card" data-id="${application.id}">
        <div class="application-header">
          <h3 class="applicant-name">${application.applicantName}</h3>
          <span class="application-status ${statusClass}">
            ${this.formatStatus(application.status)}
          </span>
        </div>
        <div class="application-content">
          <div class="business-info">
            <p class="business-name">${application.businessName}</p>
            <p class="loan-amount">${formattedAmount}</p>
          </div>
          <div class="loan-details">
            <p class="loan-purpose">${application.purpose}</p>
            <p class="submitted-time">Submitted ${timeAgo}</p>
          </div>
          <div class="documents-count">
            <i data-lucide="file-text"></i>
            ${application.documents.length} documents
          </div>
        </div>
        <div class="application-actions">
          <button class="btn btn-outline btn-small review-application-btn"
                  data-application-id="${application.id}">
            <i data-lucide="eye"></i>
            Review
          </button>
          ${
            application.status === "pending"
              ? `
            <button class="btn btn-success btn-small approve-loan-btn"
                    data-application-id="${application.id}">
              <i data-lucide="check"></i>
              Approve
            </button>
            <button class="btn btn-danger btn-small reject-loan-btn"
                    data-application-id="${application.id}">
              <i data-lucide="x"></i>
              Reject
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;
  },

  // Handle filter changes
  handleFilterChange() {
    // Collect filter values
    this.state.filters.status =
      Utils?.getElementById("statusFilter")?.value || "";
    this.state.filters.amount =
      Utils?.getElementById("amountFilter")?.value || "";
    this.state.filters.category =
      Utils?.getElementById("categoryFilter")?.value || "";

    // Apply filters
    this.applyFilters();
    this.renderApplications();
  },

  // Apply filters to applications
  applyFilters() {
    let filtered = [...this.state.loanApplications];

    // Status filter
    if (this.state.filters.status) {
      filtered = filtered.filter(
        (app) => app.status === this.state.filters.status
      );
    }

    // Amount filter
    if (this.state.filters.amount) {
      const [min, max] = this.parseAmountRange(this.state.filters.amount);
      filtered = filtered.filter((app) => {
        return app.loanAmount >= min && (max === null || app.loanAmount <= max);
      });
    }

    this.state.filteredApplications = filtered;
  },

  // Review application
  async reviewApplication(applicationId) {
    const application = this.state.loanApplications.find(
      (app) => app.id === applicationId
    );
    if (!application) return;

    this.state.currentApplication = application;
    this.showApplicationModal(application);
  },

  // Approve loan
  async approveLoan(applicationId) {
    try {
      this.state.isProcessing = true;

      // Mock approval - replace with Firebase call
      const application = this.state.loanApplications.find(
        (app) => app.id === applicationId
      );
      if (application) {
        application.status = "approved";
        application.approvedAt = new Date();
      }

      this.renderApplications();

      if (Utils?.showSuccess) {
        Utils.showSuccess("Loan application approved successfully");
      }
    } catch (error) {
      console.error("Error approving loan:", error);
      if (Utils?.showError) {
        Utils.showError("Failed to approve loan application");
      }
    } finally {
      this.state.isProcessing = false;
    }
  },

  // Reject loan
  async rejectLoan(applicationId) {
    try {
      this.state.isProcessing = true;

      // Mock rejection - replace with Firebase call
      const application = this.state.loanApplications.find(
        (app) => app.id === applicationId
      );
      if (application) {
        application.status = "rejected";
        application.rejectedAt = new Date();
      }

      this.renderApplications();

      if (Utils?.showSuccess) {
        Utils.showSuccess("Loan application rejected");
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
      if (Utils?.showError) {
        Utils.showError("Failed to reject loan application");
      }
    } finally {
      this.state.isProcessing = false;
    }
  },

  // Show application modal
  showApplicationModal(application) {
    console.log("Showing application modal for:", application);
    // Implementation for showing detailed application modal
  },

  // Render empty state
  renderEmptyState() {
    if (!this.elements.applicationsGrid) return;

    this.elements.applicationsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i data-lucide="file-x"></i>
        </div>
        <h3>No loan applications found</h3>
        <p>There are no loan applications matching your current filters.</p>
      </div>
    `;
  },

  // Render error state
  renderError(message) {
    if (!this.elements.applicationsGrid) return;

    this.elements.applicationsGrid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">
          <i data-lucide="alert-circle"></i>
        </div>
        <h3>Error</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="Banker.loadLoanApplications()">
          Try Again
        </button>
      </div>
    `;
  },

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  },

  formatStatus(status) {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  },

  timeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  },

  parseAmountRange(range) {
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
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if banker functionality is needed
  if (window.App && typeof Utils !== "undefined") {
    Banker.init();
  }
});

// Export for use in other modules
window.Banker = Banker;
