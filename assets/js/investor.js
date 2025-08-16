// Investment Management System for Investors
// Handles investment proposals, saved ideas, and portfolio management

const InvestmentManager = {
  // State management
  state: {
    savedIdeas: [],
    myProposals: [],
    isSubmitting: false,
  },

  // Initialize the investment manager
  init() {
    console.log("Initializing Investment Manager...");
    this.bindEvents();
    this.loadSavedIdeas();
    this.loadMyProposals();
  },

  // Bind event listeners
  bindEvents() {
    // Investment proposal buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".invest-btn") || e.target.closest(".invest-btn")) {
        const ideaId = e.target.dataset.ideaId || e.target.closest(".invest-btn").dataset.ideaId;
        this.showInvestmentModal(ideaId);
      }

      if (e.target.matches(".save-idea-btn") || e.target.closest(".save-idea-btn")) {
        const ideaId = e.target.dataset.ideaId || e.target.closest(".save-idea-btn").dataset.ideaId;
        this.toggleSaveIdea(ideaId);
      }
    });

    // Form submission
    document.addEventListener("submit", (e) => {
      if (e.target.id === "investmentProposalForm") {
        e.preventDefault();
        this.handleProposalSubmission(e.target);
      }
    });
  },

  // Show investment proposal modal
  showInvestmentModal(ideaId) {
    // Get idea details first
    this.getIdeaDetails(ideaId).then(idea => {
      if (idea) {
        this.createInvestmentModal(idea);
      }
    });
  },

  // Get idea details from Firebase
  async getIdeaDetails(ideaId) {
    try {
      const result = await FirebaseService.getBusinessIdea(ideaId);
      if (result.success) {
        return result.data;
      } else {
        Utils.showError("Could not load business idea details");
        return null;
      }
    } catch (error) {
      console.error("Error getting idea details:", error);
      Utils.showError("Failed to load business idea details");
      return null;
    }
  },

  // Create investment proposal modal
  createInvestmentModal(idea) {
    const modalHTML = `
      <div id="investmentModal" class="modal">
        <div class="modal-overlay" onclick="InvestmentManager.closeModal()"></div>
        <div class="modal-content investment-modal">
          <button class="modal-close" onclick="InvestmentManager.closeModal()">
            <i data-lucide="x"></i>
          </button>

          <div class="modal-header">
            <h2>Investment Proposal</h2>
            <p>Submit your investment proposal for: <strong>${idea.title}</strong></p>
                    </div>

          <form id="investmentProposalForm" class="investment-proposal-form">
            <input type="hidden" id="businessIdeaId" value="${idea.id}">

            <div class="form-section">
              <h3>Investment Details</h3>

              <div class="form-row">
                <div class="form-group">
                  <label for="investmentAmount">Investment Amount (₹) *</label>
                  <input type="number" id="investmentAmount" name="amount" required
                         min="10000" max="${idea.fundingNeeded}"
                         placeholder="e.g., 500000">
                  <small>Maximum: ${Utils.formatCurrency(idea.fundingNeeded)}</small>
            </div>

                <div class="form-group">
                  <label for="equityPercentage">Equity Offered (%)</label>
                  <input type="number" id="equityPercentage" name="equity" 
                         min="0" max="100" step="0.1"
                         placeholder="e.g., 15.0">
                  <small>Optional - if equity is part of the deal</small>
                    </div>
                </div>

              <div class="form-group">
                <label for="investmentMessage">Investment Message *</label>
                <textarea id="investmentMessage" name="message" required rows="4"
                          placeholder="Explain why you're interested in this business idea, your investment strategy, and any specific terms you'd like to discuss..."></textarea>
                <small>Minimum 50 characters</small>
              </div>

              <div class="form-group">
                <label for="investmentTerms">Investment Terms</label>
                <textarea id="investmentTerms" name="terms" rows="3"
                          placeholder="Describe any specific terms, conditions, or expectations for this investment..."></textarea>
                    </div>
                </div>

            <div class="form-section">
              <h3>Contact Information</h3>
              <p>Your contact information will be shared with the entrepreneur for further discussion.</p>
                </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" onclick="InvestmentManager.closeModal()">
                Cancel
                    </button>
              <button type="submit" class="btn btn-primary" id="submitProposalBtn">
                        <i data-lucide="trending-up"></i>
                Submit Proposal
                    </button>
                </div>
          </form>
                </div>
            </div>
        `;

    // Remove existing modal
    const existingModal = document.getElementById("investmentModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.body.classList.add("modal-open");

    // Show modal
    const modal = document.getElementById("investmentModal");
    modal.classList.remove("hidden");

    // Initialize form
    this.initializeProposalForm();

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector("input");
      if (firstInput) firstInput.focus();
    }, 100);
  },

  // Initialize proposal form functionality
  initializeProposalForm() {
    // Character counter for message
    const messageTextarea = document.getElementById("investmentMessage");
    if (messageTextarea) {
      const charCounter = document.createElement("div");
      charCounter.className = "char-counter";
      messageTextarea.parentNode.appendChild(charCounter);

      const updateCounter = () => {
        const length = messageTextarea.value.length;
        charCounter.textContent = `${length} characters`;
        charCounter.style.color = length < 50 ? "#ef4444" : "#059669";
      };

      messageTextarea.addEventListener("input", updateCounter);
      updateCounter();
    }

    // Investment amount formatter
    const amountInput = document.getElementById("investmentAmount");
    if (amountInput) {
      amountInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value) {
          const formatted = Number(value).toLocaleString("en-IN");
          e.target.setAttribute("data-formatted", formatted);
        }
      });
    }

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Handle proposal form submission
  async handleProposalSubmission(form) {
    if (this.state.isSubmitting) return;

    const formData = new FormData(form);
    const submitBtn = document.getElementById("submitProposalBtn");

    // Validate form
    if (!this.validateProposalForm(formData)) {
      return;
    }

    this.state.isSubmitting = true;

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
      // Prepare proposal data
      const proposalData = {
        businessIdeaId: formData.get("businessIdeaId"),
        amount: parseInt(formData.get("amount")),
        equity: formData.get("equity") ? parseFloat(formData.get("equity")) : 0,
        message: formData.get("message").trim(),
        terms: formData.get("terms").trim(),
      };

      // Submit proposal
      const result = await FirebaseService.createInvestmentProposal(proposalData);

      if (result.success) {
        // Show success message
        Utils.showSuccess("Investment proposal submitted successfully! The entrepreneur will be notified.");

        // Close modal
        this.closeModal();

        // Refresh proposals list
        this.loadMyProposals();

        // Navigate to dashboard to see the new proposal
        if (typeof navigateToSection !== "undefined") {
          navigateToSection("dashboard");
        }
      } else {
        Utils.showError(result.error);
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      Utils.showError("Failed to submit investment proposal. Please try again.");
    } finally {
      this.state.isSubmitting = false;
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

    if (window.lucide) {
      lucide.createIcons();
    }
    }
  },

  // Validate proposal form
  validateProposalForm(formData) {
    const errors = [];

    // Required fields
    const requiredFields = ["amount", "message"];
    requiredFields.forEach((field) => {
      const value = formData.get(field);
      if (!value || !value.toString().trim()) {
        errors.push(`${this.getFieldLabel(field)} is required`);
      }
    });

    // Investment amount validation
    const amount = parseInt(formData.get("amount"));
    if (isNaN(amount) || amount < 10000) {
      errors.push("Investment amount must be at least ₹10,000");
    }

    // Message minimum length
    const message = formData.get("message");
    if (message && message.length < 50) {
      errors.push("Investment message must be at least 50 characters long");
    }

    // Equity validation
    const equity = formData.get("equity");
    if (equity && (isNaN(equity) || equity < 0 || equity > 100)) {
      errors.push("Equity percentage must be between 0 and 100");
    }

    if (errors.length > 0) {
      Utils.showError("Please fix the following errors:\n• " + errors.join("\n• "));
      return false;
    }

    return true;
  },

  // Get field labels for validation messages
  getFieldLabel(fieldName) {
    const labels = {
      amount: "Investment Amount",
      message: "Investment Message",
      equity: "Equity Percentage",
    };
    return labels[fieldName] || fieldName;
  },

  // Toggle save/unsave idea
  async toggleSaveIdea(ideaId) {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        Utils.showWarning("Please sign in to save business ideas");
      return;
    }

      const isSaved = this.state.savedIdeas.includes(ideaId);
      
      if (isSaved) {
        // Remove from saved
        this.state.savedIdeas = this.state.savedIdeas.filter(id => id !== ideaId);
        Utils.showSuccess("Business idea removed from saved list");
      } else {
        // Add to saved
        this.state.savedIdeas.push(ideaId);
        Utils.showSuccess("Business idea saved to your list");
      }

      // Update UI
      this.updateSaveButtonUI(ideaId, !isSaved);
      
      // Save to localStorage for persistence
      localStorage.setItem(`savedIdeas_${currentUser.uid}`, JSON.stringify(this.state.savedIdeas));

    } catch (error) {
      console.error("Error toggling saved idea:", error);
      Utils.showError("Failed to update saved list");
    }
  },

  // Update save button UI
  updateSaveButtonUI(ideaId, isSaved) {
    const saveButtons = document.querySelectorAll(`[data-idea-id="${ideaId}"].save-idea-btn`);
    saveButtons.forEach(button => {
      if (isSaved) {
        button.innerHTML = '<i data-lucide="bookmark"></i> Saved';
        button.classList.add("saved");
    } else {
        button.innerHTML = '<i data-lucide="bookmark-plus"></i> Save';
        button.classList.remove("saved");
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Load saved ideas from localStorage
  loadSavedIdeas() {
    const currentUser = auth?.currentUser;
    if (!currentUser) return;

    try {
      const saved = localStorage.getItem(`savedIdeas_${currentUser.uid}`);
      if (saved) {
        this.state.savedIdeas = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading saved ideas:", error);
    }
  },

  // Load user's investment proposals
  async loadMyProposals() {
    const currentUser = auth?.currentUser;
    if (!currentUser) return;

    try {
      const result = await FirebaseService.getInvestmentProposals({
        investorId: currentUser.uid,
      });

      if (result.success) {
        this.state.myProposals = result.data;
        this.updateProposalsDisplay();
      }
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  },

  // Update proposals display in dashboard
  updateProposalsDisplay() {
    const proposalsCountElement = document.querySelector(".my-proposals-count");
    if (proposalsCountElement) {
      proposalsCountElement.textContent = this.state.myProposals.length;
    }

    const pendingCountElement = document.querySelector(".pending-reviews");
    if (pendingCountElement) {
      const pendingCount = this.state.myProposals.filter(p => p.status === "pending").length;
      pendingCountElement.textContent = pendingCount;
    }
  },

  // Close investment modal
  closeModal() {
    const modal = document.getElementById("investmentModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.remove();
    }
    document.body.classList.remove("modal-open");
  },

  // Get saved ideas count
  getSavedIdeasCount() {
    return this.state.savedIdeas.length;
  },

  // Get proposals count
  getProposalsCount() {
    return this.state.myProposals.length;
  },

  // Get pending proposals count
  getPendingProposalsCount() {
    return this.state.myProposals.filter(p => p.status === "pending").length;
  },
};

// Make functions globally available
window.InvestmentManager = InvestmentManager;

// Global function for showing investment modal
window.showInvestmentModal = (ideaId) => {
  InvestmentManager.showInvestmentModal(ideaId);
};

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  InvestmentManager.init();
});

