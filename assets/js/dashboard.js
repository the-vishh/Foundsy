// Dashboard and Navigation Enhancement
// This fixes the dashboard, profile, and logout issues

// Fix 1: Create dashboard content dynamically
function createDashboardContent() {
  const dashboardSection = document.getElementById("dashboard");
  if (!dashboardSection) {
    console.error("Dashboard section not found");
    return;
  }

  // Get current user from session
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("No user found for dashboard");
    return;
  }

  // Create dashboard HTML based on user type
  const dashboardHTML = createDashboardHTML(currentUser);
  dashboardSection.innerHTML = dashboardHTML;

  console.log("Dashboard content created for user type:", currentUser.userType);
}

// Get current user from session
function getCurrentUser() {
  try {
    const userJson = sessionStorage.getItem("currentUser");
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Create dashboard HTML based on user type
function createDashboardHTML(user) {
  const userName = user.displayName || user.email;
  const userType = formatUserType(user.userType);

  const commonHeader = `
    <div class="container">
      <div class="dashboard-header">
        <h1>Welcome back, ${userName}!</h1>
        <p>Manage your ${userType.toLowerCase()} activities from your dashboard</p>
      </div>
  `;

  const commonFooter = `</div>`;

  // Create content based on user type
  switch (user.userType) {
    case "business":
      return commonHeader + createEntrepreneurDashboard() + commonFooter;
    case "investor":
      return commonHeader + createInvestorDashboard() + commonFooter;
    case "banker":
      return commonHeader + createBankerDashboard() + commonFooter;
    case "advisor":
      return commonHeader + createAdvisorDashboard() + commonFooter;
    default:
      return commonHeader + createDefaultDashboard() + commonFooter;
  }
}

// Entrepreneur Dashboard
function createEntrepreneurDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="lightbulb"></i> My Business Ideas</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">3</div>
          <div class="stat-label">Published Ideas</div>
          <button class="btn btn-primary btn-small" onclick="showAddBusinessIdeaModal()">
            <i data-lucide="plus"></i> Post New Idea
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="users"></i> Interested Investors</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">7</div>
          <div class="stat-label">Active Inquiries</div>
          <button class="btn btn-outline btn-small" onclick="viewInvestorInquiries()">
            <i data-lucide="eye"></i> View All
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="trending-up"></i> Funding Status</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">₹15L</div>
          <div class="stat-label">Total Funding Raised</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 60%"></div>
          </div>
          <small>60% of target reached</small>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="message-square"></i> Recent Messages</h3>
        </div>
        <div class="card-content">
          <div class="message-preview">
            <p><strong>John Investor:</strong> Interested in your tech startup idea...</p>
            <small>2 hours ago</small>
          </div>
          <button class="btn btn-outline btn-small" onclick="viewAllMessages()">
            <i data-lucide="message-circle"></i> View Messages
          </button>
        </div>
      </div>
    </div>

    <div class="recent-activity">
      <h3>Recent Activity</h3>
      <div class="activity-list">
        <div class="activity-item">
          <i data-lucide="eye"></i>
          <span>Your "AI E-commerce Platform" was viewed by 3 investors today</span>
          <small>1 hour ago</small>
        </div>
        <div class="activity-item">
          <i data-lucide="message-square"></i>
          <span>New message from Sarah Investor</span>
          <small>3 hours ago</small>
        </div>
        <div class="activity-item">
          <i data-lucide="heart"></i>
          <span>Your "Green Energy Startup" received 2 new interests</span>
          <small>1 day ago</small>
        </div>
      </div>
    </div>
  `;
}

// Investor Dashboard
function createInvestorDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="briefcase"></i> My Portfolio</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">5</div>
          <div class="stat-label">Active Investments</div>
          <button class="btn btn-primary btn-small" onclick="viewPortfolio()">
            <i data-lucide="pie-chart"></i> View Portfolio
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="search"></i> New Opportunities</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">12</div>
          <div class="stat-label">Matching Your Criteria</div>
          <button class="btn btn-outline btn-small" onclick="navigateToSection('browse')">
            <i data-lucide="external-link"></i> Browse Ideas
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="trending-up"></i> Total Investment</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">₹50L</div>
          <div class="stat-label">Deployed Capital</div>
          <div class="roi-indicator">
            <span class="roi-positive">+22% ROI</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="clock"></i> Pending Reviews</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">3</div>
          <div class="stat-label">Business Plans to Review</div>
          <button class="btn btn-outline btn-small" onclick="viewPendingReviews()">
            <i data-lucide="file-text"></i> Review Now
          </button>
        </div>
      </div>
    </div>
  `;
}

// Banker Dashboard
function createBankerDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="file-text"></i> Loan Applications</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">8</div>
          <div class="stat-label">Pending Review</div>
          <button class="btn btn-primary btn-small" onclick="viewLoanApplications()">
            <i data-lucide="eye"></i> Review Applications
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="check-circle"></i> Approved Loans</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">₹2Cr</div>
          <div class="stat-label">This Month</div>
          <div class="approval-rate">95% approval rate</div>
        </div>
      </div>
    </div>
  `;
}

// Advisor Dashboard
function createAdvisorDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="users"></i> My Clients</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">12</div>
          <div class="stat-label">Active Clients</div>
          <button class="btn btn-primary btn-small" onclick="viewClients()">
            <i data-lucide="users"></i> Manage Clients
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="calendar"></i> Upcoming Sessions</h3>
        </div>
        <div class="card-content">
          <div class="stat-number">5</div>
          <div class="stat-label">This Week</div>
          <button class="btn btn-outline btn-small" onclick="viewSchedule()">
            <i data-lucide="calendar"></i> View Schedule
          </button>
        </div>
      </div>
    </div>
  `;
}

