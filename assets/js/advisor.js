// Advisory Module for FundFound Platform
// Handles business advisor functionality and consultation management

const Advisor = {
  // Advisory module state
  state: {
    clients: [],
    consultations: [],
    appointments: [],
    knowledgeBase: [],
    currentClient: null,
    isProcessing: false,
    filters: {
      status: "",
      category: "",
      dateRange: "",
    },
  },

  // DOM elements cache
  elements: {
    clientsGrid: null,
    consultationsGrid: null,
    appointmentCalendar: null,
    knowledgeBaseGrid: null,
    consultationModal: null,
  },

  // Initialize advisory module
  init() {
    console.log("Initializing Advisory Module...");

    this.cacheElements();
    this.bindEvents();

    // Only load if user is an advisor
    if (
      window.App &&
      window.App.state.currentUser &&
      window.App.state.currentUser.userType === "advisor"
    ) {
      this.loadAdvisorData();
    }

    console.log("Advisory Module initialized successfully");
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      clientsGrid: Utils?.getElementById("clientsGrid"),
      consultationsGrid: Utils?.getElementById("consultationsGrid"),
      appointmentCalendar: Utils?.getElementById("appointmentCalendar"),
      knowledgeBaseGrid: Utils?.getElementById("knowledgeBaseGrid"),
      consultationModal: Utils?.getElementById("consultationModal"),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Consultation actions
    document.addEventListener("click", (e) => {
      if (e.target.matches(".schedule-consultation-btn")) {
        const clientId = e.target.dataset.clientId;
        this.scheduleConsultation(clientId);
      }

      if (e.target.matches(".view-client-btn")) {
        const clientId = e.target.dataset.clientId;
        this.viewClientDetails(clientId);
      }

      if (e.target.matches(".complete-consultation-btn")) {
        const consultationId = e.target.dataset.consultationId;
        this.completeConsultation(consultationId);
      }

      if (e.target.matches(".add-knowledge-btn")) {
        this.showKnowledgeModal();
      }
    });

    // Filter change events
    const filterSelects = Utils?.querySelectorAll(".advisor-filter");
    if (filterSelects) {
      filterSelects.forEach((filter) => {
        filter.addEventListener("change", this.handleFilterChange.bind(this));
      });
    }
  },

  // Load advisor data
  async loadAdvisorData() {
    try {
      this.state.isProcessing = true;

      // Mock data for now - replace with Firebase calls when ready
      await Promise.all([
        this.loadClients(),
        this.loadConsultations(),
        this.loadKnowledgeBase(),
      ]);
    } catch (error) {
      console.error("Error loading advisor data:", error);
      this.renderError("Failed to load advisor data");
    } finally {
      this.state.isProcessing = false;
    }
  },

  // Load clients
  async loadClients() {
    // Mock client data
    const mockClients = [
      {
        id: "client1",
        name: "Alex Johnson",
        company: "TechStart Inc",
        industry: "Technology",
        stage: "Seed",
        joinedAt: new Date("2024-01-15"),
        lastConsultation: new Date("2024-02-01"),
        totalConsultations: 5,
        status: "active",
      },
      {
        id: "client2",
        name: "Sarah Williams",
        company: "EcoGoods",
        industry: "Retail",
        stage: "Series A",
        joinedAt: new Date("2024-01-20"),
        lastConsultation: new Date("2024-01-28"),
        totalConsultations: 3,
        status: "active",
      },
    ];

    this.state.clients = mockClients;
    this.renderClients();
  },

  // Load consultations
  async loadConsultations() {
    // Mock consultation data
    const mockConsultations = [
      {
        id: "consult1",
        clientId: "client1",
        clientName: "Alex Johnson",
        title: "Market Strategy Review",
        scheduledAt: new Date("2024-02-15T10:00:00"),
        duration: 60,
        status: "scheduled",
        notes: "",
        type: "video_call",
      },
      {
        id: "consult2",
        clientId: "client2",
        clientName: "Sarah Williams",
        title: "Financial Planning",
        scheduledAt: new Date("2024-02-12T14:00:00"),
        duration: 90,
        status: "completed",
        notes: "Discussed funding strategy and financial projections",
        type: "in_person",
      },
    ];

    this.state.consultations = mockConsultations;
    this.renderConsultations();
  },

  // Load knowledge base
  async loadKnowledgeBase() {
    // Mock knowledge base data
    const mockKnowledge = [
      {
        id: "kb1",
        title: "Startup Funding Guide",
        category: "Funding",
        content: "Comprehensive guide to startup funding options...",
        tags: ["funding", "startups", "investment"],
        createdAt: new Date("2024-01-01"),
        views: 150,
        likes: 25,
      },
      {
        id: "kb2",
        title: "Market Research Best Practices",
        category: "Research",
        content: "Essential steps for conducting effective market research...",
        tags: ["market research", "analysis", "strategy"],
        createdAt: new Date("2024-01-10"),
        views: 89,
        likes: 12,
      },
    ];

    this.state.knowledgeBase = mockKnowledge;
    this.renderKnowledgeBase();
  },

  // Render clients grid
  renderClients() {
    if (!this.elements.clientsGrid) return;

    if (this.state.clients.length === 0) {
      this.renderEmptyState(this.elements.clientsGrid, "clients");
      return;
    }

    const clientsHTML = this.state.clients
      .map((client) => this.createClientCard(client))
      .join("");

    this.elements.clientsGrid.innerHTML = clientsHTML;
  },

  // Create client card HTML
  createClientCard(client) {
    const statusClass = `status-${client.status}`;
    const timeAgo = this.timeAgo(client.lastConsultation);

    return `
      <div class="client-card" data-id="${client.id}">
        <div class="client-header">
          <div class="client-avatar">
            ${client.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div class="client-info">
            <h3 class="client-name">${client.name}</h3>
            <p class="client-company">${client.company}</p>
            <span class="client-status ${statusClass}">${client.status}</span>
          </div>
        </div>
        <div class="client-details">
          <div class="detail-item">
            <span class="detail-label">Industry:</span>
            <span class="detail-value">${client.industry}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Stage:</span>
            <span class="detail-value">${client.stage}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Sessions:</span>
            <span class="detail-value">${client.totalConsultations}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Last Session:</span>
            <span class="detail-value">${timeAgo}</span>
          </div>
        </div>
        <div class="client-actions">
          <button class="btn btn-outline btn-small view-client-btn"
                  data-client-id="${client.id}">
            <i data-lucide="user"></i>
            View Details
          </button>
          <button class="btn btn-primary btn-small schedule-consultation-btn"
                  data-client-id="${client.id}">
            <i data-lucide="calendar-plus"></i>
            Schedule Session
          </button>
        </div>
      </div>
    `;
  },

  // Render consultations
  renderConsultations() {
    if (!this.elements.consultationsGrid) return;

    if (this.state.consultations.length === 0) {
      this.renderEmptyState(this.elements.consultationsGrid, "consultations");
      return;
    }

    const consultationsHTML = this.state.consultations
      .map((consultation) => this.createConsultationCard(consultation))
      .join("");

    this.elements.consultationsGrid.innerHTML = consultationsHTML;
  },

  // Create consultation card HTML
  createConsultationCard(consultation) {
    const statusClass = `status-${consultation.status}`;
    const formattedDate = this.formatDateTime(consultation.scheduledAt);

    return `
      <div class="consultation-card" data-id="${consultation.id}">
        <div class="consultation-header">
          <h3 class="consultation-title">${consultation.title}</h3>
          <span class="consultation-status ${statusClass}">
            ${this.formatStatus(consultation.status)}
          </span>
        </div>
        <div class="consultation-details">
          <div class="detail-row">
            <i data-lucide="user"></i>
            <span>${consultation.clientName}</span>
          </div>
          <div class="detail-row">
            <i data-lucide="calendar"></i>
            <span>${formattedDate}</span>
          </div>
          <div class="detail-row">
            <i data-lucide="clock"></i>
            <span>${consultation.duration} minutes</span>
          </div>
          <div class="detail-row">
            <i data-lucide="video"></i>
            <span>${this.formatConsultationType(consultation.type)}</span>
          </div>
        </div>
        ${
          consultation.notes
            ? `
          <div class="consultation-notes">
            <h4>Notes:</h4>
            <p>${consultation.notes}</p>
          </div>
        `
            : ""
        }
        <div class="consultation-actions">
          ${
            consultation.status === "scheduled"
              ? `
            <button class="btn btn-success btn-small complete-consultation-btn"
                    data-consultation-id="${consultation.id}">
              <i data-lucide="check"></i>
              Mark Complete
            </button>
          `
              : ""
          }
          <button class="btn btn-outline btn-small view-consultation-btn"
                  data-consultation-id="${consultation.id}">
            <i data-lucide="eye"></i>
            View Details
          </button>
        </div>
      </div>
    `;
  },

  // Render knowledge base
  renderKnowledgeBase() {
    if (!this.elements.knowledgeBaseGrid) return;

    if (this.state.knowledgeBase.length === 0) {
      this.renderEmptyState(this.elements.knowledgeBaseGrid, "knowledge base");
      return;
    }

    const knowledgeHTML = this.state.knowledgeBase
      .map((item) => this.createKnowledgeCard(item))
      .join("");

    this.elements.knowledgeBaseGrid.innerHTML = knowledgeHTML;
  },

  // Create knowledge base card HTML
  createKnowledgeCard(item) {
    return `
      <div class="knowledge-card" data-id="${item.id}">
        <div class="knowledge-header">
          <h3 class="knowledge-title">${item.title}</h3>
          <span class="knowledge-category">${item.category}</span>
        </div>
        <div class="knowledge-content">
          <p>${this.truncateText(item.content, 120)}</p>
        </div>
        <div class="knowledge-tags">
          ${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="knowledge-stats">
          <span class="stat">
            <i data-lucide="eye"></i>
            ${item.views} views
          </span>
          <span class="stat">
            <i data-lucide="heart"></i>
            ${item.likes} likes
          </span>
        </div>
        <div class="knowledge-actions">
          <button class="btn btn-outline btn-small edit-knowledge-btn"
                  data-knowledge-id="${item.id}">
            <i data-lucide="edit"></i>
            Edit
          </button>
          <button class="btn btn-primary btn-small view-knowledge-btn"
                  data-knowledge-id="${item.id}">
            <i data-lucide="eye"></i>
            View
          </button>
        </div>
      </div>
    `;
  },

  // Schedule consultation
  async scheduleConsultation(clientId) {
    console.log("Scheduling consultation for client:", clientId);
    // Implementation for scheduling consultation
    this.showScheduleModal(clientId);
  },

  // View client details
  async viewClientDetails(clientId) {
    const client = this.state.clients.find((c) => c.id === clientId);
    if (!client) return;

    this.state.currentClient = client;
    console.log("Viewing client details:", client);
    // Implementation for showing client details modal
  },

  // Complete consultation
  async completeConsultation(consultationId) {
    try {
      const consultation = this.state.consultations.find(
        (c) => c.id === consultationId
      );
      if (!consultation) return;

      consultation.status = "completed";
      consultation.completedAt = new Date();

      this.renderConsultations();

      if (Utils?.showSuccess) {
        Utils.showSuccess("Consultation marked as completed");
      }
    } catch (error) {
      console.error("Error completing consultation:", error);
      if (Utils?.showError) {
        Utils.showError("Failed to complete consultation");
      }
    }
  },

  // Show schedule modal
  showScheduleModal(clientId) {
    console.log("Showing schedule modal for client:", clientId);
    // Implementation for schedule modal
  },

  // Show knowledge modal
  showKnowledgeModal() {
    console.log("Showing knowledge base modal");
    // Implementation for knowledge modal
  },

  // Handle filter changes
  handleFilterChange() {
    // Implementation for filtering
    console.log("Handling filter change");
  },

  // Render empty state
  renderEmptyState(container, type) {
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i data-lucide="inbox"></i>
        </div>
        <h3>No ${type} found</h3>
        <p>You don't have any ${type} yet.</p>
      </div>
    `;
  },

  // Render error state
  renderError(message) {
    console.error("Advisor error:", message);
    if (Utils?.showError) {
      Utils.showError(message);
    }
  },

  // Utility functions
  formatDateTime(date) {
    return (
      date.toLocaleDateString("en-IN") +
      " at " +
      date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  },

  formatStatus(status) {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  },

  formatConsultationType(type) {
    const types = {
      video_call: "Video Call",
      phone_call: "Phone Call",
      in_person: "In Person",
      email: "Email",
    };
    return types[type] || type;
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

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if advisor functionality is needed
  if (window.App && typeof Utils !== "undefined") {
    Advisor.init();
  }
});

// Export for use in other modules
window.Advisor = Advisor;
