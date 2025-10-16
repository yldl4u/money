// --- Utility functions ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function saveUser(username, password) {
  let users = getUsers();
  users[username] = password;
  localStorage.setItem('users', JSON.stringify(users));
}
function userExists(username) {
  let users = getUsers();
  return !!users[username];
}
function verifyUser(username, password) {
  let users = getUsers();
  return users[username] === password;
}
function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}
function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

function getNotes(username) {
  return JSON.parse(localStorage.getItem('notes_' + username) || '[]');
}
function saveNote(username, content) {
  let notes = getNotes(username);
  notes.unshift({
    content,
    date: new Date().toLocaleString(),
    id: Date.now()
  });
  localStorage.setItem('notes_' + username, JSON.stringify(notes));
}
function deleteNote(username, id) {
  let notes = getNotes(username).filter(n => n.id !== id);
  localStorage.setItem('notes_' + username, JSON.stringify(notes));
}

// --- Main app rendering ---
const app = document.getElementById('app');

function render() {
  if (getCurrentUser()) {
    renderMain();
  } else {
    renderAuth();
  }
}

function renderAuth() {
  app.innerHTML = `
    <div class="header">
      <h1>Money Invest App</h1>
      <p>Calculator &amp; Notebook</p>
    </div>
    <div class="form-section" id="auth-section">
      <div class="tabs">
        <button class="tab-btn active" id="login-tab">Login</button>
        <button class="tab-btn" id="signup-tab">Signup</button>
      </div>
      <div id="login-form"></div>
      <div id="signup-form" style="display: none;"></div>
    </div>
  `;
  renderLoginForm();
  renderSignupForm();
  document.getElementById('login-tab').onclick = () => {
    setTab('login');
  };
  document.getElementById('signup-tab').onclick = () => {
    setTab('signup');
  };
}

function setTab(tab) {
  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
}

function renderLoginForm() {
  document.getElementById('login-form').innerHTML = `
    <form id="loginForm">
      <div class="input-group">
        <label>Username</label>
        <input type="text" id="loginUsername" required autocomplete="username">
      </div>
      <div class="input-group">
        <label>Password</label>
        <input type="password" id="loginPassword" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn">Login</button>
      <div id="loginError" class="error"></div>
    </form>
  `;
  document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    let username = document.getElementById('loginUsername').value.trim();
    let password = document.getElementById('loginPassword').value;
    if (!userExists(username)) {
      document.getElementById('loginError').textContent = "User does not exist.";
      return;
    }
    if (!verifyUser(username, password)) {
      document.getElementById('loginError').textContent = "Incorrect password.";
      return;
    }
    setCurrentUser(username);
    render();
  };
}

function renderSignupForm() {
  document.getElementById('signup-form').innerHTML = `
    <form id="signupForm">
      <div class="input-group">
        <label>Username</label>
        <input type="text" id="signupUsername" required autocomplete="username">
      </div>
      <div class="input-group">
        <label>Password</label>
        <input type="password" id="signupPassword" required autocomplete="new-password">
      </div>
      <button type="submit" class="btn">Signup</button>
      <div id="signupError" class="error"></div>
      <div id="signupSuccess" class="success"></div>
    </form>
  `;
  document.getElementById('signupForm').onsubmit = function(e) {
    e.preventDefault();
    let username = document.getElementById('signupUsername').value.trim();
    let password = document.getElementById('signupPassword').value;
    if (username.length < 3) {
      document.getElementById('signupError').textContent = "Username must be at least 3 characters.";
      return;
    }
    if (password.length < 4) {
      document.getElementById('signupError').textContent = "Password must be at least 4 characters.";
      return;
    }
    if (userExists(username)) {
      document.getElementById('signupError').textContent = "Username already exists.";
      return;
    }
    saveUser(username, password);
    document.getElementById('signupError').textContent = "";
    document.getElementById('signupSuccess').textContent = "Signup successful! You can now login.";
    setTab('login');
  };
}

