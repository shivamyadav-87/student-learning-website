




const USERS_KEY = "learnhub_users";
const SESSION_KEY = "learnhub_session";
const ENROLL_KEY = "learnhub_enrollments";

// ==============================
// USER AND SESSION FUNCTIONS
// ==============================

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function getUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function showMessage(message, type = "") {
  const box = document.getElementById("message");

  if (!box) return;

  box.textContent = message;
  box.className = "notice " + type;
  box.hidden = false;
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

function requireLogin() {
  const user = getUser();

  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}

// ==============================
// PROFILE DROPDOWN
// ==============================


function renderProfile() {
  const nav = document.querySelector(".nav-links");
  if (!nav) return;

  const user = getUser();
  let menu = document.getElementById("profile-menu");

  // Login nahi hai toh Profile hatao,
  // Login aur Register dikhao.
  if (!user) {
    if (menu) menu.remove();

    nav.querySelectorAll('a[href="login.html"], a[href="register.html"]')
      .forEach(link => {
        link.style.display = "";
      });

    return;
  }

  // Login hai toh Login aur Register hide karo.
  nav.querySelectorAll('a[href="login.html"], a[href="register.html"]')
    .forEach(link => {
      link.style.display = "none";
    });

  // Profile dropdown pehle se bana hai toh dobara mat banao.
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "profile-menu";
    menu.className = "profile-menu";

    menu.innerHTML = `
      <button type="button"
        class="profile-btn"
        id="profile-toggle"
        aria-expanded="false"
        aria-controls="profile-dropdown">
        <span class="profile-icon">👤</span>
        <span>Profile</span>
        <span class="profile-arrow">▼</span>
      </button>

      <div class="profile-dropdown" id="profile-dropdown" hidden>
        <div class="profile-info">
          <strong id="profile-name"></strong>
          <small id="profile-email"></small>
        </div>

        <a href="dashboard.html">My Dashboard</a>
        <button type="button" id="profile-logout">↪ Logout</button>
      </div>
    `;

    nav.appendChild(menu);

    const toggle = menu.querySelector("#profile-toggle");
    const dropdown = menu.querySelector("#profile-dropdown");

    toggle.addEventListener("click", () => {
      dropdown.hidden = !dropdown.hidden;
      toggle.setAttribute("aria-expanded", String(!dropdown.hidden));
    });

    menu.querySelector("#profile-logout").addEventListener("click", logout);

    document.addEventListener("click", event => {
      if (!menu.contains(event.target)) {
        dropdown.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  menu.querySelector("#profile-name").textContent = user.name;
  menu.querySelector("#profile-email").textContent = user.email;
}
// ==============================
// COURSE DATA
// ==============================

const courses = [
  {
    id: "html",
    icon: "🌐",
    name: "HTML Fundamentals",
    level: "Beginner",
    description: "Learn website structure, links, images and forms."
  },
  {
    id: "css",
    icon: "🎨",
    name: "CSS & Responsive Design",
    level: "Beginner",
    description: "Design attractive websites for mobile and desktop."
  },
  {
    id: "js",
    icon: "⚡",
    name: "JavaScript Basics",
    level: "Intermediate",
    description: "Learn variables, functions and interactive websites."
  },
  {
    id: "python",
    icon: "🐍",
    name: "Python Programming",
    level: "Beginner",
    description: "Explore programming with Python."
  },
  {
    id: "dbms",
    icon: "🗄️",
    name: "Database Basics",
    level: "Beginner",
    description: "Understand databases, tables and SQL."
  },
  {
    id: "git",
    icon: "💻",
    name: "Git & GitHub",
    level: "Beginner",
    description: "Learn version control and project collaboration."
  }
];

// ==============================
// ENROLLMENT FUNCTIONS
// ==============================

function getEnrollments() {
  return JSON.parse(localStorage.getItem(ENROLL_KEY) || "{}");
}

function isEnrolled(id) {
  const user = getUser();

  if (!user) return false;

  const all = getEnrollments();

  return (all[user.email] || []).includes(id);
}

function enrollCourse(id) {
  const user = requireLogin();

  if (!user) return;

  const course = courses.find(item => item.id === id);

  if (!course) return;

  const all = getEnrollments();
  all[user.email] = all[user.email] || [];

  if (all[user.email].includes(id)) {
    alert("Tum is course mein pehle se enrolled ho!");
    return;
  }

  all[user.email].push(id);

  localStorage.setItem(ENROLL_KEY, JSON.stringify(all));

  renderCourses();
  renderDashboard();
}

function cancelEnrollment(id) {
  const user = requireLogin();

  if (!user) return;

  if (!isEnrolled(id)) return;

  const course = courses.find(item => item.id === id);

  if (!course) return;

  const confirmed = confirm(
    `Kya tum "${course.name}" ka enrollment cancel karna chahte ho?`
  );

  if (!confirmed) return;

  const all = getEnrollments();

  all[user.email] = (all[user.email] || []).filter(
    courseId => courseId !== id
  );

  localStorage.setItem(ENROLL_KEY, JSON.stringify(all));

  renderCourses();
  renderDashboard();
}

// ==============================
// COURSE CARD
// ==============================

function courseCard(course) {
  const enrolled = isEnrolled(course.id);

  return `
    <article class="card">
      <div class="course-icon">${course.icon}</div>

      <span class="tag">${course.level}</span>

      <h3>${course.name}</h3>

      <p>${course.description}</p>

      <div class="card-foot">
        <span class="muted">
          ${enrolled ? "✓ Enrolled" : "Self-paced"}
        </span>

        ${
          enrolled
            ? `
              <button
                class="btn btn-small"
                style="background:#dc2626"
                onclick="cancelEnrollment('${course.id}')"
              >
                Cancel Enrollment
              </button>
            `
            : `
              <button
                class="btn btn-small"
                onclick="enrollCourse('${course.id}')"
              >
                Enroll Now
              </button>
            `
        }
      </div>
    </article>
  `;
}

// ==============================
// RENDER COURSES PAGE
// ==============================

function renderCourses() {
  const list = document.getElementById("course-list");

  if (list) {
    list.innerHTML = courses.map(courseCard).join("");
  }
}

// ==============================
// STUDENT DASHBOARD
// ==============================

function renderDashboard() {
  const box = document.getElementById("dashboard-content");

  if (!box) return;

  const user = getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const all = getEnrollments();

  const enrolled = courses.filter(course =>
    (all[user.email] || []).includes(course.id)
  );

  box.innerHTML = `
    <div class="page-heading">
      <span class="eyebrow">STUDENT DASHBOARD</span>

      <h1 style="margin-top:12px">
        Welcome, ${escapeHTML(user.name)}!
      </h1>

      <p>Keep learning, one step at a time.</p>
    </div>

    <div class="dashboard-grid">
      <div class="dash-stat">
        <span class="muted">Available Courses</span>
        <strong>${courses.length}</strong>
      </div>

      <div class="dash-stat">
        <span class="muted">Enrolled Courses</span>
        <strong>${enrolled.length}</strong>
      </div>

      <div class="dash-stat">
        <span class="muted">Learning Status</span>
        <strong>${enrolled.length ? "Learning" : "Get Started"}</strong>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>My Learning</h2>
        <p>Your enrolled courses.</p>
      </div>

      <a class="btn btn-outline" href="courses.html">
        Explore Courses
      </a>
    </div>

    ${
      enrolled.length
        ? `<div class="cards">
             ${enrolled.map(courseCard).join("")}
           </div>`
        : `
          <div class="empty">
            <h3>No courses enrolled yet</h3>
            <p>Explore courses and enroll to start learning.</p>
            <br>
            <a class="btn" href="courses.html">
              Browse Courses
            </a>
          </div>
        `
    }
  `;
}

// Escape user-provided text before placing it in HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ==============================
// REGISTRATION, LOGIN & CONTACT
// ==============================

document.addEventListener("DOMContentLoaded", () => {

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // Registration
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email")
        .value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm-password").value;

      if (name.length < 2) {
        return showMessage("Please enter your full name.", "error");
      }

      if (password.length < 6) {
        return showMessage(
          "Password must be at least 6 characters.",
          "error"
        );
      }

      if (password !== confirm) {
        return showMessage("Passwords do not match.", "error");
      }

      const users = getUsers();

      if (users.some(user => user.email === email)) {
        return showMessage(
          "Email already registered. Please login.",
          "error"
        );
      }

      users.push({ name, email, password });

      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ name, email })
      );

      showMessage(
        "Registration successful! Opening dashboard.",
        "success"
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    });
  }

  // Login
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const email = document.getElementById("email")
        .value.trim().toLowerCase();
      const password = document.getElementById("password").value;

      const user = getUsers().find(
        item => item.email === email && item.password === password
      );

      if (!user) {
        return showMessage(
          "Incorrect email or password. Please register first.",
          "error"
        );
      }

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          name: user.name,
          email: user.email
        })
      );

      showMessage("Login successful!", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    });
  }

  // Contact form (demo only)
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      showMessage(
        "Thank you! Demo form submitted successfully.",
        "success"
      );

      contactForm.reset();
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  // Initialize page components
  renderProfile();
  renderCourses();
  renderDashboard();

});
