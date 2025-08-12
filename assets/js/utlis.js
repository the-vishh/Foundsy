// Utility Functions for FundFound Platform
// Common helper functions used throughout the application

const Utils = {
  // DOM manipulation helpers
  getElementById(id) {
    return document.getElementById(id);
  },

  querySelector(selector) {
    return document.querySelector(selector);
  },

  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  },

  addClass(element, className) {
    if (element) element.classList.add(className);
  },

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  },

  toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  },

  hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
  },

  // Show/Hide elements
  show(element) {
    if (element) element.classList.remove("hidden");
  },

  hide(element) {
    if (element) element.classList.add("hidden");
  },

  toggle(element) {
    if (element) element.classList.toggle("hidden");
  },

  // Form helpers
  getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  },

  setFormData(formElement, data) {
    Object.keys(data).forEach((key) => {
      const input = formElement.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === "checkbox" || input.type === "radio") {
          input.checked = data[key];
        } else {
          input.value = data[key];
        }
      }
    });
  },

  clearForm(formElement) {
    if (formElement) formElement.reset();
  },

  // Validation helpers
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  validateRequired(value) {
    return value && value.trim().length > 0;
  },

  // String helpers
  truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  },

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  formatUserType(userType) {
    const types = {
      business: "Entrepreneur",
      investor: "Investor",
      banker: "Banker",
      advisor: "Business Advisor",
    };
    return types[userType] || userType;
  },

  // Number formatting
  formatCurrency(amount, currency = "₹") {
    if (amount >= 10000000) {
      return currency + (amount / 10000000).toFixed(1) + "Cr";
    } else if (amount >= 100000) {
      return currency + (amount / 100000).toFixed(1) + "L";
    } else if (amount >= 1000) {
      return currency + (amount / 1000).toFixed(1) + "K";
    }
    return currency + amount.toLocaleString();
  },

  formatNumber(num) {
    return num.toLocaleString();
  },

  // Date helpers
  formatDate(date) {
    if (!date) return "";

    if (date.toDate) {
      // Firestore timestamp
      date = date.toDate();
    } else if (typeof date === "string") {
      date = new Date(date);
    }

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  formatDateTime(date) {
    if (!date) return "";

    if (date.toDate) {
      date = date.toDate();
    } else if (typeof date === "string") {
      date = new Date(date);
    }

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  timeAgo(date) {
    if (!date) return "";

    if (date.toDate) {
      date = date.toDate();
    } else if (typeof date === "string") {
      date = new Date(date);
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  },

  // Local storage helpers
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving to storage:", error);
      return false;
    }
  },

  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting from storage:", error);
      return null;
    }
  },

  removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from storage:", error);
      return false;
    }
  },

  clearStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  },

  // URL helpers
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (let [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  },

  updateUrlParams(params) {
    const url = new URL(window.location);

    Object.keys(params).forEach((key) => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });

    window.history.replaceState({}, "", url);
  },

  // File helpers
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  },

  isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },

  // Array helpers
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  },

  sortBy(array, key, direction = "asc") {
    return array.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (direction === "desc") {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  },

  filterBy(array, filters) {
    return array.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        return item[key] === filters[key];
      });
    });
  },

  // Search helpers
  searchInText(text, query) {
    return text.toLowerCase().includes(query.toLowerCase());
  },

  searchInArray(array, query, searchFields) {
    const lowerQuery = query.toLowerCase();

    return array.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(lowerQuery);
      });
    });
  },

  // Error handling
  showError(message, duration = 5000) {
    this.showToast(message, "error", duration);
  },

  showSuccess(message, duration = 3000) {
    this.showToast(message, "success", duration);
  },

  showWarning(message, duration = 4000) {
    this.showToast(message, "warning", duration);
  },

  showInfo(message, duration = 3000) {
    this.showToast(message, "info", duration);
  },

  // Toast notification system
  showToast(message, type = "info", duration = 3000) {
    const toast = this.getElementById("toast");
    const toastMessage = toast.querySelector(".toast-message");
    const toastIcon = toast.querySelector(".toast-icon");

    if (!toast || !toastMessage) return;

    // Set message
    toastMessage.textContent = message;

    // Set icon based on type
    const icons = {
      success: "check-circle",
      error: "x-circle",
      warning: "alert-triangle",
      info: "info",
    };

    toastIcon.setAttribute("data-lucide", icons[type] || "info");

    // Remove existing type classes
    toast.classList.remove("success", "error", "warning", "info");
    toast.classList.add(type);

    // Show toast
    this.show(toast);

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Auto hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }
  },

  hideToast() {
    const toast = this.getElementById("toast");
    this.hide(toast);
  },

  // Loading state helpers
  showLoading(element, text = "Loading...") {
    if (!element) return;

    element.classList.add("btn-loading");
    const originalText = element.innerHTML;
    element.setAttribute("data-original-text", originalText);
    element.innerHTML = `<span class="btn-text hidden">${originalText}</span>`;
  },

  hideLoading(element) {
    if (!element) return;

    element.classList.remove("btn-loading");
    const originalText = element.getAttribute("data-original-text");
    if (originalText) {
      element.innerHTML = originalText;
      element.removeAttribute("data-original-text");
    }
  },

  // Debounce helper
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Template helpers
  createElementFromHTML(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  },

  // Animation helpers
  fadeIn(element, duration = 300) {
    element.style.opacity = "0";
    element.style.display = "block";

    let opacity = 0;
    const timer = setInterval(() => {
      opacity += 50 / duration;
      if (opacity >= 1) {
        clearInterval(timer);
        opacity = 1;
      }
      element.style.opacity = opacity;
    }, 50);
  },

  fadeOut(element, duration = 300) {
    let opacity = 1;
    const timer = setInterval(() => {
      opacity -= 50 / duration;
      if (opacity <= 0) {
        clearInterval(timer);
        opacity = 0;
        element.style.display = "none";
      }
      element.style.opacity = opacity;
    }, 50);
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess("Copied to clipboard!");
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      this.showError("Failed to copy to clipboard");
      return false;
    }
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Deep clone object
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Merge objects
  mergeObjects(target, ...sources) {
    return Object.assign(target, ...sources);
  },
};

// Export for use in other modules
window.Utils = Utils;