// Default Dashboard
function createDefaultDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="user"></i> Complete Your Profile</h3>
        </div>
        <div class="card-content">
          <p>Complete your profile to unlock all features</p>
          <button class="btn btn-primary btn-small" onclick="navigateToSection('profile')">
            <i data-lucide="edit"></i> Complete Profile
          </button>
        </div>
      </div>
    </div>
  `;
}

// Updated Dashboard Content - Replace the dashboard creation functions in your dashboard.js

// Updated Entrepreneur Dashboard with real functionality
function createEntrepreneurDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="lightbulb"></i> My Business Ideas</h3>
        </div>
        <div class="card-content">
          <div class="stat-number idea-count">0</div>
          <div class="stat-label">Published Ideas</div>
          <button class="btn btn-primary btn-small add-business-idea-btn">
            <i data-lucide="plus"></i> Post New Idea
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="users"></i> Interested Investors</h3>
        </div>
        <div class="card-content">
          <div class="stat-number interested-count">0</div>
          <div class="stat-label">Total Interest</div>
          <button class="btn btn-outline btn-small" onclick="viewInvestorInquiries()">
            <i data-lucide="eye"></i> View All
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="trending-up"></i> Total Views</h3>
        </div>
        <div class="card-content">
          <div class="stat-number total-views">0</div>
          <div class="stat-label">Idea Views</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <small>Visibility Score</small>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="message-square"></i> Investment Proposals</h3>
        </div>
        <div class="card-content">
          <div class="stat-number proposals-count">0</div>
          <div class="stat-label">Received Proposals</div>
          <button class="btn btn-outline btn-small" onclick="viewInvestmentProposals()">
            <i data-lucide="message-circle"></i> View Proposals
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="section-header">
        <h3>My Business Ideas</h3>
        <button class="btn btn-primary btn-small add-business-idea-btn">
          <i data-lucide="plus"></i> Add New Idea
        </button>
      </div>
      <div id="userIdeasContainer" class="ideas-grid">
        <div class="loading-spinner">Loading your ideas...</div>
      </div>
    </div>

    <div class="recent-activity">
      <h3>Recent Activity</h3>
      <div id="recentActivity" class="activity-list">
        <div class="loading-spinner">Loading activity...</div>
      </div>
    </div>
  `;
}

