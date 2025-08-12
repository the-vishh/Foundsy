// Business Ideas Management Module for FundFound Platform
// Handles CRUD operations for business ideas, file uploads, and idea management

const Business = {
  // Module state
  state: {
    currentIdea: null,
    userIdeas: [],
    isLoading: false,
    uploadProgress: 0,
    categories: [
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
      "real-estate",
      "transportation",
      "entertainment",
      "fashion",
      "sports",
      "other",
    ],
  },

  // DOM elements cache
  elements: {
    createIdeaModal: null,
    editIdeaModal: null,
    viewIdeaModal: null,
    createIdeaForm: null,
    editIdeaForm: null,
    fileUploadArea: null,
    uploadProgress: null,
    businessPlanPreview: null,
  },

  // Initialize business module
  init() {
    console.log("Initializing Business Module...");

    this.cacheElements();
    this.bindEvents();
    this.initializeFileUpload();
    this.loadUserIdeas();

    console.log("Business Module initialized successfully");
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      createIdeaModal: Utils.getElementById("createIdeaModal"),
      editIdeaModal: Utils.getElementById("editIdeaModal"),
      viewIdeaModal: Utils.getElementById("viewIdeaModal"),
      createIdeaForm: Utils.getElementById("createIdeaForm"),
      editIdeaForm: Utils.getElementById("editIdeaForm"),
      fileUploadArea: Utils.getElementById("fileUploadArea"),
      uploadProgress: Utils.getElementById("uploadProgress"),
      businessPlanPreview: Utils.getElementById("businessPlanPreview"),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Create idea form submission
    if (this.elements.createIdeaForm) {
      this.elements.createIdeaForm.addEventListener(
        "submit",
        this.handleCreateIdea.bind(this)
      );
    }

    // Edit idea form submission
    if (this.elements.editIdeaForm) {
      this.elements.editIdeaForm.addEventListener(
        "submit",
        this.handleEditIdea.bind(this)
      );
    }

    // File upload events
    this.bindFileUploadEvents();

    // Form validation events
    this.bindFormValidation();

    // Modal events
    this.bindModalEvents();
  },

  // Bind file upload events
  bindFileUploadEvents() {
    const fileInputs = Utils.querySelectorAll('input[type="file"]');

    fileInputs.forEach((input) => {
      input.addEventListener("change", this.handleFileSelect.bind(this));
    });

    // Drag and drop events
    if (this.elements.fileUploadArea) {
      this.elements.fileUploadArea.addEventListener(
        "dragover",
        this.handleDragOver.bind(this)
      );
      this.elements.fileUploadArea.addEventListener(
        "dragleave",
        this.handleDragLeave.bind(this)
      );
      this.elements.fileUploadArea.addEventListener(
        "drop",
        this.handleFileDrop.bind(this)
      );
    }
  },

  // Bind form validation events
  bindFormValidation() {
    // Real-time validation for funding amount
    const fundingInputs = Utils.querySelectorAll('input[name="fundingNeeded"]');
    fundingInputs.forEach((input) => {
      input.addEventListener("input", this.validateFundingAmount.bind(this));
    });

    // Category selection validation
    const categorySelects = Utils.querySelectorAll('select[name="category"]');
    categorySelects.forEach((select) => {
      select.addEventListener("change", this.validateCategory.bind(this));
    });

    // Description length validation
    const descriptionInputs = Utils.querySelectorAll(
      'textarea[name="description"]'
    );
    descriptionInputs.forEach((textarea) => {
      textarea.addEventListener("input", this.validateDescription.bind(this));
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

    // Close modals on overlay click
    const modals = [
      this.elements.createIdeaModal,
      this.elements.editIdeaModal,
      this.elements.viewIdeaModal,
    ];
    modals.forEach((modal) => {
      if (modal) {
        const overlay = modal.querySelector(".modal-overlay");
        if (overlay) {
          overlay.addEventListener("click", () => this.closeModal(modal));
        }
      }
    });
  },

  // Initialize file upload functionality
  initializeFileUpload() {
    this.createFileUploadArea();
  },

  // Create file upload area HTML
  createFileUploadArea() {
    const containers = Utils.querySelectorAll(".file-upload-container");

    containers.forEach((container) => {
      if (container.innerHTML.trim() === "") {
        container.innerHTML = `
                    <div class="file-upload-area" id="fileUploadArea">
                        <div class="upload-content">
                            <i data-lucide="upload-cloud" class="upload-icon"></i>
                            <h3>Upload Business Plan</h3>
                            <p>Drag and drop your file here or click to browse</p>
                            <p class="file-types">Supported: PDF, DOC, DOCX (Max: 10MB)</p>
                            <input type="file" id="businessPlanFile" name="businessPlan"
                                   accept=".pdf,.doc,.docx" class="file-input hidden">
                        </div>
                        <div class="upload-progress hidden" id="uploadProgress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-text">Uploading... 0%</span>
                        </div>
                        <div class="file-preview hidden" id="businessPlanPreview">
                            <div class="preview-content">
                                <i data-lucide="file-text" class="file-icon"></i>
                                <div class="file-info">
                                    <span class="file-name"></span>
                                    <span class="file-size"></span>
                                </div>
                                <button type="button" class="remove-file-btn" onclick="Business.removeFile()">
                                    <i data-lucide="x"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

        // Re-initialize icons
        if (window.lucide) {
          lucide.createIcons();
        }

        // Re-cache elements and bind events
        this.cacheElements();
        this.bindFileUploadEvents();
      }
    });
  },

  // Load user's business ideas
  async loadUserIdeas() {
    if (!App.state.isAuthenticated || !App.state.currentUser) return;

    try {
      this.state.isLoading = true;

      const filters = {
        authorId: App.state.currentUser.uid,
      };

      const result = await FirebaseService.getBusinessIdeas(filters);

      if (result.success) {
        this.state.userIdeas = result.data;
        this.renderUserIdeas();
        this.updateIdeaStats();
      } else {
        console.error("Failed to load user ideas:", result.error);
        Utils.showError("Failed to load your business ideas");
      }
    } catch (error) {
      console.error("Error loading user ideas:", error);
      Utils.showError("Failed to load your business ideas");
    } finally {
      this.state.isLoading = false;
    }
  },

  // Render user ideas in dashboard
  renderUserIdeas() {
    const container = Utils.getElementById("userIdeasContainer");
    if (!container) return;

    if (this.state.userIdeas.length === 0) {
      container.innerHTML = this.createEmptyIdeasHTML();
      return;
    }

    container.innerHTML = `
            <div class="ideas-grid">
                ${this.state.userIdeas
                  .map((idea) => this.createIdeaCardHTML(idea))
                  .join("")}
            </div>
        `;

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Create empty ideas HTML
  createEmptyIdeasHTML() {
    return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="lightbulb"></i>
                </div>
                <h3>No Business Ideas Yet</h3>
                <p>Start your entrepreneurial journey by sharing your first business idea.</p>
                <button class="btn btn-primary" onclick="Business.showCreateIdeaModal()">
                    <i data-lucide="plus"></i>
                    Create Your First Idea
                </button>
            </div>
        `;
  },

  // Create idea card HTML
  createIdeaCardHTML(idea) {
    const status = idea.status || Status.BUSINESS_IDEA.DRAFT;
    const fundingAmount = Utils.formatCurrency(idea.fundingNeeded);
    const timeAgo = Utils.timeAgo(idea.createdAt);
    const category = Utils.capitalizeFirst(idea.category);

    return `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-header">
                    <div class="idea-status status-${status}">
                        ${Utils.capitalizeFirst(status)}
                    </div>
                    <div class="idea-actions">
                        <button class="btn-icon" onclick="Business.editIdea('${
                          idea.id
                        }')" title="Edit">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon" onclick="Business.deleteIdea('${
                          idea.id
                        }')" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="idea-content">
                    <h3 class="idea-title">${idea.title}</h3>
                    <div class="idea-meta">
                        <span class="idea-category">${category}</span>
                        <span class="idea-funding">${fundingAmount}</span>
                    </div>
                    <p class="idea-description">${Utils.truncateText(
                      idea.description,
                      100
                    )}</p>
                </div>

                <div class="idea-footer">
                    <div class="idea-stats">
                        <span class="stat">
                            <i data-lucide="eye"></i>
                            ${idea.views || 0} views
                        </span>
                        <span class="stat">
                            <i data-lucide="users"></i>
                            ${idea.interestedInvestors?.length || 0} interested
                        </span>
                    </div>
                    <div class="idea-time">
                        <i data-lucide="calendar"></i>
                        ${timeAgo}
                    </div>
                </div>

                <div class="idea-actions-footer">
                    <button class="btn btn-outline btn-small" onclick="Business.viewIdea('${
                      idea.id
                    }')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    ${
                      status === Status.BUSINESS_IDEA.DRAFT
                        ? `
                        <button class="btn btn-primary btn-small" onclick="Business.publishIdea('${idea.id}')">
                            <i data-lucide="send"></i>
                            Publish
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  },

  // Update idea statistics
  updateIdeaStats() {
    const stats = this.calculateIdeaStats();

    const totalIdeasElement = Utils.getElementById("totalIdeas");
    const publishedIdeasElement = Utils.getElementById("publishedIdeas");
    const totalViewsElement = Utils.getElementById("totalViews");
    const totalInterestElement = Utils.getElementById("totalInterest");

    if (totalIdeasElement) totalIdeasElement.textContent = stats.total;
    if (publishedIdeasElement)
      publishedIdeasElement.textContent = stats.published;
    if (totalViewsElement) totalViewsElement.textContent = stats.views;
    if (totalInterestElement) totalInterestElement.textContent = stats.interest;
  },

  // Calculate idea statistics
  calculateIdeaStats() {
    const stats = {
      total: this.state.userIdeas.length,
      published: 0,
      views: 0,
      interest: 0,
    };

    this.state.userIdeas.forEach((idea) => {
      if (idea.status === Status.BUSINESS_IDEA.PUBLISHED) {
        stats.published++;
      }
      stats.views += idea.views || 0;
      stats.interest += idea.interestedInvestors?.length || 0;
    });

    return stats;
  },

  // Handle create idea form submission
  async handleCreateIdea(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!this.validateIdeaForm(form)) {
      return;
    }

    const formData = Utils.getFormData(form);

    try {
      this.state.isLoading = true;
      Utils.showLoading(submitBtn, "Creating...");

      // Upload business plan if provided
      let businessPlanURL = "";
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        const uploadResult = await this.uploadBusinessPlan(fileInput.files[0]);
        if (uploadResult.success) {
          businessPlanURL = uploadResult.url;
        } else {
          throw new Error("Failed to upload business plan");
        }
      }

      // Prepare idea data
      const ideaData = {
        authorId: App.state.currentUser.uid,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        fundingNeeded: parseFloat(formData.fundingNeeded),
        businessPlan: businessPlanURL,
        projectedReturns: formData.projectedReturns,
        timeline: formData.timeline,
        status:
          formData.saveAsDraft === "true"
            ? Status.BUSINESS_IDEA.DRAFT
            : Status.BUSINESS_IDEA.PUBLISHED,
      };

      const result = await FirebaseService.createBusinessIdea(ideaData);

      if (result.success) {
        Utils.showSuccess("Business idea created successfully!");
        this.closeModal(this.elements.createIdeaModal);
        this.loadUserIdeas(); // Reload user ideas

        // Navigate to idea view if published
        if (ideaData.status === Status.BUSINESS_IDEA.PUBLISHED) {
          setTimeout(() => {
            this.viewIdea(result.id);
          }, 1000);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating business idea:", error);
      Utils.showError("Failed to create business idea. Please try again.");
    } finally {
      this.state.isLoading = false;
      Utils.hideLoading(submitBtn);
    }
  },

  // Handle edit idea form submission
  async handleEditIdea(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const ideaId = form.dataset.ideaId;

    if (!ideaId || !this.validateIdeaForm(form)) {
      return;
    }

    const formData = Utils.getFormData(form);

    try {
      this.state.isLoading = true;
      Utils.showLoading(submitBtn, "Updating...");

      // Upload new business plan if provided
      let businessPlanURL = this.state.currentIdea.businessPlan;
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        const uploadResult = await this.uploadBusinessPlan(fileInput.files[0]);
        if (uploadResult.success) {
          businessPlanURL = uploadResult.url;
        }
      }

      // Prepare update data
      const updateData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        fundingNeeded: parseFloat(formData.fundingNeeded),
        businessPlan: businessPlanURL,
        projectedReturns: formData.projectedReturns,
        timeline: formData.timeline,
      };

      const result = await FirebaseService.updateBusinessIdea(
        ideaId,
        updateData
      );

      if (result.success) {
        Utils.showSuccess("Business idea updated successfully!");
        this.closeModal(this.elements.editIdeaModal);
        this.loadUserIdeas(); // Reload user ideas
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating business idea:", error);
      Utils.showError("Failed to update business idea. Please try again.");
    } finally {
      this.state.isLoading = false;
      Utils.hideLoading(submitBtn);
    }
  },

  // Upload business plan file
  async uploadBusinessPlan(file) {
    try {
      // Validate file
      const validation = this.validateBusinessPlanFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Show upload progress
      this.showUploadProgress();

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `business-plans/${App.state.currentUser.uid}/${timestamp}_${file.name}`;

      // Upload file
      const result = await FirebaseService.uploadFile(file, fileName);

      if (result.success) {
        this.hideUploadProgress();
        this.showFilePreview(file, result.url);
        return { success: true, url: result.url };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("File upload error:", error);
      this.hideUploadProgress();
      Utils.showError(error.message || "Failed to upload business plan");
      return { success: false, error: error.message };
    }
  },

  // Validate business plan file
  validateBusinessPlanFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!file) {
      return { valid: false, error: "Please select a file" };
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only PDF, DOC, and DOCX files are allowed",
      };
    }

    return { valid: true };
  },

  // Show upload progress
  showUploadProgress() {
    const progressContainer = Utils.getElementById("uploadProgress");
    const uploadArea = Utils.getElementById("fileUploadArea");

    if (progressContainer && uploadArea) {
      Utils.hide(uploadArea.querySelector(".upload-content"));
      Utils.show(progressContainer);
    }
  },

  // Hide upload progress
  hideUploadProgress() {
    const progressContainer = Utils.getElementById("uploadProgress");
    const uploadArea = Utils.getElementById("fileUploadArea");

    if (progressContainer && uploadArea) {
      Utils.hide(progressContainer);
      Utils.show(uploadArea.querySelector(".upload-content"));
    }
  },

  // Show file preview
  showFilePreview(file, url) {
    const previewContainer = Utils.getElementById("businessPlanPreview");
    const uploadArea = Utils.getElementById("fileUploadArea");

    if (previewContainer && uploadArea) {
      const fileName = previewContainer.querySelector(".file-name");
      const fileSize = previewContainer.querySelector(".file-size");

      if (fileName) fileName.textContent = file.name;
      if (fileSize) fileSize.textContent = Utils.formatFileSize(file.size);

      Utils.hide(uploadArea.querySelector(".upload-content"));
      Utils.show(previewContainer);

      // Store URL for form submission
      previewContainer.dataset.fileUrl = url;
    }
  },

  // Remove uploaded file
  removeFile() {
    const previewContainer = Utils.getElementById("businessPlanPreview");
    const uploadArea = Utils.getElementById("fileUploadArea");
    const fileInput = Utils.getElementById("businessPlanFile");

    if (previewContainer && uploadArea) {
      Utils.hide(previewContainer);
      Utils.show(uploadArea.querySelector(".upload-content"));

      if (fileInput) {
        fileInput.value = "";
      }

      delete previewContainer.dataset.fileUrl;
    }
  },

  // Handle file selection
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.uploadBusinessPlan(file);
    }
  },

  // Handle drag over
  handleDragOver(e) {
    e.preventDefault();
    Utils.addClass(e.currentTarget, "drag-over");
  },

  // Handle drag leave
  handleDragLeave(e) {
    e.preventDefault();
    Utils.removeClass(e.currentTarget, "drag-over");
  },

  // Handle file drop
  handleFileDrop(e) {
    e.preventDefault();
    Utils.removeClass(e.currentTarget, "drag-over");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.uploadBusinessPlan(files[0]);
    }
  },

  // Validate idea form
  validateIdeaForm(form) {
    let isValid = true;
    const formData = Utils.getFormData(form);

    // Clear previous errors
    this.clearFormErrors(form);

    // Validate required fields
    const requiredFields = [
      "title",
      "category",
      "description",
      "fundingNeeded",
      "timeline",
];

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

    // Validate funding amount
    const fundingAmount = parseFloat(formData.fundingNeeded);
    if (isNaN(fundingAmount) || fundingAmount <= 0) {
      this.showFieldError(
        form,
        "fundingNeeded",
        "Please enter a valid funding amount"
      );
      isValid = false;
    }

    // Validate description length
    if (formData.description && formData.description.length < 50) {
      this.showFieldError(
        form,
        "description",
        "Description must be at least 50 characters"
      );
      isValid = false;
    }

    return isValid;
  },

  // Individual field validations
  validateFundingAmount(e) {
    const amount = parseFloat(e.target.value);
    const form = e.target.closest("form");

    if (isNaN(amount) || amount <= 0) {
      this.showFieldError(
        form,
        "fundingNeeded",
        "Please enter a valid funding amount"
      );
    } else {
      this.clearFieldError(form, "fundingNeeded");
    }
  },

  validateCategory(e) {
    const category = e.target.value;
    const form = e.target.closest("form");

    if (!category) {
      this.showFieldError(form, "category", "Please select a category");
    } else {
      this.clearFieldError(form, "category");
    }
  },

  validateDescription(e) {
    const description = e.target.value;
    const form = e.target.closest("form");

    if (description.length < 50) {
      this.showFieldError(
        form,
        "description",
        "Description must be at least 50 characters"
      );
    } else {
      this.clearFieldError(form, "description");
    }

    // Update character count
    this.updateCharacterCount(e.target);
  },

  // Update character count
  updateCharacterCount(textarea) {
    const charCount = textarea.parentElement.querySelector(".char-count");
    if (charCount) {
      const current = textarea.value.length;
      const max = textarea.getAttribute("maxlength") || 1000;
      charCount.textContent = `${current}/${max}`;
    }
  },

  // Show field error
  showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }

    // Add error class
    Utils.addClass(formGroup, "has-error");
    Utils.addClass(field, "error");

    // Add error message
    const errorElement = document.createElement("span");
    errorElement.className = "field-error";
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  },

  // Clear field error
  clearFieldError(form, fieldName) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    Utils.removeClass(formGroup, "has-error");
    Utils.removeClass(field, "error");

    const errorElement = formGroup.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  },

  // Clear all form errors
  clearFormErrors(form) {
    const errorElements = form.querySelectorAll(".field-error");
    errorElements.forEach((error) => error.remove());

    const errorFields = form.querySelectorAll(".error");
    errorFields.forEach((field) => Utils.removeClass(field, "error"));

    const errorGroups = form.querySelectorAll(".has-error");
    errorGroups.forEach((group) => Utils.removeClass(group, "has-error"));
  },

  // Get field label
  getFieldLabel(fieldName) {
    const labels = {
      title: "Title",
      category: "Category",
      description: "Description",
      fundingNeeded: "Funding Amount",
      projectedReturns: "Projected Returns",
      timeline: "Timeline",
    };
    return labels[fieldName] || "Field";
  },

  // Modal management methods
  showCreateIdeaModal() {
    if (!this.elements.createIdeaModal) {
      this.createIdeaModal();
    }
    this.openModal(this.elements.createIdeaModal);
  },

  editIdea(ideaId) {
    const idea = this.state.userIdeas.find((i) => i.id === ideaId);
    if (!idea) return;

    this.state.currentIdea = idea;

    if (!this.elements.editIdeaModal) {
      this.createEditIdeaModal();
    }

    this.populateEditForm(idea);
    this.openModal(this.elements.editIdeaModal);
  },

  viewIdea(ideaId) {
    const idea =
      this.state.userIdeas.find((i) => i.id === ideaId) ||
      App.state.businessIdeas.find((i) => i.id === ideaId);

    if (!idea) return;

    this.state.currentIdea = idea;

    if (!this.elements.viewIdeaModal) {
      this.createViewIdeaModal();
    }

    this.populateViewModal(idea);
    this.openModal(this.elements.viewIdeaModal);
  },

  async publishIdea(ideaId) {
    try {
      const result = await FirebaseService.updateBusinessIdea(ideaId, {
        status: Status.BUSINESS_IDEA.PUBLISHED,
      });

      if (result.success) {
        Utils.showSuccess("Business idea published successfully!");
        this.loadUserIdeas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error publishing idea:", error);
      Utils.showError("Failed to publish business idea");
    }
  },

  async deleteIdea(ideaId) {
    if (
      !confirm(
        "Are you sure you want to delete this business idea? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Note: You'll need to implement deleteBusinessIdea in FirebaseService
      // For now, we'll update status to indicate deletion
      const result = await FirebaseService.updateBusinessIdea(ideaId, {
        status: "deleted",
      });

      if (result.success) {
        Utils.showSuccess("Business idea deleted successfully");
        this.loadUserIdeas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
      Utils.showError("Failed to delete business idea");
    }
  },

  // Create modal HTML dynamically (simplified for now)
  createIdeaModal() {
    // This would create the modal HTML dynamically
    // For now, assume modals exist in HTML
    console.log("Create idea modal would be created here");
  },

  createEditIdeaModal() {
    console.log("Edit idea modal would be created here");
  },

  createViewIdeaModal() {
    console.log("View idea modal would be created here");
  },

  // Populate forms
  populateEditForm(idea) {
    if (!this.elements.editIdeaForm) return;

    Utils.setFormData(this.elements.editIdeaForm, {
      title: idea.title,
      category: idea.category,
      description: idea.description,
      fundingNeeded: idea.fundingNeeded,
      projectedReturns: idea.projectedReturns,
      timeline: idea.timeline,
    });

    this.elements.editIdeaForm.dataset.ideaId = idea.id;
  },

  populateViewModal(idea) {
    // Populate view modal with idea details
    console.log("Populating view modal for:", idea.title);
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
    const modals = [
      this.elements.createIdeaModal,
      this.elements.editIdeaModal,
      this.elements.viewIdeaModal,
    ];
    modals.forEach((modal) => {
      if (modal) {
        this.closeModal(modal);
      }
    });
  },

  clearModalForms(modal) {
    const forms = modal.querySelectorAll("form");
    forms.forEach((form) => {
      Utils.clearForm(form);
      this.clearFormErrors(form);
    });

    // Clear file uploads
    this.removeFile();
  },

  // Business idea filtering and searching
  filterIdeas(ideas, filters) {
    let filtered = [...ideas];

    if (filters.category) {
      filtered = filtered.filter((idea) => idea.category === filters.category);
    }

    if (filters.fundingRange) {
      const [min, max] = this.parseFundingRange(filters.fundingRange);
      filtered = filtered.filter((idea) => {
        const amount = idea.fundingNeeded;
        return amount >= min && (max === null || amount <= max);
      });
    }

    if (filters.status) {
      filtered = filtered.filter((idea) => idea.status === filters.status);
    }

    if (filters.search) {
      filtered = Utils.searchInArray(filtered, filters.search, [
        "title",
        "description",
        "category",
      ]);
    }

    return filtered;
  },

  // Parse funding range for filtering
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

  // Get business idea by ID
  async getBusinessIdeaById(ideaId) {
    try {
      // First check in local state
      let idea = this.state.userIdeas.find((i) => i.id === ideaId);

      if (!idea) {
        // If not found locally, fetch from Firebase
        const result = await FirebaseService.getBusinessIdeas({ limit: 1 });
        if (result.success) {
          idea = result.data.find((i) => i.id === ideaId);
        }
      }

      return idea;
    } catch (error) {
      console.error("Error getting business idea:", error);
      return null;
    }
  },

  // Update idea views count
  async updateIdeaViews(ideaId) {
    try {
      const idea = await this.getBusinessIdeaById(ideaId);
      if (idea) {
        const currentViews = idea.views || 0;
        await FirebaseService.updateBusinessIdea(ideaId, {
          views: currentViews + 1,
        });
      }
    } catch (error) {
      console.error("Error updating idea views:", error);
    }
  },

  // Get ideas by category
  getIdeasByCategory(category) {
    return this.state.userIdeas.filter((idea) => idea.category === category);
  },

  // Get ideas by status
  getIdeasByStatus(status) {
    return this.state.userIdeas.filter((idea) => idea.status === status);
  },

  // Calculate funding statistics
  getFundingStats() {
    const stats = {
      totalRequested: 0,
      averageFunding: 0,
      maxFunding: 0,
      minFunding: 0,
    };

    if (this.state.userIdeas.length === 0) {
      return stats;
    }

    const amounts = this.state.userIdeas.map((idea) => idea.fundingNeeded);

    stats.totalRequested = amounts.reduce((sum, amount) => sum + amount, 0);
    stats.averageFunding = stats.totalRequested / amounts.length;
    stats.maxFunding = Math.max(...amounts);
    stats.minFunding = Math.min(...amounts);

    return stats;
  },

  // Get trending categories
  getTrendingCategories() {
    const categoryCounts = {};

    this.state.userIdeas.forEach((idea) => {
      categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  },

  // Business plan analysis (placeholder for future ML integration)
  analyzeBusinessPlan(fileContent) {
    // This would integrate with ML services to analyze business plan
    // For now, return mock analysis
    return {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      strengths: [
        "Clear market opportunity",
        "Strong financial projections",
        "Experienced team",
      ],
      improvements: [
        "Expand on competitive analysis",
        "Detail marketing strategy",
        "Include risk assessment",
      ],
    };
  },

  // Generate business idea summary
  generateIdeaSummary(idea) {
    return {
      title: idea.title,
      category: idea.category,
      fundingNeeded: idea.fundingNeeded,
      timeline: idea.timeline,
      description: Utils.truncateText(idea.description, 200),
      createdAt: idea.createdAt,
      status: idea.status,
      views: idea.views || 0,
      interestedInvestors: idea.interestedInvestors?.length || 0,
    };
  },

  // Export user ideas to CSV
  exportIdeasToCSV() {
    if (this.state.userIdeas.length === 0) {
      Utils.showWarning("No business ideas to export");
      return;
    }

    const headers = [
      "Title",
      "Category",
      "Funding Needed",
      "Status",
      "Timeline",
      "Views",
      "Interested Investors",
      "Created Date",
    ];
    const csvContent = [headers];

    this.state.userIdeas.forEach((idea) => {
      csvContent.push([
        idea.title,
        idea.category,
        idea.fundingNeeded,
        idea.status,
        idea.timeline,
        idea.views || 0,
        idea.interestedInvestors?.length || 0,
        Utils.formatDate(idea.createdAt),
      ]);
    });

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `business-ideas-${Utils.formatDate(new Date())}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
    Utils.showSuccess("Business ideas exported successfully");
  },

  // Duplicate business idea
  async duplicateIdea(ideaId) {
    const originalIdea = this.state.userIdeas.find((i) => i.id === ideaId);
    if (!originalIdea) return;

    try {
      const duplicatedIdea = {
        ...originalIdea,
        title: `${originalIdea.title} (Copy)`,
        status: Status.BUSINESS_IDEA.DRAFT,
        businessPlan: "", // Don't copy the business plan file
        views: 0,
        interestedInvestors: [],
      };

      delete duplicatedIdea.id;
      delete duplicatedIdea.createdAt;
      delete duplicatedIdea.updatedAt;

      const result = await FirebaseService.createBusinessIdea(duplicatedIdea);

      if (result.success) {
        Utils.showSuccess("Business idea duplicated successfully");
        this.loadUserIdeas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error duplicating idea:", error);
      Utils.showError("Failed to duplicate business idea");
    }
  },

  // Archive business idea
  async archiveIdea(ideaId) {
    try {
      const result = await FirebaseService.updateBusinessIdea(ideaId, {
        status: "archived",
        archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      if (result.success) {
        Utils.showSuccess("Business idea archived successfully");
        this.loadUserIdeas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error archiving idea:", error);
      Utils.showError("Failed to archive business idea");
    }
  },

  // Restore archived idea
  async restoreIdea(ideaId) {
    try {
      const result = await FirebaseService.updateBusinessIdea(ideaId, {
        status: Status.BUSINESS_IDEA.DRAFT,
        archivedAt: firebase.firestore.FieldValue.delete(),
      });

      if (result.success) {
        Utils.showSuccess("Business idea restored successfully");
        this.loadUserIdeas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error restoring idea:", error);
      Utils.showError("Failed to restore business idea");
    }
  },

  // Search suggestions based on user input
  getSearchSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Add category suggestions
    this.state.categories.forEach((category) => {
      if (category.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: "category",
          text: Utils.capitalizeFirst(category),
          value: category,
        });
      }
    });

    // Add title suggestions from existing ideas
    this.state.userIdeas.forEach((idea) => {
      if (idea.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: "title",
          text: idea.title,
          value: idea.title,
        });
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  },

  // Auto-save draft functionality
  autoSaveDraft(formData) {
    const draftKey = `draft_business_idea_${App.state.currentUser.uid}`;
    Utils.saveToStorage(draftKey, {
      ...formData,
      lastSaved: new Date().toISOString(),
    });
  },

  // Load saved draft
  loadSavedDraft() {
    const draftKey = `draft_business_idea_${App.state.currentUser.uid}`;
    return Utils.getFromStorage(draftKey);
  },

  // Clear saved draft
  clearSavedDraft() {
    const draftKey = `draft_business_idea_${App.state.currentUser.uid}`;
    Utils.removeFromStorage(draftKey);
  },

  // Initialize auto-save for forms
  initializeAutoSave() {
    const forms = [this.elements.createIdeaForm, this.elements.editIdeaForm];

    forms.forEach((form) => {
      if (form) {
        const inputs = form.querySelectorAll("input, textarea, select");
        inputs.forEach((input) => {
          input.addEventListener(
            "input",
            Utils.debounce(() => {
              if (form === this.elements.createIdeaForm) {
                const formData = Utils.getFormData(form);
                this.autoSaveDraft(formData);
              }
            }, 2000)
          );
        });
      }
    });
  },

  // Handle real-time updates from Firebase
  setupRealtimeUpdates() {
    if (!App.state.currentUser) return;

    // Listen for changes to user's business ideas
    const unsubscribe = FirebaseService.onBusinessIdeasChanged((snapshot) => {
      const ideas = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.authorId === App.state.currentUser.uid) {
          ideas.push({ id: doc.id, ...data });
        }
      });

      this.state.userIdeas = ideas;
      this.renderUserIdeas();
      this.updateIdeaStats();
    });

    // Store unsubscribe function for cleanup
    this.unsubscribeRealtimeUpdates = unsubscribe;
  },

  // Cleanup method
  cleanup() {
    if (this.unsubscribeRealtimeUpdates) {
      this.unsubscribeRealtimeUpdates();
    }
  },
};

// Global functions for HTML onclick handlers
window.Business = Business;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if user is authenticated and is an entrepreneur
  if (
    App.state.isAuthenticated &&
    App.state.currentUser?.userType === UserTypes.ENTREPRENEUR
  ) {
    Business.init();
  }
});

// Initialize when user signs in
document.addEventListener("userSignedIn", () => {
  if (App.state.currentUser?.userType === UserTypes.ENTREPRENEUR) {
    Business.init();
  }
});

// Cleanup when user signs out
document.addEventListener("userSignedOut", () => {
  Business.cleanup();
});

// Export for use in other modules
window.Business = Business;

