// Enhanced Authentication Handling

// Override the existing Auth.handleLogin and Auth.handleRegister functions
if (typeof Auth !== "undefined") {
  // Enhanced login handler
  Auth.handleLogin = async function (e) {
    e.preventDefault();
    console.log("Enhanced login handler called");

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Login attempt:", {
      email,
      password: password ? "***" : "empty",
    });

    // Basic validation
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader"></i> Signing In...';
    submitBtn.disabled = true;

    try {
      // Use real Firebase authentication
      if (typeof FirebaseService !== "undefined") {
        const result = await FirebaseService.signIn(email, password);
        
        if (result.success) {
          console.log("Firebase login successful:", result.user);
          
          // Show success message
          this.showSuccessMessage(
            "Welcome back! You have been signed in successfully."
          );

          // Close modal
          this.closeModal();

          // Update UI for logged in user
          this.updateUIForLoggedInUser(result.user);
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error("Firebase service not available");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Show user-friendly error message
      let errorMessage = "Login failed. Please try again.";
      if (error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("USER_NOT_FOUND")) {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (error.message.includes("TOO_MANY_ATTEMPTS")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      // Restore button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

  // Enhanced register handler
  Auth.handleRegister = async function (e) {
    e.preventDefault();
    console.log("Enhanced register handler called");

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      location: formData.get("location"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      userType: document.querySelector('input[name="userType"]:checked').value,
      agreeTerms: formData.get("agreeTerms"),
    };

    console.log("Registration attempt:", {
      ...userData,
      password: "***",
      confirmPassword: "***",
    });

    // Basic validation
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!userData.agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader"></i> Creating Account...';
    submitBtn.disabled = true;

    try {
      // Use real Firebase authentication
      if (typeof FirebaseService !== "undefined") {
        const result = await FirebaseService.signUp(userData.email, userData.password, userData);
        
        if (result.success) {
          console.log("Firebase registration successful:", result.user);
          
          // Show success message
          this.showSuccessMessage(
            "Account created successfully! Please check your email for verification."
          );

          // Close modal
          this.closeModal();

          // Update UI for logged in user
          this.updateUIForLoggedInUser(result.user);
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error("Firebase service not available");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Show user-friendly error message
      let errorMessage = "Registration failed. Please try again.";
      if (error.message.includes("EMAIL_EXISTS")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("WEAK_PASSWORD")) {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (error.message.includes("INVALID_EMAIL")) {
        errorMessage = "Please enter a valid email address.";
      }
      
      alert(errorMessage);
    } finally {
      // Restore button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

  // Add success message function
  Auth.showSuccessMessage = function (message) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = "success-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <i data-lucide="check-circle"></i>
        <span>${message}</span>
      </div>
    `;

    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Create icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  // Add UI update function for logged in user
  Auth.updateUIForLoggedInUser = function (user) {
    console.log("Updating UI for logged in user:", user);

    // Hide auth buttons
    const authButtons = document.getElementById("authButtons");
    const userMenu = document.getElementById("userMenu");

    if (authButtons) authButtons.style.display = "none";
    if (userMenu) {
      userMenu.style.display = "block";
      userMenu.classList.remove("hidden");
    }

    // Update user display
    const userName = document.getElementById("userName");
    const userType = document.getElementById("userType");
    const avatarText = document.getElementById("avatarText");

    if (userName) userName.textContent = user.displayName || user.email;
    if (userType) userType.textContent = this.formatUserType(user.userType);
    if (avatarText) {
      const initials = user.displayName
        ? user.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : user.email[0].toUpperCase();
      avatarText.textContent = initials;
    }

    // Show dashboard link in navigation
    this.addDashboardToNav();
  };

  // Format user type for display
  Auth.formatUserType = function (userType) {
    const types = {
      business: "Entrepreneur",
      investor: "Investor",
      banker: "Banking Partner",
      advisor: "Business Advisor",
    };
    return types[userType] || userType;
  };

  // Add dashboard to navigation
  Auth.addDashboardToNav = function () {
    const navMenu = document.getElementById("navMenu");
    if (!navMenu) return;

    // Check if dashboard link already exists
    const existingDashboard = navMenu.querySelector(
      '[data-section="dashboard"]'
    );
    if (existingDashboard) return;

    // Create dashboard nav item
    const dashboardItem = document.createElement("li");
    dashboardItem.className = "nav-item";
    dashboardItem.innerHTML = `
      <a href="#dashboard" class="nav-link" data-section="dashboard">Dashboard</a>
    `;

    // Add click handler
    const dashboardLink = dashboardItem.querySelector(".nav-link");
    dashboardLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof navigateToSection !== "undefined") {
        navigateToSection("dashboard");
      }
    });

    // Insert after "Browse Ideas"
    const browseItem = navMenu.querySelector(
      '[data-section="browse"]'
    ).parentElement;
    browseItem.insertAdjacentElement("afterend", dashboardItem);
  };

  // Check for existing user session on page load
  Auth.checkExistingSession = function () {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log("Found existing session:", user);
        this.updateUIForLoggedInUser(user);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        sessionStorage.removeItem("currentUser");
      }
    }
  };

  // Add logout functionality
  window.logout = function () {
    console.log("Logout called");

    // Clear session
    sessionStorage.removeItem("currentUser");

    // Reset UI
    const authButtons = document.getElementById("authButtons");
    const userMenu = document.getElementById("userMenu");

    if (authButtons) authButtons.style.display = "flex";
    if (userMenu) {
      userMenu.style.display = "none";
      userMenu.classList.add("hidden");
    }

    // Remove dashboard from nav
    const dashboardItem = document.querySelector('[data-section="dashboard"]');
    if (dashboardItem) {
      dashboardItem.parentElement.remove();
    }

    // Navigate to home
    if (typeof navigateToSection !== "undefined") {
      navigateToSection("home");
    }

    // Show success message
    Auth.showSuccessMessage("You have been signed out successfully.");
  };

  // Initialize enhanced auth
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Enhanced auth initialization...");

    // Check for existing session
    Auth.checkExistingSession();

    // Re-bind form handlers
    const loginForm = document.getElementById("loginFormElement");
    const registerForm = document.getElementById("registerFormElement");

    if (loginForm) {
      loginForm.removeEventListener("submit", Auth.handleLogin);
      loginForm.addEventListener("submit", Auth.handleLogin.bind(Auth));
    }

    if (registerForm) {
      registerForm.removeEventListener("submit", Auth.handleRegister);
      registerForm.addEventListener("submit", Auth.handleRegister.bind(Auth));
    }

    console.log("Enhanced auth ready!");
  });
} else {
  console.warn("Auth object not found - enhanced auth features not loaded");
}

// Add CSS animations for toast
const style = document.createElement("style");
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

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Add event listeners for the forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Login form
  const loginForm = document.getElementById('loginFormElement');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      if (typeof Auth !== "undefined" && Auth.handleLogin) {
        Auth.handleLogin(e);
      } else {
        console.error('Auth.handleLogin not available');
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('registerFormElement');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      if (typeof Auth !== "undefined" && Auth.handleRegister) {
        Auth.handleRegister(e);
      } else {
        console.error('Auth.handleRegister not available');
      }
    });
  }
});