// --- Main App ---
function renderMain() {
  const username = getCurrentUser();
  app.innerHTML = `
    <div class="header" style="position: relative;">
      <h1>Welcome, ${username}</h1>
      <p>Money Invest Calculator &amp; Notebook</p>
      <button class="logout-btn" id="logoutBtn">Logout</button>
    </div>
    <div class="tabs">
      <button class="tab-btn active" id="calc-tab">Calculator</button>
      <button class="tab-btn" id="notes-tab">Notebook</button>
    </div>
    <div id="calc-section"></div>
    <div id="notes-section" style="display: none;"></div>
  `;
  document.getElementById('logoutBtn').onclick = () => {
    clearCurrentUser();
    render();
  };
  document.getElementById('calc-tab').onclick = () => {
    setMainTab('calc');
  };
  document.getElementById('notes-tab').onclick = () => {
    setMainTab('notes');
  };
  renderCalculator();
  renderNotebook();
}
function setMainTab(tab) {
  document.getElementById('calc-tab').classList.toggle('active', tab === 'calc');
  document.getElementById('notes-tab').classList.toggle('active', tab === 'notes');
  document.getElementById('calc-section').style.display = tab === 'calc' ? 'block' : 'none';
  document.getElementById('notes-section').style.display = tab === 'notes' ? 'block' : 'none';
}

// --- Calculator ---
function renderCalculator() {
  document.getElementById('calc-section').innerHTML = `
    <form id="investForm" class="form-section">
      <h2>Investment Calculator</h2>
      <div class="input-group">
        <label>Principal Amount ($)</label>
        <input type="number" id="principal" required min="0" step="any">
      </div>
      <div class="input-group">
        <label>Annual Interest Rate (%)</label>
        <input type="number" id="rate" required min="0" step="any">
      </div>
      <div class="input-group">
        <label>Time (Years)</label>
        <input type="number" id="time" required min="1" step="1">
      </div>
      <button type="submit" class="btn">Calculate</button>
      <div id="calcResult" class="success"></div>
    </form>
  `;
  document.getElementById('investForm').onsubmit = function(e) {
    e.preventDefault();
    let principal = parseFloat(document.getElementById('principal').value);
    let rate = parseFloat(document.getElementById('rate').value);
    let time = parseInt(document.getElementById('time').value, 10);
    if (principal <= 0 || rate < 0 || time < 1) {
      document.getElementById('calcResult').textContent = "Please enter valid values.";
      return;
    }
    // Compound interest calculation:
    let amount = principal * Math.pow((1 + rate / 100), time);
    let interest = amount - principal;
    document.getElementById('calcResult').innerHTML =
      `Final Amount: <strong>$${amount.toFixed(2)}</strong><br>` +
      `Total Interest: <strong>$${interest.toFixed(2)}</strong>`;
  };
}

// --- Notebook ---
function renderNotebook() {
  const username = getCurrentUser();
  document.getElementById('notes-section').innerHTML = `
    <div class="form-section">
      <h2>Notebook</h2>
      <form id="noteForm">
        <div class="input-group">
          <label>Add Note</label>
          <textarea id="noteContent" rows="2" required placeholder="Write your note..."></textarea>
        </div>
        <button type="submit" class="btn">Add Note</button>
      </form>
      <ul class="note-list" id="notesList"></ul>
    </div>
  `;
  document.getElementById('noteForm').onsubmit = function(e) {
    e.preventDefault();
    let content = document.getElementById('noteContent').value.trim();
    if (content.length === 0) return;
    saveNote(username, content);
    document.getElementById('noteContent').value = '';
    renderNotesList();
  };
  renderNotesList();
}

function renderNotesList() {
  const username = getCurrentUser();
  const notes = getNotes(username);
  const notesList = document.getElementById('notesList');
  if (notes.length === 0) {
    notesList.innerHTML = `<li class="note-item">No notes yet.</li>`;
    return;
  }
  notesList.innerHTML = notes.map(note =>
    `<li class="note-item">
      <button class="delete-note" title="Delete" data-id="${note.id}">&times;</button>
      <div>${note.content}</div>
      <div class="note-date">${note.date}</div>
    </li>`
  ).join('');
  Array.from(document.getElementsByClassName('delete-note')).forEach(btn => {
    btn.onclick = function() {
      deleteNote(username, parseInt(btn.getAttribute('data-id')));
      renderNotesList();
    };
  });
}

// --- Initial render ---
render();