// Updated Investor Dashboard
function createInvestorDashboard() {
  return `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="briefcase"></i> My Proposals</h3>
        </div>
        <div class="card-content">
          <div class="stat-number my-proposals-count">0</div>
          <div class="stat-label">Sent Proposals</div>
          <button class="btn btn-primary btn-small" onclick="viewMyProposals()">
            <i data-lucide="pie-chart"></i> View Proposals
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="search"></i> New Opportunities</h3>
        </div>
        <div class="card-content">
          <div class="stat-number new-opportunities">0</div>
          <div class="stat-label">Matching Your Criteria</div>
          <button class="btn btn-outline btn-small" onclick="navigateToSection('browse')">
            <i data-lucide="external-link"></i> Browse Ideas
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="trending-up"></i> Interested Ideas</h3>
        </div>
        <div class="card-content">
          <div class="stat-number interested-ideas">0</div>
          <div class="stat-label">Ideas You're Following</div>
          <button class="btn btn-outline btn-small" onclick="viewInterestedIdeas()">
            <i data-lucide="bookmark"></i> View Saved
          </button>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3><i data-lucide="clock"></i> Pending Reviews</h3>
        </div>
        <div class="card-content">
          <div class="stat-number pending-reviews">0</div>
          <div class="stat-label">Awaiting Response</div>
          <button class="btn btn-outline btn-small" onclick="viewPendingProposals()">
            <i data-lucide="file-text"></i> Review Status
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="section-header">
        <h3>Latest Business Opportunities</h3>
        <button class="btn btn-outline btn-small" onclick="navigateToSection('browse')">
          <i data-lucide="arrow-right"></i> View All
        </button>
      </div>
      <div id="latestOpportunities" class="ideas-grid">
        <div class="loading-spinner">Loading opportunities...</div>
      </div>
    </div>
  `;
}

// Load dashboard data after creation
async function loadDashboardData() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  try {
    if (currentUser.userType === 'business') {
      await loadEntrepreneurData();
    } else if (currentUser.userType === 'investor') {
      await loadInvestorData();
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Load entrepreneur-specific data
async function loadEntrepreneurData() {
  const currentUser = auth?.currentUser;
  if (!currentUser) return;

  try {
    // Load user's business ideas
    const ideasResult = await FirebaseService.getBusinessIdeas({
      authorId: currentUser.uid
    });

    if (ideasResult.success) {
      const ideas = ideasResult.data;

      // Update stats
      document.querySelector('.idea-count').textContent = ideas.length;

      // Calculate total views and interested investors
      let totalViews = 0;
      let totalInterested = 0;

      ideas.forEach(idea => {
        totalViews += idea.viewCount || 0;
        totalInterested += (idea.interestedInvestors || []).length;
      });

      document.querySelector('.total-views').textContent = totalViews;
      document.querySelector('.interested-count').textContent = totalInterested;

      // Update progress bar (example calculation)
      const visibilityScore = Math.min((totalViews / (ideas.length * 10)) * 100, 100);
      document.querySelector('.progress-fill').style.width = `${visibilityScore}%`;
    }

    // Load investment proposals received
    const proposalsResult = await FirebaseService.getInvestmentProposals({
      // This would need a query to get proposals for user's business ideas
      // For now, we'll skip this complex query
    });

  } catch (error) {
    console.error('Error loading entrepreneur data:', error);
  }
}

// Load investor-specific data
async function loadInvestorData() {
  const currentUser = auth?.currentUser;
  if (!currentUser) return;

  try {
    // Load investor's proposals
    const proposalsResult = await FirebaseService.getInvestmentProposals({
      investorId: currentUser.uid
    });

    if (proposalsResult.success) {
      const proposals = proposalsResult.data;
      document.querySelector('.my-proposals-count').textContent = proposals.length;

      const pendingCount = proposals.filter(p => p.status === 'pending').length;
      document.querySelector('.pending-reviews').textContent = pendingCount;
    }

    // Load latest business opportunities
    const opportunitiesResult = await FirebaseService.getBusinessIdeas({
      status: 'published',
      limit: 6
    });

    if (opportunitiesResult.success) {
      const opportunities = opportunitiesResult.data;
      document.querySelector('.new-opportunities').textContent = opportunities.length;

      // Display opportunities
      const container = document.getElementById('latestOpportunities');
      if (container && opportunities.length > 0) {
        container.innerHTML = opportunities.map(idea =>
          BusinessIdeaManager.createIdeaCard(idea, false)
        ).join('');

        if (window.lucide) {
          lucide.createIcons();
        }
      }
    }

  } catch (error) {
    console.error('Error loading investor data:', error);
  }
}

// Update the main createDashboardContent function
function createDashboardContent() {
  const dashboardSection = document.getElementById('dashboard');
  if (!dashboardSection) {
    console.error('Dashboard section not found');
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log('No user found for dashboard');
    return;
  }

  const dashboardHTML = createDashboardHTML(currentUser);
  dashboardSection.innerHTML = dashboardHTML;

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Load dashboard-specific data
  setTimeout(() => {
    loadDashboardData();
  }, 100);

  console.log('Dashboard content created for user type:', currentUser.userType);
}

// Placeholder functions for future features
window.viewInvestorInquiries = () => {
  alert('Investor Inquiries feature coming soon! This will show all investors who have shown interest in your business ideas.');
};

window.viewInvestmentProposals = () => {
  alert('Investment Proposals feature coming soon! This will show all formal proposals you have received from investors.');
};

window.viewMyProposals = () => {
  alert('My Proposals feature coming soon! This will show all investment proposals you have sent to entrepreneurs.');
};

window.viewInterestedIdeas = () => {
  alert('Interested Ideas feature coming soon! This will show business ideas you have bookmarked or shown interest in.');
};

window.viewPendingProposals = () => {
  alert('Pending Proposals feature coming soon! This will show the status of your investment proposals.');
};

// Format user type for display
function formatUserType(userType) {
  const types = {
    business: "Entrepreneur",
    investor: "Investor",
    banker: "Banking Partner",
    advisor: "Business Advisor",
  };
  return types[userType] || userType;
}

// Fix 2: Make user dropdown menu work
function initializeUserDropdown() {
  console.log("Initializing user dropdown...");

  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");

  if (!userAvatar || !userDropdown) {
    console.warn("User dropdown elements not found");
    return;
  }

  // Remove existing event listeners to prevent duplicates
  userAvatar.removeEventListener("click", toggleUserDropdown);

  // Add click event to user avatar
  userAvatar.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleUserDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      hideUserDropdown();
    }
  });

  console.log("User dropdown initialized");
}

