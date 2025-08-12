// Authentication Module for FundFound Platform
// Handles login, registration, password reset, and modal management

const Auth = {
  // Authentication state
  state: {
    isModalOpen: false,
    currentForm: "login", // 'login' or 'register'
    isLoading: false,
    selectedUserType: "business",
  },

  // DOM elements cache
  elements: {
    modal: null,
    loginForm: null,
    registerForm: null,
    loginFormElement: null,
    registerFormElement: null,
    userTypeOptions: null,
  },

  // Initialize authentication module
  init() {
    console.log("Initializing Authentication Module...");

    this.cacheElements();
    this.bindEvents();
    this.initializeUserTypeSelector();

    console.log("Authentication Module initialized successfully");
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      modal: Utils.getElementById("authModal"),
      loginForm: Utils.getElementById("loginForm"),
      registerForm: Utils.getElementById("registerForm"),
      loginFormElement: Utils.getElementById("loginFormElement"),
      registerFormElement: Utils.getElementById("registerFormElement"),
      userTypeOptions: Utils.querySelectorAll('input[name="userType"]'),
    };
  },

  // Bind event listeners
  bindEvents() {
    // Login form submission
    if (this.elements.loginFormElement) {
      this.elements.loginFormElement.addEventListener(
        "submit",
        this.handleLogin.bind(this)
      );
    }

    // Register form submission
    if (this.elements.registerFormElement) {
      this.elements.registerFormElement.addEventListener(
        "submit",
        this.handleRegister.bind(this)
      );
    }

    // User type selection
    this.elements.userTypeOptions.forEach((option) => {
      option.addEventListener("change", this.handleUserTypeChange.bind(this));
    });

    // Password confirmation validation
    const confirmPasswordInput = Utils.getElementById("confirmPassword");
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener(
        "input",
        this.validatePasswordMatch.bind(this)
      );
    }

    // Real-time form validation
    this.bindFormValidation();

    // Social authentication
    this.bindSocialAuth();

    // Forgot password
    this.bindForgotPassword();

    // Modal close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.state.isModalOpen) {
        this.closeModal();
      }
    });
  },

  // Initialize user type selector
  initializeUserTypeSelector() {
    // Set default selection
    const defaultOption = Utils.querySelector(
      `input[name="userType"][value="${this.state.selectedUserType}"]`
    );
    if (defaultOption) {
      defaultOption.checked = true;
    }
  },

  // Handle user type change
  handleUserTypeChange(e) {
    this.state.selectedUserType = e.target.value;
    this.updateUserTypeUI();
  },

  // Update UI based on selected user type
  updateUserTypeUI() {
    // Add visual feedback for selected user type
    this.elements.userTypeOptions.forEach((option) => {
      const container = option.closest(".user-type-option");
      if (container) {
        if (option.checked) {
          Utils.addClass(container, "selected");
        } else {
          Utils.removeClass(container, "selected");
        }
      }
    });
  },

  // Bind form validation
  bindFormValidation() {
    // Email validation
    const emailInputs = Utils.querySelectorAll('input[type="email"]');
    emailInputs.forEach((input) => {
      input.addEventListener("blur", this.validateEmail.bind(this));
      input.addEventListener("input", this.clearFieldError.bind(this));
    });

    // Password validation
    const passwordInputs = Utils.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input) => {
      input.addEventListener("blur", this.validatePassword.bind(this));
      input.addEventListener("input", this.clearFieldError.bind(this));
    });

    // Phone validation
    const phoneInput = Utils.getElementById("phone");
    if (phoneInput) {
      phoneInput.addEventListener("blur", this.validatePhone.bind(this));
      phoneInput.addEventListener("input", this.clearFieldError.bind(this));
    }

    // Required field validation
    const requiredInputs = Utils.querySelectorAll("input[required]");
    requiredInputs.forEach((input) => {
      input.addEventListener("blur", this.validateRequired.bind(this));
      input.addEventListener("input", this.clearFieldError.bind(this));
    });
  },

  // Bind social authentication
  bindSocialAuth() {
    const googleAuthButtons = Utils.querySelectorAll(".google-auth");
    googleAuthButtons.forEach((button) => {
      button.addEventListener("click", this.handleGoogleAuth.bind(this));
    });
  },

  // Bind forgot password functionality
  bindForgotPassword() {
    const forgotPasswordLinks = Utils.querySelectorAll(".forgot-password");
    forgotPasswordLinks.forEach((link) => {
      link.addEventListener("click", this.handleForgotPassword.bind(this));
    });
  },

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!this.validateLoginForm(form)) {
      return;
    }

    const formData = Utils.getFormData(form);

    try {
      this.state.isLoading = true;
      Utils.showLoading(submitBtn, "Signing In...");

      const result = await FirebaseService.signIn(
        formData.email,
        formData.password
      );

      if (result.success) {
        Utils.showSuccess(
          "Welcome back! You have been signed in successfully."
        );
        this.closeModal();

        // Handle remember me
        if (formData.rememberMe) {
          Utils.saveToStorage("rememberUser", { email: formData.email });
        }
      } else {
        this.showAuthError(result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showAuthError("An unexpected error occurred. Please try again.");
    } finally {
      this.state.isLoading = false;
      Utils.hideLoading(submitBtn);
    }
  },

  // Handle registration form submission
  async handleRegister(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!this.validateRegisterForm(form)) {
      return;
    }

    const formData = Utils.getFormData(form);

    try {
      this.state.isLoading = true;
      Utils.showLoading(submitBtn, "Creating Account...");

      // Prepare user data
      const userData = {
        email: formData.email,
        userType: this.state.selectedUserType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        location: formData.location,
      };

      const result = await FirebaseService.signUp(
        formData.email,
        formData.password,
        userData
      );

      if (result.success) {
        Utils.showSuccess(
          result.message ||
            "Account created successfully! Please check your email for verification."
        );
        this.closeModal();

        // Show email verification reminder
        setTimeout(() => {
          this.showEmailVerificationReminder();
        }, 2000);
      } else {
        this.showAuthError(result.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      this.showAuthError("An unexpected error occurred. Please try again.");
    } finally {
      this.state.isLoading = false;
      Utils.hideLoading(submitBtn);
    }
  },

  // Handle Google authentication
  async handleGoogleAuth(e) {
    e.preventDefault();

    try {
      Utils.showInfo("Google authentication coming soon!");
      // TODO: Implement Google authentication
      // const result = await FirebaseService.signInWithGoogle();
    } catch (error) {
      console.error("Google auth error:", error);
      this.showAuthError("Google authentication failed. Please try again.");
    }
  },

  // Handle forgot password
  async handleForgotPassword(e) {
    e.preventDefault();

    const email = prompt("Please enter your email address:");
    if (!email) return;

    if (!Utils.isValidEmail(email)) {
      Utils.showError("Please enter a valid email address.");
      return;
    }

    try {
      const result = await FirebaseService.resetPassword(email);

      if (result.success) {
        Utils.showSuccess("Password reset email sent! Check your inbox.");
      } else {
        this.showAuthError(result.error);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      this.showAuthError(
        "Failed to send password reset email. Please try again."
      );
    }
  },

  // Validate login form
  validateLoginForm(form) {
    let isValid = true;
    const email = form.querySelector("#loginEmail").value;
    const password = form.querySelector("#loginPassword").value;

    // Clear previous errors
    this.clearFormErrors(form);

    // Validate email
    if (!email) {
      this.showFieldError("loginEmail", "Email is required");
      isValid = false;
    } else if (!Utils.isValidEmail(email)) {
      this.showFieldError("loginEmail", "Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!password) {
      this.showFieldError("loginPassword", "Password is required");
      isValid = false;
    }

    return isValid;
  },

  // Validate registration form
  validateRegisterForm(form) {
    let isValid = true;
    const formData = Utils.getFormData(form);

    // Clear previous errors
    this.clearFormErrors(form);

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "location",
      "password",
      "confirmPassword",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || !formData[field].trim()) {
        this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
        isValid = false;
      }
    });

    // Validate email format
    if (formData.email && !Utils.isValidEmail(formData.email)) {
      this.showFieldError(
        "registerEmail",
        "Please enter a valid email address"
      );
      isValid = false;
    }

    // Validate phone format
    if (formData.phone && !Utils.isValidPhone(formData.phone)) {
      this.showFieldError("phone", "Please enter a valid phone number");
      isValid = false;
    }

    // Validate password strength
    if (formData.password && !Utils.isValidPassword(formData.password)) {
      this.showFieldError(
        "registerPassword",
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
      isValid = false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      this.showFieldError("confirmPassword", "Passwords do not match");
      isValid = false;
    }

    // Validate terms agreement
    const agreeTerms = form.querySelector("#agreeTerms").checked;
    if (!agreeTerms) {
      this.showFieldError(
        "agreeTerms",
        "You must agree to the Terms of Service"
      );
      isValid = false;
    }

    return isValid;
  },

  // Individual field validations
  validateEmail(e) {
    const email = e.target.value;
    const fieldId = e.target.id;

    if (email && !Utils.isValidEmail(email)) {
      this.showFieldError(fieldId, "Please enter a valid email address");
    } else {
      this.clearFieldError(e);
    }
  },

  validatePassword(e) {
    const password = e.target.value;
    const fieldId = e.target.id;

    if (
      password &&
      fieldId === "registerPassword" &&
      !Utils.isValidPassword(password)
    ) {
      this.showFieldError(
        fieldId,
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
    } else {
      this.clearFieldError(e);
    }
  },

  validatePhone(e) {
    const phone = e.target.value;
    const fieldId = e.target.id;

    if (phone && !Utils.isValidPhone(phone)) {
      this.showFieldError(fieldId, "Please enter a valid phone number");
    } else {
      this.clearFieldError(e);
    }
  },

  validateRequired(e) {
    const value = e.target.value;
    const fieldId = e.target.id;

    if (!Utils.validateRequired(value)) {
      this.showFieldError(
        fieldId,
        `${this.getFieldLabel(fieldId)} is required`
      );
    } else {
      this.clearFieldError(e);
    }
  },

  validatePasswordMatch() {
    const password = Utils.getElementById("registerPassword").value;
    const confirmPassword = Utils.getElementById("confirmPassword").value;

    if (confirmPassword && password !== confirmPassword) {
      this.showFieldError("confirmPassword", "Passwords do not match");
    } else {
      this.clearFieldError({ target: Utils.getElementById("confirmPassword") });
    }
  },

  // Show field error
  showFieldError(fieldId, message) {
    const field = Utils.getElementById(fieldId);
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
  clearFieldError(e) {
    const field = e.target;
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

  // Get field label for error messages
  getFieldLabel(fieldId) {
    const labels = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      registerEmail: "Email",
      phone: "Phone Number",
      company: "Company",
      location: "Location",
      password: "Password",
      registerPassword: "Password",
      confirmPassword: "Confirm Password",
    };
    return labels[fieldId] || "Field";
  },

  // Show authentication error
  showAuthError(error) {
    let message = "An error occurred. Please try again.";

    // Map Firebase error codes to user-friendly messages
    if (typeof error === "string") {
      if (error.includes("user-not-found")) {
        message = "No account found with this email address.";
      } else if (error.includes("wrong-password")) {
        message = "Incorrect password. Please try again.";
      } else if (error.includes("email-already-in-use")) {
        message = "An account with this email already exists.";
      } else if (error.includes("weak-password")) {
        message = "Password is too weak. Please choose a stronger password.";
      } else if (error.includes("invalid-email")) {
        message = "Please enter a valid email address.";
      } else if (error.includes("too-many-requests")) {
        message = "Too many failed attempts. Please try again later.";
      } else {
        message = error;
      }
    }

    Utils.showError(message);
  },

  // Show email verification reminder
  showEmailVerificationReminder() {
    const message =
      "Please check your email and click the verification link to activate your account.";
    Utils.showInfo(message, 8000);
  },

  // Modal management methods
  openModal(formType = "login", userType = null) {
    if (!this.elements.modal) return;

    this.state.isModalOpen = true;
    this.state.currentForm = formType;

    if (userType) {
      this.state.selectedUserType = userType;
    }

    // Show modal
    Utils.removeClass(this.elements.modal, "hidden");
    Utils.addClass(document.body, "modal-open");

    // Switch to correct form
    this.switchForm(formType);

    // Set user type if provided
    if (userType) {
      const userTypeOption = Utils.querySelector(
        `input[name="userType"][value="${userType}"]`
      );
      if (userTypeOption) {
        userTypeOption.checked = true;
        this.updateUserTypeUI();
      }
    }

    // Focus on first input
    setTimeout(() => {
      this.focusFirstInput();
    }, 100);

    // Load remembered email
    this.loadRememberedEmail();
  },

  closeModal() {
    if (!this.elements.modal) return;

    this.state.isModalOpen = false;

    // Hide modal
    Utils.addClass(this.elements.modal, "hidden");
    Utils.removeClass(document.body, "modal-open");

    // Clear forms
    this.clearForms();
  },

  switchForm(formType) {
    this.state.currentForm = formType;

    if (formType === "login") {
      Utils.addClass(this.elements.loginForm, "active");
      Utils.removeClass(this.elements.registerForm, "active");
    } else if (formType === "register") {
      Utils.removeClass(this.elements.loginForm, "active");
      Utils.addClass(this.elements.registerForm, "active");
    }
  },

  focusFirstInput() {
    const activeForm =
      this.state.currentForm === "login"
        ? this.elements.loginFormElement
        : this.elements.registerFormElement;

    if (activeForm) {
      const firstInput = activeForm.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    }
  },

  loadRememberedEmail() {
    const remembered = Utils.getFromStorage("rememberUser");
    if (remembered && remembered.email) {
      const emailInput = Utils.getElementById("loginEmail");
      if (emailInput) {
        emailInput.value = remembered.email;
        const rememberCheckbox = Utils.getElementById("rememberMe");
        if (rememberCheckbox) {
          rememberCheckbox.checked = true;
        }
      }
    }
  },

  clearForms() {
    if (this.elements.loginFormElement) {
      Utils.clearForm(this.elements.loginFormElement);
      this.clearFormErrors(this.elements.loginFormElement);
    }

    if (this.elements.registerFormElement) {
      Utils.clearForm(this.elements.registerFormElement);
      this.clearFormErrors(this.elements.registerFormElement);
    }
  },
};

// Global functions for HTML onclick handlers
window.showAuthModal = (formType = "login", userType = null) => {
  Auth.openModal(formType, userType);
};

window.closeAuthModal = () => {
  Auth.closeModal();
};

window.switchAuthForm = (formType) => {
  Auth.switchForm(formType);
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});

// Export for use in other modules
window.Auth = Auth;
