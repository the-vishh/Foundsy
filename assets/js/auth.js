// Authentication Module for Foundsy Platform (Firebase v8 Compatible)
// Replace your assets/js/auth.js with this

// Main Authentication Manager
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.state = {
      isModalOpen: false,
      currentForm: "login",
      isLoading: false,
      selectedUserType: "entrepreneur",
    };
    this.elements = {};

    // Wait for Firebase to be loaded
    if (typeof firebase !== "undefined") {
      this.init();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.init(), 100);
      });
    }
  }

  // Initialize the authentication system
  init() {
    console.log("Initializing Authentication Module...");

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupAuth();
      });
    } else {
      this.setupAuth();
    }
  }

  setupAuth() {
    // Cache DOM elements
    this.cacheElements();

    // Set up event listeners
    this.setupEventListeners();

    // Listen for auth state changes
    if (window.auth) {
      window.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.updateUI(user);

        if (user) {
          console.log("User authenticated:", user.email);
          // Store user data locally for quick access
          this.storeUserDataLocally(user);
        } else {
          console.log("User not authenticated");
          // Clear local user data
          this.clearLocalUserData();
        }
      });
    }

    console.log("Authentication Module initialized successfully");
  }

  // Store user data locally for quick access
  async storeUserDataLocally(user) {
    try {
      const userProfile = await FirebaseService.getUserProfile(user.uid);
      if (userProfile.success) {
        const userData = userProfile.data;
        
        // Ensure userType is set
        if (!userData.userType) {
          userData.userType = "entrepreneur"; // Default type
        }
        
        localStorage.setItem(
          `user_${user.uid}`,
          JSON.stringify(userData)
        );
        
        // Also store in sessionStorage for quick access
        sessionStorage.setItem("currentUser", JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          userType: userData.userType,
          profile: userData.profile
        }));
      }
    } catch (error) {
      console.warn("Could not fetch user profile:", error);
      // Store basic user info if profile fetch fails
      const basicUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userType: "entrepreneur", // Default type
        profile: {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        }
      };
      localStorage.setItem(`user_${user.uid}`, JSON.stringify(basicUserData));
      sessionStorage.setItem("currentUser", JSON.stringify(basicUserData));
    }
  }

  // Clear local user data
  clearLocalUserData() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("user_")) {
        localStorage.removeItem(key);
      }
    });
  }

  // Cache frequently used DOM elements
  cacheElements() {
    this.elements = {
      modal: document.getElementById("authModal"),
      loginForm:
        document.getElementById("loginFormContainer") ||
        document.getElementById("loginForm"),
      registerForm:
        document.getElementById("signupFormContainer") ||
        document.getElementById("registerForm"),
      loginFormElement:
        document.querySelector("#loginForm form") ||
        document.getElementById("loginFormElement"),
      registerFormElement:
        document.querySelector("#registerForm form") ||
        document.getElementById("registerFormElement"),
      userMenu: document.querySelector(".user-menu"),
      authButtons: document.querySelector(".auth-buttons"),
      userAvatar: document.getElementById("userAvatar"),
      dropdownMenu: document.querySelector(".dropdown-menu"),
    };
  }

  // Set up all event listeners
  setupEventListeners() {
    this.bindModalEvents();
    this.bindFormEvents();
    this.bindAuthEvents();
    this.bindValidationEvents();
    this.bindGlobalEvents();
  }

  // Modal-related events
  bindModalEvents() {
    // Open modal buttons
    document.querySelectorAll('[data-modal="auth"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const formType = e.target.getAttribute("data-form") || "login";
        const userType = e.target.getAttribute("data-user-type");
        this.openModal(formType, userType);
      });
    });

    // Close modal buttons
    document.querySelectorAll('[data-close="modal"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeModal();
      });
    });

    // Form switching buttons
    document.querySelectorAll("[data-form-switch]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetForm = e.target.getAttribute("data-form-switch");
        this.switchForm(targetForm);
      });
    });
  }

  // Form submission events
  bindFormEvents() {
    // Login form
    if (this.elements.loginFormElement) {
      this.elements.loginFormElement.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin(e);
      });
    }

    // Register form
    if (this.elements.registerFormElement) {
      this.elements.registerFormElement.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister(e);
      });
    }

    // User type selection
    document.querySelectorAll('input[name="userType"]').forEach((option) => {
      option.addEventListener("change", (e) => {
        this.state.selectedUserType = e.target.value;
        this.updateUserTypeUI();
      });
    });
  }

  // Authentication-related events
  bindAuthEvents() {
    // Social auth buttons
    document.querySelectorAll(".google-auth").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleGoogleAuth();
      });
    });

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // User avatar click
    if (this.elements.userAvatar) {
      this.elements.userAvatar.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleUserMenu();
      });
    }

    // Forgot password links
    document.querySelectorAll(".forgot-password").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    });
  }

  // Form validation events
  bindValidationEvents() {
    // Email validation
    document.querySelectorAll('input[type="email"]').forEach((input) => {
      input.addEventListener("blur", (e) => this.validateEmail(e));
      input.addEventListener("input", (e) => this.clearFieldError(e));
    });

    // Password validation
    document.querySelectorAll('input[type="password"]').forEach((input) => {
      input.addEventListener("blur", (e) => this.validatePassword(e));
      input.addEventListener("input", (e) => this.clearFieldError(e));
    });

    // Password confirmation
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", () =>
        this.validatePasswordMatch()
      );
    }

    // Required fields
    document.querySelectorAll("input[required]").forEach((input) => {
      input.addEventListener("blur", (e) => this.validateRequired(e));
      input.addEventListener("input", (e) => this.clearFieldError(e));
    });
  }

  // Global events (keyboard, clicks outside)
  bindGlobalEvents() {
    // Close modal on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.state.isModalOpen) this.closeModal();
        if (
          this.elements.dropdownMenu &&
          !this.elements.dropdownMenu.classList.contains("hidden")
        ) {
          this.elements.dropdownMenu.classList.add("hidden");
        }
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.elements.userMenu &&
        !this.elements.userMenu.contains(e.target)
      ) {
        this.elements.dropdownMenu?.classList.add("hidden");
      }
    });

    // Close modal when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.elements.modal &&
        !this.elements.modal.classList.contains("hidden") &&
        e.target === this.elements.modal
      ) {
        this.closeModal();
      }
    });
  }

  // Authentication Methods
  async handleLogin(event) {
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");
    const rememberMe = formData.get("rememberMe");

    if (!this.validateLoginForm(form)) return;

    const loginBtn = form.querySelector('button[type="submit"]');

    try {
      this.showLoading(loginBtn, "Signing In...");

      const result = await FirebaseService.signIn(email, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("rememberUser", JSON.stringify({ email }));
        }

        this.showSuccess("Welcome back! You have been signed in successfully.");
        this.closeModal();

        // Redirect after a short delay to show success message
        setTimeout(() => {
          this.redirectAfterLogin(result.user);
        }, 1500);
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showError("An unexpected error occurred. Please try again.");
    } finally {
      this.hideLoading(loginBtn);
    }
  }

  async handleRegister(event) {
    const form = event.target;
    const formData = new FormData(form);

    if (!this.validateRegisterForm(form)) return;

    const registerBtn = form.querySelector('button[type="submit"]');

    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      userType: this.state.selectedUserType,
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      location: formData.get("location") || "",
    };

    try {
      this.showLoading(registerBtn, "Creating Account...");

      const result = await FirebaseService.signUp(
        userData.email,
        userData.password,
        userData
      );

      if (result.success) {
        this.showSuccess(
          "Account created successfully! Please check your email for verification."
        );
        this.closeModal();

        // Redirect after a short delay to show success message
        setTimeout(() => {
          this.redirectAfterLogin(result.user);
        }, 2000);
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      this.showError("An unexpected error occurred. Please try again.");
    } finally {
      this.hideLoading(registerBtn);
    }
  }

  async handleGoogleAuth() {
    try {
      this.showInfo("Connecting to Google...");

      const result = await FirebaseService.signInWithGoogle();

      if (result.success) {
        this.showSuccess("Google sign-in successful!");
        this.closeModal();

        // Redirect after a short delay
        setTimeout(() => {
          this.redirectAfterLogin(result.user);
        }, 1500);
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      console.error("Google auth error:", error);
      this.showError("Google authentication failed. Please try again.");
    }
  }

  async handleLogout() {
    try {
      const result = await FirebaseService.signOut();

      if (result.success) {
        this.showSuccess("Logged out successfully!");

        // Redirect to home page after a short delay
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          } else {
            window.location.reload();
          }
        }, 1000);
      } else {
        this.showError("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      this.showError("Failed to log out. Please try again.");
    }
  }

  async handleForgotPassword() {
    const email = prompt("Please enter your email address:");
    if (!email) return;

    if (!this.isValidEmail(email)) {
      this.showError("Please enter a valid email address.");
      return;
    }

    try {
      const result = await FirebaseService.resetPassword(email);

      if (result.success) {
        this.showSuccess("Password reset email sent! Check your inbox.");
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      this.showError("Failed to send password reset email. Please try again.");
    }
  }

  // Validation Methods
  validateLoginForm(form) {
    let isValid = true;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    this.clearFormErrors(form);

    if (!email) {
      this.showFieldError(
        form.querySelector('input[name="email"]'),
        "Email is required"
      );
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showFieldError(
        form.querySelector('input[name="email"]'),
        "Please enter a valid email address"
      );
      isValid = false;
    }

    if (!password) {
      this.showFieldError(
        form.querySelector('input[name="password"]'),
        "Password is required"
      );
      isValid = false;
    }

    return isValid;
  }

  validateRegisterForm(form) {
    let isValid = true;
    const formData = new FormData(form);

    this.clearFormErrors(form);

    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
    ];

    requiredFields.forEach((fieldName) => {
      const value = formData.get(fieldName);
      if (!value || !value.trim()) {
        const field = form.querySelector(`input[name="${fieldName}"]`);
        this.showFieldError(
          field,
          `${this.getFieldLabel(fieldName)} is required`
        );
        isValid = false;
      }
    });

    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Email validation
    if (email && !this.isValidEmail(email)) {
      const field = form.querySelector('input[name="email"]');
      this.showFieldError(field, "Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (password && password.length < 6) {
      const field = form.querySelector('input[name="password"]');
      this.showFieldError(field, "Password must be at least 6 characters");
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      const field = form.querySelector('input[name="confirmPassword"]');
      this.showFieldError(field, "Passwords do not match");
      isValid = false;
    }

    // Terms agreement
    const agreeTerms = formData.get("agreeTerms");
    if (!agreeTerms) {
      const field = form.querySelector('input[name="agreeTerms"]');
      this.showFieldError(field, "You must agree to the Terms of Service");
      isValid = false;
    }

    return isValid;
  }

  validateEmail(e, showError = true) {
    const email = e.target.value;
    const isValid = this.isValidEmail(email);

    if (!isValid && email && showError) {
      this.showFieldError(e.target, "Please enter a valid email address");
    } else if (isValid) {
      this.clearFieldError(e);
    }

    return isValid;
  }

  validatePassword(e) {
    const password = e.target.value;

    if (password && password.length < 6) {
      this.showFieldError(e.target, "Password must be at least 6 characters");
    } else {
      this.clearFieldError(e);
    }
  }

  validateRequired(e) {
    const value = e.target.value;

    if (!value || !value.trim()) {
      const fieldName = e.target.name || e.target.id;
      this.showFieldError(
        e.target,
        `${this.getFieldLabel(fieldName)} is required`
      );
    } else {
      this.clearFieldError(e);
    }
  }

  validatePasswordMatch() {
    const password = document.querySelector('input[name="password"]')?.value;
    const confirmPassword = document.querySelector(
      'input[name="confirmPassword"]'
    )?.value;
    const confirmField = document.querySelector(
      'input[name="confirmPassword"]'
    );

    if (confirmPassword && password !== confirmPassword) {
      this.showFieldError(confirmField, "Passwords do not match");
    } else if (confirmField) {
      this.clearFieldError({ target: confirmField });
    }
  }

  // UI Management Methods
  openModal(formType = "login", userType = null) {
    if (!this.elements.modal) return;

    this.state.isModalOpen = true;
    this.state.currentForm = formType;

    if (userType) {
      this.state.selectedUserType = userType;
    }

    this.elements.modal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    this.switchForm(formType);

    if (userType) {
      const userTypeOption = document.querySelector(
        `input[name="userType"][value="${userType}"]`
      );
      if (userTypeOption) {
        userTypeOption.checked = true;
        this.updateUserTypeUI();
      }
    }

    // Load remembered email for login
    if (formType === "login") {
      this.loadRememberedEmail();
    }

    // Focus first input
    setTimeout(() => this.focusFirstInput(), 100);
  }

  closeModal() {
    if (!this.elements.modal) return;

    this.state.isModalOpen = false;
    this.elements.modal.classList.add("hidden");
    document.body.classList.remove("modal-open");

    this.clearForms();
  }

  switchForm(formType) {
    this.state.currentForm = formType;

    if (formType === "login") {
      this.elements.loginForm?.classList.add("active");
      this.elements.registerForm?.classList.remove("active");
    } else {
      this.elements.registerForm?.classList.add("active");
      this.elements.loginForm?.classList.remove("active");
    }
  }

  updateUI(user) {
    if (user) {
      // User is logged in
      if (this.elements.authButtons)
        this.elements.authButtons.style.display = "none";
      if (this.elements.userMenu) {
        this.elements.userMenu.style.display = "block";
        this.updateUserMenu(user);
      }
    } else {
      // User is logged out
      if (this.elements.authButtons)
        this.elements.authButtons.style.display = "flex";
      if (this.elements.userMenu) this.elements.userMenu.style.display = "none";
    }
  }

  updateUserMenu(user) {
    const userAvatar = this.elements.userAvatar;
    const userName = document.querySelector(".user-name");
    const userType = document.querySelector(".user-type");

    if (userAvatar) {
      if (user.photoURL) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="User Avatar" class="avatar-img">`;
      } else {
        const initials = this.getInitials(user.displayName || user.email);
        userAvatar.innerHTML = `<span class="avatar-text">${initials}</span>`;
      }
    }

    if (userName) {
      userName.textContent = user.displayName || user.email;
    }

    if (userType) {
      const userData = localStorage.getItem(`user_${user.uid}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        userType.textContent = parsedData.userType || "user";
      }
    }
  }

  updateUserTypeUI() {
    document.querySelectorAll('input[name="userType"]').forEach((option) => {
      const container = option.closest(".user-type-option");
      if (container) {
        if (option.checked) {
          container.classList.add("selected");
        } else {
          container.classList.remove("selected");
        }
      }
    });
  }

  toggleUserMenu() {
    if (this.elements.dropdownMenu) {
      this.elements.dropdownMenu.classList.toggle("hidden");
    }
  }

  // Utility Methods
  redirectAfterLogin(user) {
    const userData = localStorage.getItem(`user_${user.uid}`);

    if (userData) {
      const parsedData = JSON.parse(userData);
      const userType = parsedData.userType;

      const redirectMap = {
        entrepreneur: "/pages/dashboard.html",
        investor: "/pages/dashboard.html",
        banker: "/pages/dashboard.html",
        advisor: "/pages/dashboard.html",
      };

      window.location.href = redirectMap[userType] || "/pages/dashboard.html";
    } else {
      window.location.href = "/pages/dashboard.html";
    }
  }

  focusFirstInput() {
    const activeForm =
      this.state.currentForm === "login"
        ? this.elements.loginFormElement
        : this.elements.registerFormElement;

    if (activeForm) {
      const firstInput = activeForm.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  loadRememberedEmail() {
    const remembered = localStorage.getItem("rememberUser");
    if (remembered) {
      const { email } = JSON.parse(remembered);
      const emailInput = document.querySelector('input[name="email"]');
      const rememberCheckbox = document.querySelector(
        'input[name="rememberMe"]'
      );

      if (emailInput) emailInput.value = email;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }

  clearForms() {
    [this.elements.loginFormElement, this.elements.registerFormElement].forEach(
      (form) => {
        if (form) {
          form.reset();
          this.clearFormErrors(form);
        }
      }
    );
  }

  // Error Handling and UI Feedback
  showFieldError(field, message) {
    if (!field) return;

    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector(".field-error");
    if (existingError) existingError.remove();

    // Add error class and message
    formGroup.classList.add("has-error");
    field.classList.add("error");

    const errorElement = document.createElement("span");
    errorElement.className = "field-error";
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  }

  clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    formGroup.classList.remove("has-error");
    field.classList.remove("error");

    const errorElement = formGroup.querySelector(".field-error");
    if (errorElement) errorElement.remove();
  }

  clearFormErrors(form) {
    const errorElements = form.querySelectorAll(".field-error");
    errorElements.forEach((error) => error.remove());

    const errorFields = form.querySelectorAll(".error");
    errorFields.forEach((field) => field.classList.remove("error"));

    const errorGroups = form.querySelectorAll(".has-error");
    errorGroups.forEach((group) => group.classList.remove("has-error"));
  }

  showSuccess(message) {
    this.showToast(message, "success");
  }
  showError(message) {
    this.showToast(message, "error");
  }
  showInfo(message) {
    this.showToast(message, "info");
  }

  showToast(message, type = "info") {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll(".toast");
    existingToasts.forEach((toast) => toast.remove());

    // Create toast notification
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;

    // Set background color based on type
    const colors = {
      success: "#10B981",
      error: "#EF4444",
      info: "#3B82F6",
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
          ${
            type === "error"
              ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
              : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />'
          }
        </svg>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: currentColor; cursor: pointer; padding: 4px; font-size: 18px;">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Auto remove
    setTimeout(
      () => {
        if (toast.parentNode) toast.remove();
      },
      type === "success" ? 3000 : 5000
    );
  }

  showLoading(button, text) {
    if (!button) return;
    button.disabled = true;
    button.classList.add("btn-loading");
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg style="width: 16px; height: 16px; margin-right: 8px; animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
        <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path style="opacity: 0.75;" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      ${text}
    `;
    button.dataset.originalText = originalText;
  }

  hideLoading(button) {
    if (!button) return;
    button.disabled = false;
    button.classList.remove("btn-loading");

    // Reset button text
    const originalText = button.dataset.originalText;
    if (originalText) {
      button.innerHTML = originalText;
    } else {
      // Fallback to default text
      const isLogin = button.closest("#loginForm");
      button.innerHTML = isLogin ? "Sign In" : "Create Account";
    }
  }

  // Helper Methods
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getInitials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  getFieldLabel(fieldName) {
    const labels = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone",
      company: "Company",
      location: "Location",
    };
    return labels[fieldName] || fieldName;
  }

  // Public API
  getCurrentUser() {
    return this.currentUser;
  }
  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Add CSS animation for toast
if (!document.getElementById("toast-styles")) {
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize Authentication Manager when DOM is ready
let authManager;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    authManager = new AuthManager();
  });
} else {
  authManager = new AuthManager();
}

// Global functions for HTML handlers
window.showAuthModal = (formType = "login", userType = null) => {
  if (authManager) {
    authManager.openModal(formType, userType);
  }
};

window.closeAuthModal = () => {
  if (authManager) {
    authManager.closeModal();
  }
};

window.switchAuthForm = (formType) => {
  if (authManager) {
    authManager.switchForm(formType);
  }
};

// Export for use in other modules
window.authManager = authManager;