// Toggle user dropdown
function toggleUserDropdown() {
  const userDropdown = document.getElementById("userDropdown");
  if (!userDropdown) return;

  if (userDropdown.classList.contains("hidden")) {
    showUserDropdown();
  } else {
    hideUserDropdown();
  }
}

// Show user dropdown
function showUserDropdown() {
  const userDropdown = document.getElementById("userDropdown");
  if (userDropdown) {
    userDropdown.classList.remove("hidden");
    userDropdown.style.display = "block";
    console.log("User dropdown shown");
  }
}

// Hide user dropdown
function hideUserDropdown() {
  const userDropdown = document.getElementById("userDropdown");
  if (userDropdown) {
    userDropdown.classList.add("hidden");
    userDropdown.style.display = "none";
    console.log("User dropdown hidden");
  }
}

// Fix 3: Create profile section content
function createProfileContent() {
  const profileSection = document.getElementById("profile");
  if (!profileSection) {
    console.error("Profile section not found");
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("No user found for profile");
    return;
  }

  const profileHTML = `
    <div class="container">
      <div class="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div class="profile-content">
        <div class="profile-card">
          <div class="profile-avatar-section">
            <div class="profile-avatar-large">
              ${(currentUser.displayName || currentUser.email)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <button class="btn btn-outline btn-small">
              <i data-lucide="camera"></i> Change Photo
            </button>
          </div>

          <form class="profile-form" onsubmit="updateProfile(event)">
            <div class="form-row">
              <div class="form-group">
                <label for="profileFirstName">First Name</label>
                <input type="text" id="profileFirstName" value="${
                  currentUser.profile?.firstName || ""
                }" required>
              </div>
              <div class="form-group">
                <label for="profileLastName">Last Name</label>
                <input type="text" id="profileLastName" value="${
                  currentUser.profile?.lastName || ""
                }" required>
              </div>
            </div>

            <div class="form-group">
              <label for="profileEmail">Email Address</label>
              <input type="email" id="profileEmail" value="${
                currentUser.email
              }" readonly>
              <small>Email cannot be changed</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="profilePhone">Phone Number</label>
                <input type="tel" id="profilePhone" value="${
                  currentUser.profile?.phone || ""
                }">
              </div>
              <div class="form-group">
                <label for="profileLocation">Location</label>
                <input type="text" id="profileLocation" value="${
                  currentUser.profile?.location || ""
                }">
              </div>
            </div>

            <div class="form-group">
              <label for="profileCompany">Company/Organization</label>
              <input type="text" id="profileCompany" value="${
                currentUser.profile?.company || ""
              }" placeholder="Optional">
            </div>

            <div class="form-group">
              <label for="profileUserType">Account Type</label>
              <select id="profileUserType" disabled>
                <option value="${currentUser.userType}">${formatUserType(
    currentUser.userType
  )}</option>
              </select>
              <small>Contact support to change account type</small>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i data-lucide="save"></i> Update Profile
              </button>
              <button type="button" class="btn btn-outline" onclick="resetProfileForm()">
                <i data-lucide="refresh-cw"></i> Reset Changes
              </button>
            </div>
          </form>
        </div>

        <div class="profile-actions">
          <h3>Account Actions</h3>
          <div class="action-list">
            <button class="btn btn-outline" onclick="showChangePasswordModal()">
              <i data-lucide="key"></i> Change Password
            </button>
            <button class="btn btn-outline" onclick="exportAccountData()">
              <i data-lucide="download"></i> Export My Data
            </button>
            <button class="btn btn-danger" onclick="showDeleteAccountModal()">
              <i data-lucide="trash-2"></i> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  profileSection.innerHTML = profileHTML;
  console.log("Profile content created");
}

// Enhanced navigation function that creates content when needed
function enhancedNavigateToSection(sectionName, updateHistory = true) {
  console.log("Enhanced navigation to:", sectionName);

  // Check if user is logged in for protected sections
  const currentUser = getCurrentUser();
  const protectedSections = ["dashboard", "profile"];

  if (protectedSections.includes(sectionName) && !currentUser) {
    console.log("Section requires authentication");
    showAuthModal("login");
    return;
  }

  // Create content for special sections
  if (sectionName === "dashboard") {
    createDashboardContent();
  } else if (sectionName === "profile") {
    createProfileContent();
  }

  // Call original navigation function
  if (typeof navigateToSection !== "undefined") {
    navigateToSection(sectionName, updateHistory);
  }
}

// Override the global navigation function
window.navigateToSection = enhancedNavigateToSection;

// Dashboard action functions (placeholder implementations)
window.showAddBusinessIdeaModal = () =>
  alert("Add Business Idea feature coming soon!");
window.viewInvestorInquiries = () =>
  alert("Investor Inquiries feature coming soon!");
window.viewAllMessages = () => alert("Messages feature coming soon!");
window.viewPortfolio = () => alert("Portfolio feature coming soon!");
window.viewPendingReviews = () => alert("Pending Reviews feature coming soon!");
window.viewLoanApplications = () =>
  alert("Loan Applications feature coming soon!");
window.viewClients = () => alert("Client Management feature coming soon!");
window.viewSchedule = () => alert("Schedule feature coming soon!");

// Profile action functions
window.updateProfile = (e) => {
  e.preventDefault();
  alert("Profile update feature coming soon!");
};

window.resetProfileForm = () => {
  console.log("Resetting profile form");
  createProfileContent(); // Reload the form
};

window.showChangePasswordModal = () =>
  alert("Change Password feature coming soon!");
window.exportAccountData = () => alert("Export Data feature coming soon!");
window.showDeleteAccountModal = () =>
  alert("Delete Account feature coming soon!");

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing dashboard and navigation enhancements...");

  // Wait a bit for other scripts to load
  setTimeout(() => {
    initializeUserDropdown();

    // Check if user is logged in and update dashboard
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log("User found, dashboard ready for:", currentUser.userType);
    }

    console.log("Dashboard and navigation enhancements ready!");
  }, 500);
});

// Make functions available globally
window.toggleUserDropdown = toggleUserDropdown;
window.getCurrentUser = getCurrentUser;
