// Real Business Idea Posting System
// Add this to your business.js file or create a new file

const BusinessIdeaManager = {
  // State management
  state: {
    isSubmitting: false,
    currentIdea: null,
    userIdeas: [],
  },

  // Initialize the business idea manager
  init() {
    console.log("Initializing Business Idea Manager...");
    this.bindEvents();
    this.loadUserIdeas();
  },

  // Bind event listeners
  bindEvents() {
    // Add business idea button in dashboard
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(".add-business-idea-btn") ||
        e.target.closest(".add-business-idea-btn")
      ) {
        this.showBusinessIdeaModal();
      }

      if (
        e.target.matches(".view-idea-btn") ||
        e.target.closest(".view-idea-btn")
      ) {
        const ideaId =
          e.target.dataset.ideaId ||
          e.target.closest(".view-idea-btn").dataset.ideaId;
        this.viewIdeaDetails(ideaId);
      }

      if (
        e.target.matches(".edit-idea-btn") ||
        e.target.closest(".edit-idea-btn")
      ) {
        const ideaId =
          e.target.dataset.ideaId ||
          e.target.closest(".edit-idea-btn").dataset.ideaId;
        this.editBusinessIdea(ideaId);
      }
    });

    // Form submission
    document.addEventListener("submit", (e) => {
      if (e.target.id === "businessIdeaForm") {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });
  },

  // Show business idea modal
  showBusinessIdeaModal(ideaData = null) {
    const modalHTML = this.createBusinessIdeaModal(ideaData);

    // Remove existing modal
    const existingModal = document.getElementById("businessIdeaModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Show modal
    const modal = document.getElementById("businessIdeaModal");
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    // Initialize form
    this.initializeForm();

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector("input");
      if (firstInput) firstInput.focus();
    }, 100);
  },

  // Create business idea modal HTML
  createBusinessIdeaModal(ideaData = null) {
    const isEditing = ideaData !== null;
    const title = isEditing ? "Edit Business Idea" : "Post Your Business Idea";
    const submitText = isEditing ? "Update Idea" : "Publish Idea";

    return `
      <div id="businessIdeaModal" class="modal hidden">
        <div class="modal-overlay" onclick="BusinessIdeaManager.closeModal()"></div>
        <div class="modal-content business-idea-modal">
          <button class="modal-close" onclick="BusinessIdeaManager.closeModal()">
            <i data-lucide="x"></i>
          </button>

          <div class="modal-header">
            <h2>${title}</h2>
            <p>Share your innovative business concept with potential investors</p>
          </div>

          <form id="businessIdeaForm" class="business-idea-form">
            <input type="hidden" id="ideaId" value="${ideaData?.id || ""}">

            <div class="form-section">
              <h3>Basic Information</h3>

              <div class="form-group">
                <label for="ideaTitle">Business Idea Title *</label>
                <input type="text" id="ideaTitle" name="title" required
                       value="${ideaData?.title || ""}"
                       placeholder="e.g., AI-Powered E-commerce Platform">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="ideaCategory">Category *</label>
                  <select id="ideaCategory" name="category" required>
                    <option value="">Select Category</option>
                    <option value="technology" ${
                      ideaData?.category === "technology" ? "selected" : ""
                    }>Technology</option>
                    <option value="healthcare" ${
                      ideaData?.category === "healthcare" ? "selected" : ""
                    }>Healthcare</option>
                    <option value="finance" ${
                      ideaData?.category === "finance" ? "selected" : ""
                    }>Finance</option>
                    <option value="education" ${
                      ideaData?.category === "education" ? "selected" : ""
                    }>Education</option>
                    <option value="ecommerce" ${
                      ideaData?.category === "ecommerce" ? "selected" : ""
                    }>E-commerce</option>
                    <option value="manufacturing" ${
                      ideaData?.category === "manufacturing" ? "selected" : ""
                    }>Manufacturing</option>
                    <option value="agriculture" ${
                      ideaData?.category === "agriculture" ? "selected" : ""
                    }>Agriculture</option>
                    <option value="retail" ${
                      ideaData?.category === "retail" ? "selected" : ""
                    }>Retail</option>
                    <option value="services" ${
                      ideaData?.category === "services" ? "selected" : ""
                    }>Services</option>
                    <option value="other" ${
                      ideaData?.category === "other" ? "selected" : ""
                    }>Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="ideaLocation">Location *</label>
                  <input type="text" id="ideaLocation" name="location" required
                         value="${ideaData?.location || ""}"
                         placeholder="e.g., Mumbai, Maharashtra">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Business Details</h3>

              <div class="form-group">
                <label for="ideaDescription">Detailed Description *</label>
                <textarea id="ideaDescription" name="description" required rows="6"
                          placeholder="Describe your business idea, target market, unique value proposition, and competitive advantages...">${
                            ideaData?.description || ""
                          }</textarea>
                <small>Minimum 100 characters</small>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fundingNeeded">Funding Required (₹) *</label>
                  <input type="number" id="fundingNeeded" name="fundingNeeded" required
                         value="${ideaData?.fundingNeeded || ""}"
                         placeholder="e.g., 1500000" min="10000" max="100000000">
                  <small>Minimum ₹10,000</small>
                </div>

                <div class="form-group">
                  <label for="ideaTimeline">Project Timeline *</label>
                  <select id="ideaTimeline" name="timeline" required>
                    <option value="">Select Timeline</option>
                    <option value="3-6 months" ${
                      ideaData?.timeline === "3-6 months" ? "selected" : ""
                    }>3-6 months</option>
                    <option value="6-12 months" ${
                      ideaData?.timeline === "6-12 months" ? "selected" : ""
                    }>6-12 months</option>
                    <option value="1-2 years" ${
                      ideaData?.timeline === "1-2 years" ? "selected" : ""
                    }>1-2 years</option>
                    <option value="2-3 years" ${
                      ideaData?.timeline === "2-3 years" ? "selected" : ""
                    }>2-3 years</option>
                    <option value="3+ years" ${
                      ideaData?.timeline === "3+ years" ? "selected" : ""
                    }>3+ years</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="projectedReturns">Projected Returns</label>
                <textarea id="projectedReturns" name="projectedReturns" rows="3"
                          placeholder="Describe expected ROI, revenue projections, market size, etc...">${
                            ideaData?.projectedReturns || ""
                          }</textarea>
              </div>
            </div>

            <div class="form-section">
              <h3>Additional Information</h3>

              <div class="form-group">
                <label for="ideaTags">Keywords/Tags</label>
                <input type="text" id="ideaTags" name="tags"
                       value="${ideaData?.tags?.join(", ") || ""}"
                       placeholder="e.g., AI, Machine Learning, SaaS, B2B">
                <small>Separate tags with commas</small>
              </div>

              <div class="form-group">
                <label for="businessPlan">Business Plan Summary</label>
                <textarea id="businessPlan" name="businessPlan" rows="4"
                          placeholder="Provide a high-level overview of your business model, marketing strategy, and operational plan...">${
                            ideaData?.businessPlan || ""
                          }</textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" onclick="BusinessIdeaManager.closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="submitIdeaBtn">
                <i data-lucide="rocket"></i>
                ${submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // Initialize form functionality
  initializeForm() {
    // Character counter for description
    const descriptionTextarea = document.getElementById("ideaDescription");
    if (descriptionTextarea) {
      const charCounter = document.createElement("div");
      charCounter.className = "char-counter";
      descriptionTextarea.parentNode.appendChild(charCounter);

      const updateCounter = () => {
        const length = descriptionTextarea.value.length;
        charCounter.textContent = `${length} characters`;
        charCounter.style.color = length < 100 ? "#ef4444" : "#059669";
      };

      descriptionTextarea.addEventListener("input", updateCounter);
      updateCounter();
    }

    // Funding amount formatter
    const fundingInput = document.getElementById("fundingNeeded");
    if (fundingInput) {
      fundingInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value) {
          // Add commas for better readability
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

  // Handle form submission
  async handleFormSubmission(form) {
    if (this.state.isSubmitting) return;

    const formData = new FormData(form);
    const submitBtn = document.getElementById("submitIdeaBtn");

    // Validate form
    if (!this.validateForm(formData)) {
      return;
    }

    this.state.isSubmitting = true;

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i data-lucide="loader" class="animate-spin"></i> Publishing...';
    submitBtn.disabled = true;

    try {
      // Prepare idea data
      const ideaData = {
        title: formData.get("title").trim(),
        category: formData.get("category"),
        description: formData.get("description").trim(),
        fundingNeeded: parseInt(formData.get("fundingNeeded")),
        timeline: formData.get("timeline"),
        location: formData.get("location").trim(),
        projectedReturns: formData.get("projectedReturns").trim(),
        businessPlan: formData.get("businessPlan").trim(),
        tags: formData.get("tags")
          ? formData
              .get("tags")
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      const ideaId =
        formData.get("ideaId") || document.getElementById("ideaId")?.value;

      let result;
      if (ideaId) {
        // Update existing idea
        result = await FirebaseService.updateBusinessIdea(ideaId, ideaData);
      } else {
        // Create new idea
        result = await FirebaseService.createBusinessIdea(ideaData);
      }

      if (result.success) {
        // Show success message
        this.showSuccessMessage(result.message);

        // Close modal
        this.closeModal();

        // Refresh user ideas
        this.loadUserIdeas();

        // Refresh browse section if visible
        if (window.App && typeof window.App.loadBusinessIdeas === "function") {
          window.App.loadBusinessIdeas();
        }

        // Navigate to browse section to see the new idea
        if (typeof navigateToSection !== "undefined") {
          navigateToSection("browse");
        }
      } else {
        this.showErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Error submitting business idea:", error);
      this.showErrorMessage(
        "Failed to publish business idea. Please try again."
      );
    } finally {
      this.state.isSubmitting = false;
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (window.lucide) {
        lucide.createIcons();
      }
    }
  },

  // Validate form data
  validateForm(formData) {
    const errors = [];

    // Required fields
    const requiredFields = [
      "title",
      "category",
      "description",
      "fundingNeeded",
      "timeline",
      "location",
    ];
    requiredFields.forEach((field) => {
      const value = formData.get(field);
      if (!value || !value.toString().trim()) {
        errors.push(`${this.getFieldLabel(field)} is required`);
      }
    });

    // Description minimum length
    const description = formData.get("description");
    if (description && description.length < 100) {
      errors.push("Description must be at least 100 characters long");
    }

    // Funding amount validation
    const fundingNeeded = parseInt(formData.get("fundingNeeded"));
    if (isNaN(fundingNeeded) || fundingNeeded < 10000) {
      errors.push("Funding amount must be at least ₹10,000");
    }

    if (fundingNeeded > 100000000) {
      errors.push("Funding amount cannot exceed ₹10 crores");
    }

    // Title length
    const title = formData.get("title");
    if (title && title.length > 100) {
      errors.push("Title cannot exceed 100 characters");
    }

    if (errors.length > 0) {
      this.showErrorMessage(
        "Please fix the following errors:\n• " + errors.join("\n• ")
      );
      return false;
    }

    return true;
  },

  // Get field labels for validation messages
  getFieldLabel(fieldName) {
    const labels = {
      title: "Title",
      category: "Category",
      description: "Description",
      fundingNeeded: "Funding Required",
      timeline: "Timeline",
      location: "Location",
    };
    return labels[fieldName] || fieldName;
  },

  // Load user's business ideas
  async loadUserIdeas() {
    const currentUser = auth?.currentUser;
    if (!currentUser) return;

    try {
      const result = await FirebaseService.getBusinessIdeas({
        authorId: currentUser.uid,
      });

      if (result.success) {
        this.state.userIdeas = result.data;
        this.updateUserIdeasDisplay();
      }
    } catch (error) {
      console.error("Error loading user ideas:", error);
    }
  },

  // Update dashboard display of user ideas
  updateUserIdeasDisplay() {
    const ideaCountElement = document.querySelector(".idea-count");
    if (ideaCountElement) {
      ideaCountElement.textContent = this.state.userIdeas.length;
    }

    const ideasContainer = document.getElementById("userIdeasContainer");
    if (ideasContainer) {
      if (this.state.userIdeas.length === 0) {
        ideasContainer.innerHTML = `
          <div class="empty-ideas">
            <i data-lucide="lightbulb"></i>
            <h4>No business ideas yet</h4>
            <p>Share your first innovative idea with investors!</p>
            <button class="btn btn-primary add-business-idea-btn">
              <i data-lucide="plus"></i> Post Your First Idea
            </button>
          </div>
        `;
      } else {
        const ideasHTML = this.state.userIdeas
          .map((idea) => this.createIdeaCard(idea, true))
          .join("");
        ideasContainer.innerHTML = ideasHTML;
      }

      if (window.lucide) {
        lucide.createIcons();
      }
    }
  },

  // Create idea card HTML
  createIdeaCard(idea, showActions = false) {
    const fundingAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(idea.fundingNeeded);

    const timeAgo = this.timeAgo(idea.createdAt?.toDate() || new Date());
    const category = this.capitalizeFirst(idea.category);

    return `
      <div class="idea-card" data-idea-id="${idea.id}">
        <div class="idea-header">
          <div class="idea-category">${category}</div>
          <div class="idea-funding">${fundingAmount}</div>
        </div>
        <div class="idea-content">
          <h3 class="idea-title">${idea.title}</h3>
          <p class="idea-description">${this.truncateText(
            idea.description,
            120
          )}</p>
          <div class="idea-meta">
            <span class="idea-timeline">
              <i data-lucide="clock"></i>
              ${idea.timeline}
            </span>
            <span class="idea-location">
              <i data-lucide="map-pin"></i>
              ${idea.location}
            </span>
            <span class="idea-time">
              <i data-lucide="calendar"></i>
              ${timeAgo}
            </span>
          </div>
          ${
            idea.viewCount
              ? `<div class="idea-stats">
            <span class="view-count">
              <i data-lucide="eye"></i>
              ${idea.viewCount} views
            </span>
          </div>`
              : ""
          }
        </div>
        <div class="idea-actions">
          <button class="btn btn-outline btn-small view-idea-btn" data-idea-id="${
            idea.id
          }">
            <i data-lucide="eye"></i>
            View Details
          </button>
          ${
            showActions
              ? `
            <button class="btn btn-primary btn-small edit-idea-btn" data-idea-id="${idea.id}">
              <i data-lucide="edit"></i>
              Edit
            </button>
          `
              : ""
          }
          ${
            !showActions && auth?.currentUser?.uid !== idea.authorId
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

  // View idea details
  async viewIdeaDetails(ideaId) {
    try {
      const result = await FirebaseService.getBusinessIdea(ideaId);

      if (result.success) {
        this.showIdeaDetailsModal(result.data);
      } else {
        this.showErrorMessage("Could not load business idea details.");
      }
    } catch (error) {
      console.error("Error viewing idea details:", error);
      this.showErrorMessage("Failed to load business idea details.");
    }
  },

  // Show idea details modal
  showIdeaDetailsModal(idea) {
    const fundingAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(idea.fundingNeeded);

    const modalHTML = `
      <div id="ideaDetailsModal" class="modal">
        <div class="modal-overlay" onclick="BusinessIdeaManager.closeDetailsModal()"></div>
        <div class="modal-content idea-details-modal">
          <button class="modal-close" onclick="BusinessIdeaManager.closeDetailsModal()">
            <i data-lucide="x"></i>
          </button>

          <div class="idea-details">
            <div class="idea-header">
              <div class="idea-badges">
                <span class="category-badge">${this.capitalizeFirst(
                  idea.category
                )}</span>
                <span class="funding-badge">${fundingAmount}</span>
              </div>
              <h1>${idea.title}</h1>
              <div class="idea-meta">
                <span><i data-lucide="user"></i> ${
                  idea.author?.name || "Anonymous"
                }</span>
                <span><i data-lucide="building"></i> ${
                  idea.author?.company || "Individual"
                }</span>
                <span><i data-lucide="map-pin"></i> ${idea.location}</span>
                <span><i data-lucide="clock"></i> ${idea.timeline}</span>
                ${
                  idea.viewCount
                    ? `<span><i data-lucide="eye"></i> ${idea.viewCount} views</span>`
                    : ""
                }
              </div>
            </div>

            <div class="idea-content">
              <section>
                <h3>Business Description</h3>
                <p>${idea.description}</p>
              </section>

              ${
                idea.projectedReturns
                  ? `
                <section>
                  <h3>Projected Returns</h3>
                  <p>${idea.projectedReturns}</p>
                </section>
              `
                  : ""
              }

              ${
                idea.businessPlan
                  ? `
                <section>
                  <h3>Business Plan Overview</h3>
                  <p>${idea.businessPlan}</p>
                </section>
              `
                  : ""
              }

              ${
                idea.tags && idea.tags.length > 0
                  ? `
                <section>
                  <h3>Tags</h3>
                  <div class="tags">
                    ${idea.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                  </div>
                </section>
              `
                  : ""
              }
            </div>

            <div class="idea-actions">
              ${
                auth?.currentUser && auth.currentUser.uid !== idea.authorId
                  ? `
                <button class="btn btn-primary" onclick="InvestmentManager.showInvestmentModal('${idea.id}')">
                  <i data-lucide="trending-up"></i>
                  Make Investment Proposal
                </button>
                <button class="btn btn-outline">
                  <i data-lucide="message-circle"></i>
                  Contact Entrepreneur
                </button>
              `
                  : ""
              }
              ${
                auth?.currentUser && auth.currentUser.uid === idea.authorId
                  ? `
                <button class="btn btn-primary" onclick="BusinessIdeaManager.editBusinessIdea('${idea.id}')">
                  <i data-lucide="edit"></i>
                  Edit Idea
                </button>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("ideaDetailsModal");
    if (existingModal) existingModal.remove();

    // Add modal
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.body.classList.add("modal-open");

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Edit business idea
  async editBusinessIdea(ideaId) {
    try {
      const result = await FirebaseService.getBusinessIdea(ideaId);

      if (result.success) {
        this.closeDetailsModal();
        this.showBusinessIdeaModal(result.data);
      } else {
        this.showErrorMessage("Could not load business idea for editing.");
      }
    } catch (error) {
      console.error("Error loading idea for editing:", error);
      this.showErrorMessage("Failed to load business idea for editing.");
    }
  },

  // Close modals
  closeModal() {
    const modal = document.getElementById("businessIdeaModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.remove();
    }
    document.body.classList.remove("modal-open");
  },

  closeDetailsModal() {
    const modal = document.getElementById("ideaDetailsModal");
    if (modal) {
      modal.remove();
    }
    document.body.classList.remove("modal-open");
  },

  // Utility functions
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  },

  timeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  },

  showSuccessMessage(message) {
    this.showToast(message, "success");
  },

  showErrorMessage(message) {
    this.showToast(message, "error");
  },

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icon =
      type === "success"
        ? "check-circle"
        : type === "error"
        ? "alert-circle"
        : "info";

    toast.innerHTML = `
      <div class="toast-content">
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i data-lucide="x"></i>
      </button>
    `;

    // Style the toast
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#10b981"
          : type === "error"
          ? "#ef4444"
          : "#3b82f6"
      };
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    if (window.lucide) {
      lucide.createIcons();
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  },
};

// Make functions globally available
window.BusinessIdeaManager = BusinessIdeaManager;

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  BusinessIdeaManager.init();
});

// Replace the placeholder function in dashboard
window.showAddBusinessIdeaModal = () => {
  BusinessIdeaManager.showBusinessIdeaModal();
};
