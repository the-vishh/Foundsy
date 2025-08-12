// Investor Module for FundFound Platform
// Handles investment opportunities, proposals, portfolio management, and investor-specific features

const Investor = {
  // Module state
  state: {
    currentOpportunity: null,
    investmentProposals: [],
    portfolio: [],
    watchlist: [],
    isLoading: false,
    filters: {
      category: "",
      fundingRange: "",
      timeline: "",
      riskLevel: "",
      location: "",
    },
    sortBy: "createdAt",
    sortOrder: "desc",
    viewMode: "grid", // 'grid' or 'list'
  },

  // Investment ranges for filtering
  investmentRanges: [
    { value: "0-100000", label: "₹0 - ₹1L", min: 0, max: 100000 },
    { value: "100000-1000000", label: "₹1L - ₹10L", min: 100000, max: 1000000 },
    {
      value: "1000000-10000000",
      label: "₹10L - ₹1Cr",
      min: 1000000,
      max: 10000000,
    },
    {
      value: "10000000-50000000",
      label: "₹1Cr - ₹5Cr",
      min: 10000000,
      max: 50000000,
    },
    { value: "50000000+", label: "₹5Cr+", min: 50000000, max: null },
  ],

  // Risk levels
  riskLevels: [
    {
      value: "low",
      label: "Low Risk",
      description: "Established businesses with proven track record",
    },
    {
      value: "medium",
      label: "Medium Risk",
      description: "Growing businesses with moderate risk",
    },
    {
      value: "high",
      label: "High Risk",
      description: "Early-stage startups with high growth potential",
    },
  ],

  // DOM elements cache
  elements: {
    opportunitiesGrid: null,
    investmentModal: null,
    proposalModal: null,
    portfolioContainer: null,
    watchlistContainer: null,
    filterContainer: null,
    sortContainer: null,
    viewToggle: null,
  },

  // Initialize investor module
  init() {
    console.log("Initializing Investor Module...");

    this.cacheElements();
    this.bindEvents();
    this.loadInvestmentOpportunities();
    this.loadInvestorPortfolio();
    this.loadWatchlist();
    this.initializeFilters();
    this.setupRealtimeUpdates();

    console.log("Investor Module initialized successfully");
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      opportunitiesGrid: Utils.getElementById("opportunitiesGrid"),
      investmentModal: Utils.getElementById("investmentModal"),
      proposalModal: Utils.getElementById("proposalModal"),
      portfolioContainer: Utils.getElementById("portfolioContainer"),
      watchlistContainer: Utils.getElementById("watchlistContainer"),
      filterContainer: Utils.getElementById("investorFilters"),
      sortContainer: Utils.getElementById("sortContainer"),
      viewToggle: Utils.getElementById("viewToggle"),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Investment proposal form submission
    const proposalForm = Utils.getElementById("proposalForm");
    if (proposalForm) {
      proposalForm.addEventListener(
        "submit",
        this.handleProposalSubmission.bind(this)
      );
    }

    // Filter and sort events
    this.bindFilterEvents();
    this.bindSortEvents();
    this.bindViewToggle();

    // Modal events
    this.bindModalEvents();

    // Keyboard shortcuts
    this.bindKeyboardShortcuts();

    // Scroll events for infinite loading
    window.addEventListener(
      "scroll",
      Utils.debounce(this.handleScroll.bind(this), 250)
    );
  },

  // Bind filter events
  bindFilterEvents() {
    const filterInputs = Utils.querySelectorAll(".filter-input");
    filterInputs.forEach((input) => {
      input.addEventListener("change", this.handleFilterChange.bind(this));
    });

    // Advanced filter toggle
    const advancedFilterToggle = Utils.getElementById("advancedFilterToggle");
    if (advancedFilterToggle) {
      advancedFilterToggle.addEventListener(
        "click",
        this.toggleAdvancedFilters.bind(this)
      );
    }

    // Clear filters button
    const clearFiltersBtn = Utils.getElementById("clearFilters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener(
        "click",
        this.clearAllFilters.bind(this)
      );
    }

    // Save filter preset
    const saveFilterBtn = Utils.getElementById("saveFilter");
    if (saveFilterBtn) {
      saveFilterBtn.addEventListener("click", this.saveFilterPreset.bind(this));
    }
  },

  // Bind sort events
  bindSortEvents() {
    const sortSelect = Utils.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", this.handleSortChange.bind(this));
    }

    // Sort order toggle
    const sortOrderBtn = Utils.getElementById("sortOrderBtn");
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener("click", this.toggleSortOrder.bind(this));
    }
  },

  // Bind view toggle events
  bindViewToggle() {
    const viewToggleButtons = Utils.querySelectorAll(".view-toggle-btn");
    viewToggleButtons.forEach((btn) => {
      btn.addEventListener("click", this.handleViewToggle.bind(this));
    });
  },

  // Bind modal events
  bindModalEvents() {
    // Close modals on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // Modal overlay clicks
    const modals = [this.elements.investmentModal, this.elements.proposalModal];
    modals.forEach((modal) => {
      if (modal) {
        const overlay = modal.querySelector(".modal-overlay");
        if (overlay) {
          overlay.addEventListener("click", () => this.closeModal(modal));
        }
      }
    });
  },

  // Bind keyboard shortcuts
  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Only handle shortcuts when no modal is open and user is on investor page
      if (this.isModalOpen() || !this.isInvestorPage()) return;

      switch (e.key) {
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.focusSearchInput();
          }
          break;
        case "w":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.toggleWatchlistView();
          }
          break;
        case "p":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.togglePortfolioView();
          }
          break;
      }
    });
  },

  // Load investment opportunities
  async loadInvestmentOpportunities() {
    if (!this.elements.opportunitiesGrid) return;

    try {
      this.state.isLoading = true;
      this.showOpportunitiesLoading();

      const filters = {
        status: Status.BUSINESS_IDEA.PUBLISHED,
        ...this.buildFirebaseFilters(),
      };

      const result = await FirebaseService.getBusinessIdeas(filters);

      if (result.success) {
        let opportunities = result.data;

        // Apply client-side filters
        opportunities = this.applyClientFilters(opportunities);

        // Apply sorting
        opportunities = this.applySorting(opportunities);

        this.renderOpportunities(opportunities);
        this.updateOpportunityStats(opportunities);
      } else {
        this.renderOpportunitiesError();
        Utils.showError("Failed to load investment opportunities");
      }
    } catch (error) {
      console.error("Error loading opportunities:", error);
      this.renderOpportunitiesError();
      Utils.showError("Failed to load investment opportunities");
    } finally {
      this.state.isLoading = false;
    }
  },

  // Build Firebase filters from current state
  buildFirebaseFilters() {
    const filters = {};

    if (this.state.filters.category) {
      filters.category = this.state.filters.category;
    }

    return filters;
  },

  // Apply client-side filters
  applyClientFilters(opportunities) {
    let filtered = [...opportunities];

    // Funding range filter
    if (this.state.filters.fundingRange) {
      const range = this.investmentRanges.find(
        (r) => r.value === this.state.filters.fundingRange
      );
      if (range) {
        filtered = filtered.filter((opp) => {
          const funding = opp.fundingNeeded;
          return (
            funding >= range.min && (range.max === null || funding <= range.max)
          );
        });
      }
    }

    // Timeline filter
    if (this.state.filters.timeline) {
      filtered = filtered.filter(
        (opp) =>
          opp.timeline &&
          opp.timeline
            .toLowerCase()
            .includes(this.state.filters.timeline.toLowerCase())
      );
    }

    // Risk level filter (would be calculated based on various factors)
    if (this.state.filters.riskLevel) {
      filtered = filtered.filter((opp) => {
        const calculatedRisk = this.calculateRiskLevel(opp);
        return calculatedRisk === this.state.filters.riskLevel;
      });
    }

    return filtered;
  },

  // Apply sorting to opportunities
  applySorting(opportunities) {
    return opportunities.sort((a, b) => {
      let aValue, bValue;

      switch (this.state.sortBy) {
        case "createdAt":
          aValue = a.createdAt?.toDate?.() || new Date(a.createdAt);
          bValue = b.createdAt?.toDate?.() || new Date(b.createdAt);
          break;
        case "fundingNeeded":
          aValue = a.fundingNeeded;
          bValue = b.fundingNeeded;
          break;
        case "views":
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case "interest":
          aValue = a.interestedInvestors?.length || 0;
          bValue = b.interestedInvestors?.length || 0;
          break;
        default:
          return 0;
      }

      if (this.state.sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  },

  // Calculate risk level for an opportunity
  calculateRiskLevel(opportunity) {
    // This would be a complex algorithm considering various factors
    // For now, simplified calculation based on funding amount and timeline
    const funding = opportunity.fundingNeeded;
    const hasBusinessPlan = !!opportunity.businessPlan;
    const timelineRisk = this.assessTimelineRisk(opportunity.timeline);

    let riskScore = 0;

    // Higher funding generally means higher risk
    if (funding > 10000000) riskScore += 3;
    else if (funding > 1000000) riskScore += 2;
    else riskScore += 1;

    // Business plan reduces risk
    if (hasBusinessPlan) riskScore -= 1;

    // Timeline assessment
    riskScore += timelineRisk;

    if (riskScore <= 2) return "low";
    if (riskScore <= 4) return "medium";
    return "high";
  },

  // Assess timeline risk
  assessTimelineRisk(timeline) {
    if (!timeline) return 2;

    const timelineLower = timeline.toLowerCase();
    if (timelineLower.includes("6 months") || timelineLower.includes("1 year"))
      return 1;
    if (
      timelineLower.includes("2 years") ||
      timelineLower.includes("18 months")
    )
      return 2;
    return 3; // Longer timelines or unclear timelines = higher risk
  },

  // Show opportunities loading state
  showOpportunitiesLoading() {
    if (!this.elements.opportunitiesGrid) return;

    const skeletonCount = this.state.viewMode === "grid" ? 9 : 5;
    const skeletonClass =
      this.state.viewMode === "grid"
        ? "opportunity-card-skeleton"
        : "opportunity-list-skeleton";

    this.elements.opportunitiesGrid.innerHTML = `
            <div class="opportunities-loading">
                ${Array(skeletonCount)
                  .fill()
                  .map(
                    () => `
                    <div class="${skeletonClass}">
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

  // Render opportunities
  renderOpportunities(opportunities) {
    if (!this.elements.opportunitiesGrid) return;

    if (opportunities.length === 0) {
      this.renderOpportunitiesEmpty();
      return;
    }

    const containerClass =
      this.state.viewMode === "grid"
        ? "opportunities-grid"
        : "opportunities-list";

    this.elements.opportunitiesGrid.innerHTML = `
            <div class="${containerClass}">
                ${opportunities
                  .map((opp) => this.createOpportunityCard(opp))
                  .join("")}
            </div>
        `;

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Create opportunity card HTML
  createOpportunityCard(opportunity) {
    const fundingAmount = Utils.formatCurrency(opportunity.fundingNeeded);
    const timeAgo = Utils.timeAgo(opportunity.createdAt);
    const category = Utils.capitalizeFirst(opportunity.category);
    const riskLevel = this.calculateRiskLevel(opportunity);
    const isWatchlisted = this.isInWatchlist(opportunity.id);
    const views = opportunity.views || 0;
    const interest = opportunity.interestedInvestors?.length || 0;

    if (this.state.viewMode === "grid") {
      return this.createGridCard(opportunity, {
        fundingAmount,
        timeAgo,
        category,
        riskLevel,
        isWatchlisted,
        views,
        interest,
      });
    } else {
      return this.createListCard(opportunity, {
        fundingAmount,
        timeAgo,
        category,
        riskLevel,
        isWatchlisted,
        views,
        interest,
      });
    }
  },

  // Create grid view card
  createGridCard(opportunity, props) {
    const {
      fundingAmount,
      timeAgo,
      category,
      riskLevel,
      isWatchlisted,
      views,
      interest,
    } = props;

    return `
            <div class="opportunity-card" data-id="${opportunity.id}">
                <div class="opportunity-header">
                    <div class="opportunity-category">${category}</div>
                    <div class="opportunity-actions">
                        <button class="btn-icon watchlist-btn ${
                          isWatchlisted ? "active" : ""
                        }"
                                onclick="Investor.toggleWatchlist('${
                                  opportunity.id
                                }')"
                                title="${
                                  isWatchlisted
                                    ? "Remove from watchlist"
                                    : "Add to watchlist"
                                }">
                            <i data-lucide="${
                              isWatchlisted ? "bookmark" : "bookmark-plus"
                            }"></i>
                        </button>
                        <button class="btn-icon share-btn"
                                onclick="Investor.shareOpportunity('${
                                  opportunity.id
                                }')"
                                title="Share opportunity">
                            <i data-lucide="share-2"></i>
                        </button>
                    </div>
                </div>

                <div class="opportunity-content">
                    <h3 class="opportunity-title">${opportunity.title}</h3>
                    <p class="opportunity-description">${Utils.truncateText(
                      opportunity.description,
                      120
                    )}</p>

                    <div class="opportunity-metrics">
                        <div class="metric">
                            <span class="metric-label">Funding</span>
                            <span class="metric-value">${fundingAmount}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Timeline</span>
                            <span class="metric-value">${
                              opportunity.timeline
                            }</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Risk</span>
                            <span class="metric-value risk-${riskLevel}">${Utils.capitalizeFirst(
      riskLevel
    )}</span>
                        </div>
                    </div>
                </div>

                <div class="opportunity-stats">
                    <span class="stat">
                        <i data-lucide="eye"></i>
                        ${views} views
                    </span>
                    <span class="stat">
                        <i data-lucide="users"></i>
                        ${interest} interested
                    </span>
                    <span class="stat">
                        <i data-lucide="calendar"></i>
                        ${timeAgo}
                    </span>
                </div>

                <div class="opportunity-actions-footer">
                    <button class="btn btn-outline btn-small" onclick="Investor.viewOpportunityDetails('${
                      opportunity.id
                    }')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    <button class="btn btn-primary btn-small" onclick="Investor.showInvestmentModal('${
                      opportunity.id
                    }')">
                        <i data-lucide="trending-up"></i>
                        Invest Now
                    </button>
                </div>
            </div>
        `;
  },

  // Create list view card
  createListCard(opportunity, props) {
    const {
      fundingAmount,
      timeAgo,
      category,
      riskLevel,
      isWatchlisted,
      views,
      interest,
    } = props;

    return `
            <div class="opportunity-list-item" data-id="${opportunity.id}">
                <div class="opportunity-main">
                    <div class="opportunity-info">
                        <div class="opportunity-header-list">
                            <h3 class="opportunity-title">${
                              opportunity.title
                            }</h3>
                            <div class="opportunity-category-badge">${category}</div>
                            <div class="risk-badge risk-${riskLevel}">${Utils.capitalizeFirst(
      riskLevel
    )} Risk</div>
                        </div>
                        <p class="opportunity-description">${Utils.truncateText(
                          opportunity.description,
                          200
                        )}</p>
                        <div class="opportunity-stats-list">
                            <span class="stat"><i data-lucide="eye"></i> ${views} views</span>
                            <span class="stat"><i data-lucide="users"></i> ${interest} interested</span>
                            <span class="stat"><i data-lucide="calendar"></i> ${timeAgo}</span>
                        </div>
                    </div>

                    <div class="opportunity-details">
                        <div class="funding-info">
                            <span class="funding-label">Funding Needed</span>
                            <span class="funding-amount">${fundingAmount}</span>
                        </div>
                        <div class="timeline-info">
                            <span class="timeline-label">Timeline</span>
                            <span class="timeline-value">${
                              opportunity.timeline
                            }</span>
                        </div>
                    </div>
                </div>

                <div class="opportunity-actions-list">
                    <button class="btn-icon watchlist-btn ${
                      isWatchlisted ? "active" : ""
                    }"
                            onclick="Investor.toggleWatchlist('${
                              opportunity.id
                            }')"
                            title="${
                              isWatchlisted
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                            }">
                        <i data-lucide="${
                          isWatchlisted ? "bookmark" : "bookmark-plus"
                        }"></i>
                    </button>
                    <button class="btn btn-outline" onclick="Investor.viewOpportunityDetails('${
                      opportunity.id
                    }')">
                        View Details
                    </button>
                    <button class="btn btn-primary" onclick="Investor.showInvestmentModal('${
                      opportunity.id
                    }')">
                        Invest Now
                    </button>
                </div>
            </div>
        `;
  },

  // Render empty opportunities state
  renderOpportunitiesEmpty() {
    if (!this.elements.opportunitiesGrid) return;

    this.elements.opportunitiesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="search-x"></i>
                </div>
                <h3>No Investment Opportunities Found</h3>
                <p>Try adjusting your search filters or check back later for new opportunities.</p>
                <button class="btn btn-outline" onclick="Investor.clearAllFilters()">
                    <i data-lucide="filter-x"></i>
                    Clear All Filters
                </button>
            </div>
        `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Render opportunities error state
  renderOpportunitiesError() {
    if (!this.elements.opportunitiesGrid) return;

    this.elements.opportunitiesGrid.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3>Failed to Load Opportunities</h3>
                <p>Something went wrong while loading investment opportunities. Please try again.</p>
                <button class="btn btn-primary" onclick="Investor.loadInvestmentOpportunities()">
                    <i data-lucide="refresh-cw"></i>
                    Retry
                </button>
            </div>
        `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Update opportunity statistics
  updateOpportunityStats(opportunities) {
    const stats = this.calculateOpportunityStats(opportunities);

    // Update UI elements with stats
    const totalOpportunitiesElement =
      Utils.getElementById("totalOpportunities");
    const avgFundingElement = Utils.getElementById("avgFunding");
    const topCategoryElement = Utils.getElementById("topCategory");

    if (totalOpportunitiesElement)
      totalOpportunitiesElement.textContent = stats.total;
    if (avgFundingElement)
      avgFundingElement.textContent = Utils.formatCurrency(stats.avgFunding);
    if (topCategoryElement) topCategoryElement.textContent = stats.topCategory;
  },

  // Calculate opportunity statistics
  calculateOpportunityStats(opportunities) {
    const stats = {
      total: opportunities.length,
      avgFunding: 0,
      topCategory: "N/A",
      totalFunding: 0,
    };

    if (opportunities.length === 0) return stats;

    // Calculate total and average funding
    const totalFunding = opportunities.reduce(
      (sum, opp) => sum + (opp.fundingNeeded || 0),
      0
    );
    stats.totalFunding = totalFunding;
    stats.avgFunding = totalFunding / opportunities.length;

    // Find top category
    const categoryCounts = {};
    opportunities.forEach((opp) => {
      categoryCounts[opp.category] = (categoryCounts[opp.category] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (topCategory) {
      stats.topCategory = Utils.capitalizeFirst(topCategory[0]);
    }

    return stats;
  },

  // Handle investment proposal submission
  async handleProposalSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const opportunityId = form.dataset.opportunityId;

    if (!opportunityId || !this.validateProposalForm(form)) {
      return;
    }

    const formData = Utils.getFormData(form);

    try {
      this.state.isLoading = true;
      Utils.showLoading(submitBtn, "Submitting Proposal...");

      const proposalData = {
        investorId: App.state.currentUser.uid,
        businessIdeaId: opportunityId,
        proposedAmount: parseFloat(formData.proposedAmount),
        terms: formData.terms,
        conditions: formData.conditions,
        timeline: formData.timeline,
        investmentType: formData.investmentType,
        equityPercentage: formData.equityPercentage
          ? parseFloat(formData.equityPercentage)
          : null,
        additionalNotes: formData.additionalNotes,
      };

      const result = await FirebaseService.createInvestmentProposal(
        proposalData
      );

      if (result.success) {
        Utils.showSuccess("Investment proposal submitted successfully!");
        this.closeModal(this.elements.proposalModal);
        this.loadInvestorPortfolio(); // Refresh portfolio

        // Update opportunity interest count
        this.updateOpportunityInterest(opportunityId);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      Utils.showError(
        "Failed to submit investment proposal. Please try again."
      );
    } finally {
      this.state.isLoading = false;
      Utils.hideLoading(submitBtn);
    }
  },

  // Validate proposal form
  validateProposalForm(form) {
    let isValid = true;
    const formData = Utils.getFormData(form);

    // Clear previous errors
    this.clearFormErrors(form);

    // Validate required fields
    const requiredFields = ["proposedAmount", "terms", "investmentType"];

    requiredFields.forEach((field) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        this.showFieldError(
          form,
          field,
          `${this.getFieldLabel(field)} is required`
        );
        isValid = false;
      }
    });

    // Validate proposed amount
    const proposedAmount = parseFloat(formData.proposedAmount);
    if (isNaN(proposedAmount) || proposedAmount <= 0) {
      this.showFieldError(
        form,
        "proposedAmount",
        "Please enter a valid investment amount"
      );
      isValid = false;
    }

    // Validate equity percentage if provided
    if (formData.equityPercentage) {
      const equity = parseFloat(formData.equityPercentage);
      if (isNaN(equity) || equity <= 0 || equity > 100) {
        this.showFieldError(
          form,
          "equityPercentage",
          "Equity percentage must be between 1-100%"
        );
        isValid = false;
      }
    }

    return isValid;
  },

  // Load investor portfolio
  async loadInvestorPortfolio() {
    if (!App.state.isAuthenticated || !App.state.currentUser) return;

    try {
      const filters = {
        investorId: App.state.currentUser.uid,
      };

      const result = await FirebaseService.getInvestmentProposals(filters);

      if (result.success) {
        this.state.investmentProposals = result.data;
        this.renderPortfolio();
        this.updatePortfolioStats();
      } else {
        console.error("Failed to load portfolio:", result.error);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
    }
  },

  // Render portfolio
  renderPortfolio() {
    if (!this.elements.portfolioContainer) return;

    if (this.state.investmentProposals.length === 0) {
      this.elements.portfolioContainer.innerHTML =
        this.createEmptyPortfolioHTML();
      return;
    }

    // Group proposals by status
    const groupedProposals = Utils.groupBy(
      this.state.investmentProposals,
      "status"
    );

    this.elements.portfolioContainer.innerHTML = `
            <div class="portfolio-grid">
                ${Object.entries(groupedProposals)
                  .map(([status, proposals]) =>
                    this.createPortfolioSection(status, proposals)
                  )
                  .join("")}
            </div>
        `;

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Create portfolio section HTML
  createPortfolioSection(status, proposals) {
    const statusLabel = Utils.capitalizeFirst(status);
    const statusIcon = this.getStatusIcon(status);

    return `
            <div class="portfolio-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <i data-lucide="${statusIcon}"></i>
                        ${statusLabel} (${proposals.length})
                    </h3>
                </div>
                <div class="proposals-list">
                    ${proposals
                      .map((proposal) => this.createProposalCard(proposal))
                      .join("")}
                </div>
            </div>
        `;
  },

  // Create proposal card HTML
  createProposalCard(proposal) {
    const proposedAmount = Utils.formatCurrency(proposal.proposedAmount);
    const timeAgo = Utils.timeAgo(proposal.createdAt);
    const status = Utils.capitalizeFirst(proposal.status);

    return `
            <div class="proposal-card" data-id="${proposal.id}">
                <div class="proposal-header">
                    <div class="proposal-status status-${proposal.status}">
                        ${status}
                    </div>
                    <div class="proposal-amount">${proposedAmount}</div>
                </div>

                <div class="proposal-content">
                    <h4 class="business-title">Business Idea #${proposal.businessIdeaId.substring(
                      0,
                      8
                    )}</h4>
                    <p class="proposal-terms">${Utils.truncateText(
                      proposal.terms,
                      100
                    )}</p>
                    <div class="proposal-meta">
                        <span class="investment-type">${
                          proposal.investmentType
                        }</span>
                        ${
                          proposal.equityPercentage
                            ? `<span class="equity">${proposal.equityPercentage}% equity</span>`
                            : ""
                        }
                        <span class="proposal-time">${timeAgo}</span>
                    </div>
                </div>

                <div class="proposal-actions">
                    <button class="btn btn-outline btn-small" onclick="Investor.viewProposal('${
                      proposal.id
                    }')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    ${
                      proposal.status === Status.PROPOSAL.PENDING
                        ? `
                        <button class="btn btn-secondary btn-small" onclick="Investor.editProposal('${proposal.id}')">
                            <i data-lucide="edit"></i>
                            Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="Investor.withdrawProposal('${proposal.id}')">
                            <i data-lucide="x"></i>
                            Withdraw
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  },

  // Create empty portfolio HTML
  createEmptyPortfolioHTML() {
    return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="briefcase"></i>
                </div>
                <h3>No Investment Proposals Yet</h3>
                <p>Start building your investment portfolio by submitting proposals to promising business ideas.</p>
                <button class="btn btn-primary" onclick="App.navigateToSection('browse')">
                    <i data-lucide="search"></i>
                    Browse Opportunities
                </button>
            </div>
        `;
  },

  // Update portfolio statistics
  updatePortfolioStats() {
    const stats = this.calculatePortfolioStats();

    const totalProposalsElement = Utils.getElementById("totalProposals");
    const totalInvestedElement = Utils.getElementById("totalInvested");
    const activeProposalsElement = Utils.getElementById("activeProposals");
    const successRateElement = Utils.getElementById("successRate");

    if (totalProposalsElement) totalProposalsElement.textContent = stats.total;
    if (totalInvestedElement)
      totalInvestedElement.textContent = Utils.formatCurrency(
        stats.totalInvested
      );
    if (activeProposalsElement)
      activeProposalsElement.textContent = stats.active;
    if (successRateElement)
      successRateElement.textContent = `${stats.successRate}%`;
  },

  // Calculate portfolio statistics
  calculatePortfolioStats() {
    const stats = {
      total: this.state.investmentProposals.length,
      totalInvested: 0,
      active: 0,
      accepted: 0,
      successRate: 0,
    };

    this.state.investmentProposals.forEach((proposal) => {
      if (proposal.status === Status.PROPOSAL.ACCEPTED) {
        stats.totalInvested += proposal.proposedAmount;
        stats.accepted++;
      }
      if (
        proposal.status === Status.PROPOSAL.PENDING ||
        proposal.status === Status.PROPOSAL.NEGOTIATING
      ) {
        stats.active++;
      }
    });

    if (stats.total > 0) {
      stats.successRate = Math.round((stats.accepted / stats.total) * 100);
    }

    return stats;
  },

  // Load watchlist
  loadWatchlist() {
    const watchlistData = Utils.getFromStorage(
      `watchlist_${App.state.currentUser?.uid}`
    );
    this.state.watchlist = watchlistData || [];
    this.renderWatchlist();
  },

  // Render watchlist
  renderWatchlist() {
    if (!this.elements.watchlistContainer) return;

    if (this.state.watchlist.length === 0) {
      this.elements.watchlistContainer.innerHTML =
        this.createEmptyWatchlistHTML();
      return;
    }

    // Load full opportunity details for watchlisted items
    this.loadWatchlistDetails();
  },

  // Load watchlist details
  async loadWatchlistDetails() {
    try {
      const watchlistPromises = this.state.watchlist.map(
        async (opportunityId) => {
          // Try to find in current opportunities first
          let opportunity = App.state.businessIdeas?.find(
            (idea) => idea.id === opportunityId
);

          if (!opportunity) {
            // Fetch from Firebase if not found locally
            const result = await FirebaseService.getBusinessIdeas({ limit: 1 });
            if (result.success) {
              opportunity = result.data.find(
                (idea) => idea.id === opportunityId
              );
            }
}

          return opportunity;
        }
      );

      const watchlistOpportunities = await Promise.all(watchlistPromises);
      const validOpportunities = watchlistOpportunities.filter((opp) => opp);

      this.renderWatchlistItems(validOpportunities);
    } catch (error) {
      console.error("Error loading watchlist details:", error);
    }
  },

  // Render watchlist items
  renderWatchlistItems(opportunities) {
    if (!this.elements.watchlistContainer) return;

    this.elements.watchlistContainer.innerHTML = `
            <div class="watchlist-grid">
                ${opportunities
                  .map((opp) => this.createWatchlistCard(opp))
                  .join("")}
            </div>
        `;

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Create watchlist card HTML
  createWatchlistCard(opportunity) {
    const fundingAmount = Utils.formatCurrency(opportunity.fundingNeeded);
    const timeAgo = Utils.timeAgo(opportunity.createdAt);
    const category = Utils.capitalizeFirst(opportunity.category);

    return `
            <div class="watchlist-card" data-id="${opportunity.id}">
                <div class="watchlist-header">
                    <div class="opportunity-category">${category}</div>
                    <button class="btn-icon remove-watchlist"
                            onclick="Investor.removeFromWatchlist('${
                              opportunity.id
                            }')"
                            title="Remove from watchlist">
                        <i data-lucide="bookmark-x"></i>
                    </button>
                </div>

                <div class="watchlist-content">
                    <h3 class="opportunity-title">${opportunity.title}</h3>
                    <p class="opportunity-description">${Utils.truncateText(
                      opportunity.description,
                      100
                    )}</p>
                    <div class="watchlist-meta">
                        <span class="funding">${fundingAmount}</span>
                        <span class="timeline">${opportunity.timeline}</span>
                        <span class="time-added">${timeAgo}</span>
                    </div>
                </div>

                <div class="watchlist-actions">
                    <button class="btn btn-outline btn-small" onclick="Investor.viewOpportunityDetails('${
                      opportunity.id
                    }')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    <button class="btn btn-primary btn-small" onclick="Investor.showInvestmentModal('${
                      opportunity.id
                    }')">
                        <i data-lucide="trending-up"></i>
                        Invest
                    </button>
                </div>
            </div>
        `;
  },

  // Create empty watchlist HTML
  createEmptyWatchlistHTML() {
    return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="bookmark"></i>
                </div>
                <h3>Your Watchlist is Empty</h3>
                <p>Save interesting investment opportunities to your watchlist for quick access later.</p>
                <button class="btn btn-primary" onclick="App.navigateToSection('browse')">
                    <i data-lucide="search"></i>
                    Find Opportunities
                </button>
            </div>
        `;
  },

  // Initialize filters
  initializeFilters() {
    this.loadFilterPresets();
    this.populateCategoryFilter();
    this.populateFundingRangeFilter();
    this.populateRiskLevelFilter();
  },

  // Load filter presets
  loadFilterPresets() {
    const presets = Utils.getFromStorage(
      `filter_presets_${App.state.currentUser?.uid}`
    );
    if (presets) {
      this.renderFilterPresets(presets);
    }
  },

  // Populate category filter
  populateCategoryFilter() {
    const categorySelect = Utils.getElementById("categoryFilter");
    if (!categorySelect) return;

    const categories = Business?.state?.categories || [
      "technology",
      "healthcare",
      "finance",
      "education",
      "ecommerce",
      "manufacturing",
      "agriculture",
      "food",
      "retail",
      "services",
    ];

    categorySelect.innerHTML = `
            <option value="">All Categories</option>
            ${categories
              .map(
                (cat) =>
                  `<option value="${cat}">${Utils.capitalizeFirst(
                    cat
                  )}</option>`
              )
              .join("")}
        `;
  },

  // Populate funding range filter
  populateFundingRangeFilter() {
    const fundingSelect = Utils.getElementById("fundingRangeFilter");
    if (!fundingSelect) return;

    fundingSelect.innerHTML = `
            <option value="">All Funding Ranges</option>
            ${this.investmentRanges
              .map(
                (range) =>
                  `<option value="${range.value}">${range.label}</option>`
              )
              .join("")}
        `;
  },

  // Populate risk level filter
  populateRiskLevelFilter() {
    const riskSelect = Utils.getElementById("riskLevelFilter");
    if (!riskSelect) return;

    riskSelect.innerHTML = `
            <option value="">All Risk Levels</option>
            ${this.riskLevels
              .map(
               (risk) => `<option value="${risk.value}">${risk.label}</option>`
              )
              .join("")}
        `;
  },

  // Handle filter change
  handleFilterChange(e) {
    const filterName = e.target.name;
    const filterValue = e.target.value;

    this.state.filters[filterName] = filterValue;
    this.saveCurrentFilters();
    this.loadInvestmentOpportunities();
  },

  // Handle sort change
  handleSortChange(e) {
    this.state.sortBy = e.target.value;
    this.loadInvestmentOpportunities();
  },

  // Toggle sort order
  toggleSortOrder() {
    this.state.sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
    this.updateSortOrderUI();
    this.loadInvestmentOpportunities();
  },

  // Update sort order UI
  updateSortOrderUI() {
    const sortOrderBtn = Utils.getElementById("sortOrderBtn");
    if (sortOrderBtn) {
      const icon = sortOrderBtn.querySelector("[data-lucide]");
      if (icon) {
        icon.setAttribute(
          "data-lucide",
          this.state.sortOrder === "asc" ? "arrow-up" : "arrow-down"
        );
        lucide.createIcons();
      }
    }
  },

  // Handle view toggle
  handleViewToggle(e) {
    const viewMode = e.target.dataset.view;
    if (viewMode) {
      this.state.viewMode = viewMode;
      this.updateViewToggleUI();
      this.loadInvestmentOpportunities();
    }
  },

  // Update view toggle UI
  updateViewToggleUI() {
    const viewToggleButtons = Utils.querySelectorAll(".view-toggle-btn");
    viewToggleButtons.forEach((btn) => {
      Utils.removeClass(btn, "active");
      if (btn.dataset.view === this.state.viewMode) {
        Utils.addClass(btn, "active");
      }
    });
  },

  // Toggle advanced filters
  toggleAdvancedFilters() {
    const advancedFilters = Utils.getElementById("advancedFilters");
    if (advancedFilters) {
      Utils.toggle(advancedFilters);
    }
  },

  // Clear all filters
  clearAllFilters() {
    this.state.filters = {
      category: "",
      fundingRange: "",
      timeline: "",
      riskLevel: "",
      location: "",
    };

    // Reset filter UI
    const filterInputs = Utils.querySelectorAll(".filter-input");
    filterInputs.forEach((input) => {
      input.value = "";
    });

    this.saveCurrentFilters();
    this.loadInvestmentOpportunities();
  },

  // Save current filters
  saveCurrentFilters() {
    const filtersKey = `investor_filters_${App.state.currentUser?.uid}`;
    Utils.saveToStorage(filtersKey, this.state.filters);
  },

  // Save filter preset
  saveFilterPreset() {
    const presetName = prompt("Enter a name for this filter preset:");
    if (!presetName) return;

    const presetsKey = `filter_presets_${App.state.currentUser?.uid}`;
    const existingPresets = Utils.getFromStorage(presetsKey) || {};

    existingPresets[presetName] = { ...this.state.filters };
    Utils.saveToStorage(presetsKey, existingPresets);

    Utils.showSuccess(`Filter preset "${presetName}" saved successfully`);
    this.renderFilterPresets(existingPresets);
  },

  // Render filter presets
  renderFilterPresets(presets) {
    const presetsContainer = Utils.getElementById("filterPresets");
    if (!presetsContainer) return;

    const presetNames = Object.keys(presets);
    if (presetNames.length === 0) {
      presetsContainer.innerHTML =
        '<p class="no-presets">No saved filter presets</p>';
      return;
    }

    presetsContainer.innerHTML = `
            <div class="filter-presets">
                ${presetNames
                  .map(
                    (name) => `
                    <div class="filter-preset">
                        <button class="preset-btn" onclick="Investor.applyFilterPreset('${name}')">
                            ${name}
                        </button>
                        <button class="preset-delete" onclick="Investor.deleteFilterPreset('${name}')">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Apply filter preset
  applyFilterPreset(presetName) {
    const presetsKey = `filter_presets_${App.state.currentUser?.uid}`;
    const presets = Utils.getFromStorage(presetsKey) || {};

    if (presets[presetName]) {
      this.state.filters = { ...presets[presetName] };

      // Update filter UI
      Object.keys(this.state.filters).forEach((filterName) => {
        const input = Utils.querySelector(`[name="${filterName}"]`);
        if (input) {
          input.value = this.state.filters[filterName];
        }
      });

      this.loadInvestmentOpportunities();
      Utils.showSuccess(`Applied filter preset: ${presetName}`);
    }
  },

  // Delete filter preset
  deleteFilterPreset(presetName) {
    if (!confirm(`Delete filter preset "${presetName}"?`)) return;

    const presetsKey = `filter_presets_${App.state.currentUser?.uid}`;
    const presets = Utils.getFromStorage(presetsKey) || {};

    delete presets[presetName];
    Utils.saveToStorage(presetsKey, presets);

    this.renderFilterPresets(presets);
    Utils.showSuccess(`Filter preset "${presetName}" deleted`);
  },

  // Watchlist management
  toggleWatchlist(opportunityId) {
    if (this.isInWatchlist(opportunityId)) {
      this.removeFromWatchlist(opportunityId);
    } else {
      this.addToWatchlist(opportunityId);
    }
  },

  addToWatchlist(opportunityId) {
    if (!this.isInWatchlist(opportunityId)) {
      this.state.watchlist.push(opportunityId);
      this.saveWatchlist();
      this.updateWatchlistUI(opportunityId, true);
      Utils.showSuccess("Added to watchlist");
    }
  },

  removeFromWatchlist(opportunityId) {
    this.state.watchlist = this.state.watchlist.filter(
      (id) => id !== opportunityId
    );
    this.saveWatchlist();
    this.updateWatchlistUI(opportunityId, false);
    this.renderWatchlist(); // Refresh watchlist view
    Utils.showSuccess("Removed from watchlist");
  },

  isInWatchlist(opportunityId) {
    return this.state.watchlist.includes(opportunityId);
  },

  saveWatchlist() {
    const watchlistKey = `watchlist_${App.state.currentUser?.uid}`;
    Utils.saveToStorage(watchlistKey, this.state.watchlist);
  },

  updateWatchlistUI(opportunityId, isWatchlisted) {
    const watchlistBtns = Utils.querySelectorAll(
      `[onclick*="toggleWatchlist('${opportunityId}')"]`
    );
    watchlistBtns.forEach((btn) => {
      const icon = btn.querySelector("[data-lucide]");
      if (icon) {
        icon.setAttribute(
          "data-lucide",
          isWatchlisted ? "bookmark" : "bookmark-plus"
        );
        if (isWatchlisted) {
          Utils.addClass(btn, "active");
        } else {
          Utils.removeClass(btn, "active");
        }
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Investment modal management
  showInvestmentModal(opportunityId) {
    this.state.currentOpportunity = opportunityId;

    if (!this.elements.proposalModal) {
      this.createProposalModal();
    }

    this.populateProposalModal(opportunityId);
    this.openModal(this.elements.proposalModal);
  },

  populateProposalModal(opportunityId) {
    // Get opportunity details
    const opportunity = App.state.businessIdeas?.find(
      (idea) => idea.id === opportunityId
    );
    if (!opportunity) return;

    // Update modal title and details
    const modalTitle = Utils.getElementById("proposalModalTitle");
    const opportunityTitle = Utils.getElementById("proposalOpportunityTitle");
    const fundingNeeded = Utils.getElementById("proposalFundingNeeded");

    if (modalTitle) modalTitle.textContent = "Investment Proposal";
    if (opportunityTitle) opportunityTitle.textContent = opportunity.title;
    if (fundingNeeded)
      fundingNeeded.textContent = Utils.formatCurrency(
        opportunity.fundingNeeded
      );

    // Set form data
    const proposalForm = Utils.getElementById("proposalForm");
    if (proposalForm) {
      proposalForm.dataset.opportunityId = opportunityId;

      // Pre-fill suggested amount (e.g., 20% of funding needed)
      const suggestedAmount = Math.round(opportunity.fundingNeeded * 0.2);
      const amountInput = proposalForm.querySelector('[name="proposedAmount"]');
      if (amountInput) {
        amountInput.value = suggestedAmount;
      }
    }
  },

  // View opportunity details
  viewOpportunityDetails(opportunityId) {
    // Navigate to detailed view or open detailed modal
    this.state.currentOpportunity = opportunityId;

    // Update view count
    Business?.updateIdeaViews?.(opportunityId);

    // For now, show in modal (could be a separate page)
    this.showOpportunityDetailModal(opportunityId);
  },

  showOpportunityDetailModal(opportunityId) {
    const opportunity = App.state.businessIdeas?.find(
      (idea) => idea.id === opportunityId
    );
    if (!opportunity) return;

    // Create and show detailed modal
    console.log("Showing detailed view for opportunity:", opportunity.title);
    // Implementation would create a detailed modal with full opportunity info
  },

  // Share opportunity
  shareOpportunity(opportunityId) {
    const opportunity = App.state.businessIdeas?.find(
      (idea) => idea.id === opportunityId
    );
    if (!opportunity) return;

    const shareText = `Check out this investment opportunity: ${opportunity.title}`;
    const shareUrl = `${window.location.origin}/#opportunity/${opportunityId}`;

    if (navigator.share) {
      navigator.share({
        title: opportunity.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      Utils.copyToClipboard(shareUrl);
    }
  },

  // Proposal management
  viewProposal(proposalId) {
    const proposal = this.state.investmentProposals.find(
      (p) => p.id === proposalId
    );
    if (!proposal) return;

    console.log("Viewing proposal:", proposal);
    // Implementation would show proposal details
  },

  editProposal(proposalId) {
    const proposal = this.state.investmentProposals.find(
      (p) => p.id === proposalId
    );
    if (!proposal) return;

    console.log("Editing proposal:", proposal);
    // Implementation would open edit modal
  },

  async withdrawProposal(proposalId) {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;

    try {
      const result = await FirebaseService.updateInvestmentProposal(
        proposalId,
        {
          status: "withdrawn",
          withdrawnAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
      );

      if (result.success) {
        Utils.showSuccess("Proposal withdrawn successfully");
        this.loadInvestorPortfolio();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error withdrawing proposal:", error);
      Utils.showError("Failed to withdraw proposal");
    }
  },

  // Update opportunity interest count
  async updateOpportunityInterest(opportunityId) {
    try {
      // This would increment the interested investors count
      await FirebaseService.updateBusinessIdea(opportunityId, {
        interestedInvestors: firebase.firestore.FieldValue.arrayUnion(
          App.state.currentUser.uid
        ),
      });
    } catch (error) {
      console.error("Error updating opportunity interest:", error);
    }
  },

  // Utility methods
  getStatusIcon(status) {
    const icons = {
      pending: "clock",
      accepted: "check-circle",
      rejected: "x-circle",
      negotiating: "message-circle",
      withdrawn: "arrow-left",
    };
    return icons[status] || "circle";
  },

  getFieldLabel(fieldName) {
    const labels = {
      proposedAmount: "Investment Amount",
      terms: "Investment Terms",
      conditions: "Conditions",
      timeline: "Investment Timeline",
      investmentType: "Investment Type",
      equityPercentage: "Equity Percentage",
      additionalNotes: "Additional Notes",
    };
    return labels[fieldName] || "Field";
  },

  showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    const existingError = formGroup.querySelector(".field-error");
    if (existingError) existingError.remove();

    Utils.addClass(formGroup, "has-error");
    Utils.addClass(field, "error");

    const errorElement = document.createElement("span");
    errorElement.className = "field-error";
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  },

  clearFormErrors(form) {
    const errorElements = form.querySelectorAll(".field-error");
    errorElements.forEach((error) => error.remove());

    const errorFields = form.querySelectorAll(".error");
    errorFields.forEach((field) => Utils.removeClass(field, "error"));

    const errorGroups = form.querySelectorAll(".has-error");
    errorGroups.forEach((group) => Utils.removeClass(group, "has-error"));
  },

  // Modal utility methods
  openModal(modal) {
    if (modal) {
      Utils.removeClass(modal, "hidden");
      Utils.addClass(document.body, "modal-open");
    }
  },

  closeModal(modal) {
    if (modal) {
      Utils.addClass(modal, "hidden");
      Utils.removeClass(document.body, "modal-open");
      this.clearModalForms(modal);
    }
  },

  closeAllModals() {
    const modals = [this.elements.investmentModal, this.elements.proposalModal];
    modals.forEach((modal) => {
      if (modal) this.closeModal(modal);
    });
  },

  clearModalForms(modal) {
    const forms = modal.querySelectorAll("form");
    forms.forEach((form) => {
      Utils.clearForm(form);
      this.clearFormErrors(form);
    });
  },

  isModalOpen() {
    return document.body.classList.contains("modal-open");
  },

  isInvestorPage() {
    return (
      App.state.currentSection === "browse" ||
      App.state.currentSection === "dashboard"
    );
  },

  focusSearchInput() {
    const searchInput = Utils.getElementById("searchInput");
    if (searchInput) searchInput.focus();
  },

  toggleWatchlistView() {
    console.log("Toggle watchlist view");
    // Implementation would switch to watchlist view
  },

  togglePortfolioView() {
    console.log("Toggle portfolio view");
    // Implementation would switch to portfolio view
  },

  // Handle infinite scroll
  handleScroll() {
    if (this.state.isLoading) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 1000;

    if (scrollPosition >= threshold) {
      this.loadMoreOpportunities();
    }
  },

  loadMoreOpportunities() {
    // Implementation for loading more opportunities
    console.log("Loading more opportunities...");
  },

  // Setup real-time updates
  setupRealtimeUpdates() {
    if (!App.state.currentUser) return;

    // Listen for changes to investment proposals
    const unsubscribe = FirebaseService.onInvestmentProposalsChanged?.(
      (snapshot) => {
        const proposals = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.investorId === App.state.currentUser.uid) {
            proposals.push({ id: doc.id, ...data });
          }
        });

        this.state.investmentProposals = proposals;
        this.renderPortfolio();
        this.updatePortfolioStats();
      }
    );

    this.unsubscribeRealtimeUpdates = unsubscribe;
  },

  // Cleanup method
  cleanup() {
    if (this.unsubscribeRealtimeUpdates) {
      this.unsubscribeRealtimeUpdates();
    }
  },

  // Create modal HTML (placeholder)
  createProposalModal() {
    console.log("Creating proposal modal...");
    // This would create the modal HTML dynamically
    // For now, assume modal exists in HTML
  },
};

// Global functions for HTML onclick handlers
window.Investor = Investor;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (
    App.state.isAuthenticated &&
    App.state.currentUser?.userType === UserTypes.INVESTOR
  ) {
    Investor.init();
  }
});

// Initialize when user signs in
document.addEventListener("userSignedIn", () => {
  if (App.state.currentUser?.userType === UserTypes.INVESTOR) {
    Investor.init();
  }
});

// Cleanup when user signs out
document.addEventListener("userSignedOut", () => {
  Investor.cleanup();
});

// Export for use in other modules
window.Investor = Investor;

