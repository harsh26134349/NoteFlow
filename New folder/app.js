/* ============================================================
   NoteFlow — Application Logic with Firebase Auth
   ============================================================ */

(function () {
    'use strict';

    // ===== FIREBASE CONFIG =====
    const firebaseConfig = {
        apiKey: "AIzaSyCK6SY9P1rHYr4L_uRwBgz8NBkuOOytfx4",
        authDomain: "performance-manager-66d08.firebaseapp.com",
        projectId: "performance-manager-66d08",
        storageBucket: "performance-manager-66d08.firebasestorage.app",
        messagingSenderId: "831768066640",
        appId: "1:831768066640:web:d929dea0ddd20969a96f55",
        measurementId: "G-Q7RZ3VLFBW"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // ===== STATE =====
    let currentUser = null;
    let notes = [];
    let goals = [];
    let currentPage = 'home';
    let timerInterval = null;

    // ===== DOM REFERENCES =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const DOM = {
        // Screens
        loadingScreen: $('#loading-screen'),
        authPage: $('#auth-page'),
        appContainer: $('#app-container'),

        // Auth Tabs
        tabLogin: $('#tab-login'),
        tabSignup: $('#tab-signup'),
        loginForm: $('#login-form'),
        signupForm: $('#signup-form'),

        // Login
        loginEmail: $('#login-email'),
        loginPassword: $('#login-password'),
        loginError: $('#login-error'),
        loginSubmitBtn: $('#login-submit-btn'),

        // Signup
        signupName: $('#signup-name'),
        signupEmail: $('#signup-email'),
        signupPassword: $('#signup-password'),
        signupConfirm: $('#signup-confirm'),
        signupError: $('#signup-error'),
        signupSubmitBtn: $('#signup-submit-btn'),

        // Google
        googleBtn: $('#google-signin-btn'),

        // User Profile
        userAvatar: $('#user-avatar'),
        userDropdown: $('#user-dropdown'),
        dropdownAvatar: $('#dropdown-avatar'),
        dropdownName: $('#dropdown-name'),
        dropdownEmail: $('#dropdown-email'),
        logoutBtn: $('#logout-btn'),

        // Sidebar
        sidebar: $('#sidebar'),
        sidebarToggle: $('#sidebar-toggle'),
        sidebarOverlay: $('#sidebar-overlay'),
        sidebarGoalsList: $('#sidebar-goals-list'),
        sidebarEmpty: $('#sidebar-empty'),
        mobileMenuBtn: $('#mobile-menu-btn'),

        // Navigation
        navLinks: $$('.nav-link'),
        navClock: $('#nav-clock'),

        // Pages
        pages: $$('.page'),

        // Home
        greetingText: $('#greeting-text'),
        greetingSub: $('#greeting-sub'),
        statNotes: $('#stat-notes-count'),
        statActive: $('#stat-active-count'),
        statCompleted: $('#stat-completed-count'),
        upcomingList: $('#upcoming-list'),
        upcomingEmpty: $('#upcoming-empty'),
        recentNotesList: $('#recent-notes-list'),
        recentNotesEmpty: $('#recent-notes-empty'),

        // Notes
        noteForm: $('#note-form'),
        noteTitle: $('#note-title'),
        noteContent: $('#note-content'),
        noteDate: $('#note-date'),
        notesContainer: $('#notes-container'),

        // Goals
        goalForm: $('#goal-form'),
        goalTitle: $('#goal-title'),
        goalDescription: $('#goal-description'),
        goalDeadline: $('#goal-deadline'),
        goalsContainer: $('#goals-container'),

        // Background Modal
        bgSettingsBtn: $('#bg-settings-btn'),
        bgModalOverlay: $('#bg-modal-overlay'),
        bgModalClose: $('#bg-modal-close'),
        bgUploadArea: $('#bg-upload-area'),
        bgFileInput: $('#bg-file-input'),
        bgPresetsGrid: $('#bg-presets-grid'),
        bgResetBtn: $('#bg-reset-btn'),

        // Main (for background)
        mainEl: $('#main'),

        // Toast
        toastContainer: $('#toast-container'),
    };

    // ============================================================
    // AUTH LOGIC
    // ============================================================

    // --- Auth State Observer ---
    auth.onAuthStateChanged((user) => {
        // Hide loading screen
        setTimeout(() => {
            DOM.loadingScreen.classList.add('hidden');
        }, 600);

        if (user) {
            currentUser = user;
            showApp();
            loadState();
            loadBgSetting();
            initApp();
        } else {
            currentUser = null;
            showAuth();
            stopApp();
        }
    });

    function showAuth() {
        DOM.authPage.style.display = 'flex';
        DOM.appContainer.style.display = 'none';
    }

    function showApp() {
        DOM.authPage.style.display = 'none';
        DOM.appContainer.style.display = 'flex';
        updateUserProfile();
    }

    function updateUserProfile() {
        if (!currentUser) return;

        const name = currentUser.displayName || currentUser.email.split('@')[0];
        const email = currentUser.email;
        const photoURL = currentUser.photoURL;
        const initial = name.charAt(0).toUpperCase();

        // Navbar avatar
        if (photoURL) {
            DOM.userAvatar.innerHTML = `<img src="${photoURL}" alt="${name}" referrerpolicy="no-referrer">`;
        } else {
            DOM.userAvatar.textContent = initial;
        }

        // Dropdown
        if (photoURL) {
            DOM.dropdownAvatar.innerHTML = `<img src="${photoURL}" alt="${name}" referrerpolicy="no-referrer">`;
        } else {
            DOM.dropdownAvatar.textContent = initial;
        }
        DOM.dropdownName.textContent = name;
        DOM.dropdownEmail.textContent = email;
    }

    // --- Auth Tab Switching ---
    function switchAuthTab(tab) {
        if (tab === 'login') {
            DOM.tabLogin.classList.add('active');
            DOM.tabSignup.classList.remove('active');
            DOM.loginForm.style.display = 'flex';
            DOM.signupForm.style.display = 'none';
            DOM.loginError.textContent = '';
            DOM.signupError.textContent = '';
        } else {
            DOM.tabSignup.classList.add('active');
            DOM.tabLogin.classList.remove('active');
            DOM.signupForm.style.display = 'flex';
            DOM.loginForm.style.display = 'none';
            DOM.loginError.textContent = '';
            DOM.signupError.textContent = '';
        }
    }

    // --- Friendly Error Messages ---
    function getAuthErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email. Sign up first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid email or password. Please try again.',
            'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
            'auth/network-request-failed': 'Network error. Check your internet connection.',
        };
        return messages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // --- Button Loading State ---
    function setButtonLoading(btn, loading) {
        const text = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        if (loading) {
            text.style.display = 'none';
            loader.style.display = 'flex';
            btn.disabled = true;
        } else {
            text.style.display = 'inline';
            loader.style.display = 'none';
            btn.disabled = false;
        }
    }

    // --- Sign Up (Email + Password) ---
    async function handleSignup(e) {
        e.preventDefault();
        DOM.signupError.textContent = '';

        const name = DOM.signupName.value.trim();
        const email = DOM.signupEmail.value.trim();
        const password = DOM.signupPassword.value;
        const confirm = DOM.signupConfirm.value;

        if (!name) {
            DOM.signupError.textContent = 'Please enter your display name.';
            return;
        }
        if (password.length < 6) {
            DOM.signupError.textContent = 'Password must be at least 6 characters.';
            return;
        }
        if (password !== confirm) {
            DOM.signupError.textContent = 'Passwords do not match.';
            return;
        }

        setButtonLoading(DOM.signupSubmitBtn, true);

        try {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            // Update display name
            await cred.user.updateProfile({ displayName: name });
            // Reload to get updated profile
            await cred.user.reload();
            currentUser = auth.currentUser;
            showToast(`Welcome to NoteFlow, ${name}! 🎉`, 'success');
        } catch (error) {
            DOM.signupError.textContent = getAuthErrorMessage(error.code);
        } finally {
            setButtonLoading(DOM.signupSubmitBtn, false);
        }
    }

    // --- Sign In (Email + Password) ---
    async function handleLogin(e) {
        e.preventDefault();
        DOM.loginError.textContent = '';

        const email = DOM.loginEmail.value.trim();
        const password = DOM.loginPassword.value;

        if (!email || !password) {
            DOM.loginError.textContent = 'Please fill in both email and password.';
            return;
        }

        setButtonLoading(DOM.loginSubmitBtn, true);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            showToast('Welcome back! 👋', 'success');
        } catch (error) {
            DOM.loginError.textContent = getAuthErrorMessage(error.code);
        } finally {
            setButtonLoading(DOM.loginSubmitBtn, false);
        }
    }

    // --- Google Sign-In ---
    async function handleGoogleSignIn() {
        try {
            await auth.signInWithPopup(googleProvider);
            showToast('Signed in with Google! 🚀', 'success');
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                showToast(getAuthErrorMessage(error.code), 'error');
            }
        }
    }

    // --- Sign Out ---
    async function handleSignOut() {
        try {
            await auth.signOut();
            showToast('Signed out successfully', 'info');
        } catch (error) {
            showToast('Failed to sign out', 'error');
        }
    }

    // --- Password Toggle ---
    function initPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                const eyeOpen = btn.querySelector('.eye-open');
                const eyeClosed = btn.querySelector('.eye-closed');

                if (input.type === 'password') {
                    input.type = 'text';
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'block';
                } else {
                    input.type = 'password';
                    eyeOpen.style.display = 'block';
                    eyeClosed.style.display = 'none';
                }
            });
        });
    }

    // ============================================================
    // LOCAL STORAGE (per-user)
    // ============================================================
    function getStorageKey(type) {
        if (!currentUser) return `noteflow_${type}`;
        return `noteflow_${currentUser.uid}_${type}`;
    }

    function saveState() {
        localStorage.setItem(getStorageKey('notes'), JSON.stringify(notes));
        localStorage.setItem(getStorageKey('goals'), JSON.stringify(goals));
    }

    function loadState() {
        try {
            const savedNotes = localStorage.getItem(getStorageKey('notes'));
            const savedGoals = localStorage.getItem(getStorageKey('goals'));
            notes = savedNotes ? JSON.parse(savedNotes) : [];
            goals = savedGoals ? JSON.parse(savedGoals) : [];
        } catch (e) {
            console.error('Failed to load state:', e);
            notes = [];
            goals = [];
        }
    }

    // ============================================================
    // UTILITIES
    // ============================================================
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        if (dateOnly.getTime() === today.getTime()) return 'Today';
        if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
        if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function formatDeadline(deadlineStr) {
        const d = new Date(deadlineStr);
        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    }

    function getCountdown(deadlineStr) {
        const now = Date.now();
        const deadline = new Date(deadlineStr).getTime();
        const diff = deadline - now;

        if (diff <= 0) return { text: 'Overdue', status: 'overdue', diff };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let text = '';
        if (days > 0) text += `${days}d `;
        if (hours > 0 || days > 0) text += `${hours}h `;
        text += `${minutes}m ${seconds}s`;

        const status = diff < 24 * 60 * 60 * 1000 ? 'urgent' : 'active';
        return { text: text.trim(), status, diff };
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHtml(message)}</span>`;
        DOM.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================================
    // CLOCK & GREETING
    // ============================================================
    function updateClock() {
        DOM.navClock.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        let emoji = '🌙';
        if (hour < 12) { greeting = 'Good Morning'; emoji = '☀️'; }
        else if (hour < 17) { greeting = 'Good Afternoon'; emoji = '🌤️'; }

        const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || '';
        DOM.greetingText.textContent = `${greeting}, ${name} ${emoji}`;
        DOM.greetingSub.textContent = "Here's your productivity overview";
    }

    // ============================================================
    // NAVIGATION
    // ============================================================
    function navigateTo(page) {
        currentPage = page;
        DOM.navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === page));
        DOM.pages.forEach(p => p.classList.remove('page-active'));
        $(`#page-${page}`).classList.add('page-active');

        if (page === 'home') renderHome();
        else if (page === 'notes') renderNotes();
        else if (page === 'goals') renderGoals();

        closeSidebar();
    }

    // ============================================================
    // SIDEBAR
    // ============================================================
    function openSidebar() {
        DOM.sidebar.classList.add('open');
        DOM.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        DOM.sidebar.classList.remove('open');
        DOM.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderSidebar() {
        const activeGoals = goals.filter(g => !g.completed);

        if (activeGoals.length === 0) {
            DOM.sidebarEmpty.style.display = 'flex';
            DOM.sidebarGoalsList.querySelectorAll('.sidebar-goal-card').forEach(el => el.remove());
            return;
        }

        DOM.sidebarEmpty.style.display = 'none';
        const sorted = [...activeGoals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        let html = '';
        sorted.forEach((goal, i) => {
            const cd = getCountdown(goal.deadline);
            html += `
                <div class="sidebar-goal-card" style="animation-delay: ${i * 0.06}s" data-goal-id="${goal.id}">
                    <div class="sidebar-goal-title">${escapeHtml(goal.title)}</div>
                    <div class="sidebar-goal-timer">
                        <span class="timer-dot ${cd.status}"></span>
                        <span class="timer-text ${cd.status}" data-timer-sidebar="${goal.id}">${cd.text}</span>
                    </div>
                </div>
            `;
        });

        DOM.sidebarGoalsList.querySelectorAll('.sidebar-goal-card').forEach(el => el.remove());
        DOM.sidebarGoalsList.insertAdjacentHTML('beforeend', html);
    }

    // ============================================================
    // UPDATE TIMERS (every second)
    // ============================================================
    function updateTimers() {
        goals.filter(g => !g.completed).forEach(goal => {
            const cd = getCountdown(goal.deadline);

            const sidebarEl = document.querySelector(`[data-timer-sidebar="${goal.id}"]`);
            if (sidebarEl) {
                sidebarEl.textContent = cd.text;
                sidebarEl.className = `timer-text ${cd.status}`;
                const dot = sidebarEl.previousElementSibling;
                if (dot) dot.className = `timer-dot ${cd.status}`;
            }

            const goalBadge = document.querySelector(`[data-timer-goal="${goal.id}"]`);
            if (goalBadge) {
                goalBadge.textContent = cd.text;
                goalBadge.className = `goal-timer-badge ${cd.status}`;
            }

            const goalDot = document.querySelector(`[data-dot-goal="${goal.id}"]`);
            if (goalDot) goalDot.className = `goal-status-dot ${cd.status}`;

            const upEl = document.querySelector(`[data-timer-upcoming="${goal.id}"]`);
            if (upEl) {
                upEl.textContent = cd.text;
                upEl.className = `upcoming-timer ${cd.status}`;
            }
        });
    }

    // ============================================================
    // RENDER HOME
    // ============================================================
    function renderHome() {
        updateGreeting();

        DOM.statNotes.textContent = notes.length;
        const activeGoals = goals.filter(g => !g.completed);
        const completedGoals = goals.filter(g => g.completed);
        DOM.statActive.textContent = activeGoals.length;
        DOM.statCompleted.textContent = completedGoals.length;

        // Upcoming deadlines
        const sorted = [...activeGoals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        const upcoming = sorted.slice(0, 5);

        DOM.upcomingList.querySelectorAll('.upcoming-card').forEach(el => el.remove());
        if (upcoming.length === 0) {
            DOM.upcomingEmpty.style.display = 'block';
        } else {
            DOM.upcomingEmpty.style.display = 'none';
            let html = '';
            upcoming.forEach((goal, i) => {
                const cd = getCountdown(goal.deadline);
                html += `
                    <div class="upcoming-card" style="animation-delay: ${i * 0.08}s">
                        <div class="upcoming-info">
                            <div class="upcoming-title">${escapeHtml(goal.title)}</div>
                            <div class="upcoming-date">${formatDeadline(goal.deadline)}</div>
                        </div>
                        <div class="upcoming-timer ${cd.status}" data-timer-upcoming="${goal.id}">${cd.text}</div>
                    </div>
                `;
            });
            DOM.upcomingList.insertAdjacentHTML('afterbegin', html);
        }

        // Recent notes
        const recentNotes = [...notes].sort((a, b) => {
            const dateComp = b.date.localeCompare(a.date);
            return dateComp !== 0 ? dateComp : b.createdAt - a.createdAt;
        }).slice(0, 4);

        DOM.recentNotesList.querySelectorAll('.recent-note-card').forEach(el => el.remove());
        if (recentNotes.length === 0) {
            DOM.recentNotesEmpty.style.display = 'block';
        } else {
            DOM.recentNotesEmpty.style.display = 'none';
            let html = '';
            recentNotes.forEach((note, i) => {
                html += `
                    <div class="recent-note-card" style="animation-delay: ${i * 0.08}s">
                        <div class="recent-note-title">${escapeHtml(note.title)}</div>
                        <div class="recent-note-preview">${escapeHtml(note.content || 'No content')}</div>
                        <div class="recent-note-date">${formatDate(note.date)}</div>
                    </div>
                `;
            });
            DOM.recentNotesList.insertAdjacentHTML('afterbegin', html);
        }
    }

    // ============================================================
    // RENDER NOTES
    // ============================================================
    function renderNotes() {
        if (notes.length === 0) {
            DOM.notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p>No notes yet</p>
                    <span>Add your first note above to get started</span>
                </div>
            `;
            return;
        }

        const grouped = {};
        notes.forEach(note => {
            if (!grouped[note.date]) grouped[note.date] = [];
            grouped[note.date].push(note);
        });

        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        sortedDates.forEach(date => grouped[date].sort((a, b) => b.createdAt - a.createdAt));

        let html = '';
        sortedDates.forEach((date, gi) => {
            const label = formatDate(date);
            const count = grouped[date].length;

            html += `<div class="date-group" style="animation-delay: ${gi * 0.1}s">
                <div class="date-group-header">
                    <span class="date-group-label">${escapeHtml(label)}</span>
                    <div class="date-group-line"></div>
                    <span class="date-group-count">${count} note${count > 1 ? 's' : ''}</span>
                </div>
                <div class="notes-list">`;

            grouped[date].forEach((note, ni) => {
                const timeStr = new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                html += `
                    <div class="note-card" style="animation-delay: ${(gi * 0.1) + (ni * 0.05)}s" data-note-id="${note.id}">
                        <div class="note-card-header">
                            <div class="note-card-title">${escapeHtml(note.title)}</div>
                            <button class="btn-icon" onclick="window.NoteFlow.deleteNote('${note.id}')" aria-label="Delete note" title="Delete note">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                        ${note.content ? `<div class="note-card-content">${escapeHtml(note.content)}</div>` : ''}
                        <div class="note-card-footer">
                            <span class="note-card-time">Added at ${timeStr}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        DOM.notesContainer.innerHTML = html;
    }

    // ============================================================
    // RENDER GOALS
    // ============================================================
    function renderGoals() {
        if (goals.length === 0) {
            DOM.goalsContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
                        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                    </svg>
                    <p>No goals yet</p>
                    <span>Set your first goal above and start tracking</span>
                </div>
            `;
            return;
        }

        const active = goals.filter(g => !g.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        const completed = goals.filter(g => g.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
        const sorted = [...active, ...completed];

        let html = '';
        sorted.forEach((goal, i) => {
            const cd = goal.completed ? { text: 'Completed', status: 'completed' } : getCountdown(goal.deadline);

            html += `
                <div class="goal-card ${goal.completed ? 'completed' : ''}" style="animation-delay: ${i * 0.06}s" data-goal-id="${goal.id}">
                    <div class="goal-status-dot ${cd.status}" data-dot-goal="${goal.id}"></div>
                    <div class="goal-info">
                        <div class="goal-title">${escapeHtml(goal.title)}</div>
                        ${goal.description ? `<div class="goal-desc">${escapeHtml(goal.description)}</div>` : ''}
                        <div class="goal-deadline-text">${formatDeadline(goal.deadline)}</div>
                    </div>
                    <div class="goal-timer-badge ${cd.status}" data-timer-goal="${goal.id}">${cd.text}</div>
                    <div class="goal-actions">
                        ${!goal.completed ? `
                            <button class="btn-complete" onclick="window.NoteFlow.completeGoal('${goal.id}')" aria-label="Complete goal" title="Mark as complete">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </button>
                        ` : ''}
                        <button class="btn-icon" onclick="window.NoteFlow.deleteGoal('${goal.id}')" aria-label="Delete goal" title="Delete goal">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        DOM.goalsContainer.innerHTML = html;
    }

    // ============================================================
    // CRUD: NOTES
    // ============================================================
    function addNote(title, content, date) {
        notes.push({ id: generateId(), title, content, date, createdAt: Date.now() });
        saveState();
        renderNotes();
        renderSidebar();
        renderHome();
        showToast('Note added successfully!', 'success');
    }

    function deleteNote(id) {
        const card = document.querySelector(`[data-note-id="${id}"]`);
        if (card) {
            card.style.animation = 'cardRemove 0.35s ease forwards';
            setTimeout(() => {
                notes = notes.filter(n => n.id !== id);
                saveState(); renderNotes(); renderHome();
            }, 350);
        } else {
            notes = notes.filter(n => n.id !== id);
            saveState(); renderNotes(); renderHome();
        }
        showToast('Note deleted', 'info');
    }

    // ============================================================
    // CRUD: GOALS
    // ============================================================
    function addGoal(title, description, deadline) {
        goals.push({ id: generateId(), title, description, deadline, completed: false, createdAt: Date.now(), completedAt: null });
        saveState();
        renderGoals();
        renderSidebar();
        renderHome();
        showToast('Goal created! Stay focused 💪', 'success');
    }

    function completeGoal(id) {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.completed = true;
            goal.completedAt = Date.now();
            saveState(); renderGoals(); renderSidebar(); renderHome();
            showToast('Goal completed! 🎉', 'success');
        }
    }

    function deleteGoal(id) {
        const card = document.querySelector(`[data-goal-id="${id}"]`);
        if (card) {
            card.style.animation = 'cardRemove 0.35s ease forwards';
            setTimeout(() => {
                goals = goals.filter(g => g.id !== id);
                saveState(); renderGoals(); renderSidebar(); renderHome();
            }, 350);
        } else {
            goals = goals.filter(g => g.id !== id);
            saveState(); renderGoals(); renderSidebar(); renderHome();
        }
        showToast('Goal removed', 'info');
    }

    // ===== EXPOSE PUBLIC API =====
    window.NoteFlow = { deleteNote, deleteGoal, completeGoal };

    // ============================================================
    // APP INIT & EVENT LISTENERS
    // ============================================================
    function getTodayStr() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function initApp() {
        DOM.noteDate.value = getTodayStr();
        renderHome();
        renderSidebar();
        updateClock();
        updateGreeting();

        // Start timer
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            updateTimers();
            updateClock();
        }, 1000);
    }

    function stopApp() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        notes = [];
        goals = [];
    }

    function initEvents() {
        // Auth tabs
        DOM.tabLogin.addEventListener('click', () => switchAuthTab('login'));
        DOM.tabSignup.addEventListener('click', () => switchAuthTab('signup'));

        // Auth forms
        DOM.loginForm.addEventListener('submit', handleLogin);
        DOM.signupForm.addEventListener('submit', handleSignup);
        DOM.googleBtn.addEventListener('click', handleGoogleSignIn);

        // Password toggles
        initPasswordToggles();

        // Logout
        DOM.logoutBtn.addEventListener('click', handleSignOut);

        // User avatar dropdown
        DOM.userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.userDropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!DOM.userDropdown.contains(e.target) && !DOM.userAvatar.contains(e.target)) {
                DOM.userDropdown.classList.remove('open');
            }
        });

        // Navigation
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => navigateTo(link.dataset.page));
        });

        // Sidebar mobile
        DOM.mobileMenuBtn.addEventListener('click', openSidebar);
        DOM.sidebarOverlay.addEventListener('click', closeSidebar);
        DOM.sidebarToggle.addEventListener('click', closeSidebar);

        // Note form
        DOM.noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = DOM.noteTitle.value.trim();
            const content = DOM.noteContent.value.trim();
            const date = DOM.noteDate.value;

            if (!title || !date) {
                showToast('Please fill in the title and date', 'error');
                return;
            }
            addNote(title, content, date);
            DOM.noteForm.reset();
            DOM.noteDate.value = getTodayStr();
        });

        // Goal form
        DOM.goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = DOM.goalTitle.value.trim();
            const description = DOM.goalDescription.value.trim();
            const deadline = DOM.goalDeadline.value;

            if (!title || !deadline) {
                showToast('Please fill in the goal and deadline', 'error');
                return;
            }
            addGoal(title, description, deadline);
            DOM.goalForm.reset();
        });

        // Background settings
        DOM.bgSettingsBtn.addEventListener('click', () => {
            DOM.userDropdown.classList.remove('open');
            openBgModal();
        });
        DOM.bgModalClose.addEventListener('click', closeBgModal);
        DOM.bgModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.bgModalOverlay) closeBgModal();
        });

        // Upload area click
        DOM.bgUploadArea.addEventListener('click', () => DOM.bgFileInput.click());
        DOM.bgFileInput.addEventListener('change', handleBgFileSelect);

        // Drag and drop
        DOM.bgUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            DOM.bgUploadArea.classList.add('drag-over');
        });
        DOM.bgUploadArea.addEventListener('dragleave', () => {
            DOM.bgUploadArea.classList.remove('drag-over');
        });
        DOM.bgUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            DOM.bgUploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) processImageFile(file);
        });

        // Preset clicks
        DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const bg = btn.dataset.bg;
                applyBackground(bg, 'gradient');
                saveBgSetting(bg, 'gradient');
                updatePresetActiveState(btn);
                showToast('Background updated!', 'success');
            });
        });

        // Reset background
        DOM.bgResetBtn.addEventListener('click', () => {
            resetBackground();
            showToast('Background reset to default', 'info');
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSidebar();
                closeBgModal();
                DOM.userDropdown.classList.remove('open');
            }
        });
    }

    // ============================================================
    // BACKGROUND CUSTOMIZATION
    // ============================================================
    function openBgModal() {
        DOM.bgModalOverlay.classList.add('open');
        syncPresetActiveState();
    }

    function closeBgModal() {
        DOM.bgModalOverlay.classList.remove('open');
    }

    function handleBgFileSelect(e) {
        const file = e.target.files[0];
        if (file) processImageFile(file);
        // Reset so same file can be re-selected
        e.target.value = '';
    }

    function processImageFile(file) {
        // Validate type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        // Validate size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            applyBackground(dataUrl, 'image');
            saveBgSetting(dataUrl, 'image');
            clearPresetActiveState();
            showToast('Background image applied! 🖼️', 'success');
            closeBgModal();
        };
        reader.onerror = () => {
            showToast('Failed to read image file', 'error');
        };
        reader.readAsDataURL(file);
    }

    function applyBackground(value, type) {
        applyBgViaStyle(value, type);
    }

    function applyBgViaStyle(value, type) {
        // Remove or update existing dynamic style
        let styleEl = document.getElementById('custom-bg-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-bg-style';
            document.head.appendChild(styleEl);
        }

        const mainEl = DOM.mainEl;
        mainEl.classList.add('has-custom-bg');

        const bgValue = type === 'image' ? `url(${value})` : value;
        styleEl.textContent = `
            .main.has-custom-bg::before {
                background-image: ${bgValue} !important;
            }
        `;
    }

    function resetBackground() {
        DOM.mainEl.classList.remove('has-custom-bg');
        const styleEl = document.getElementById('custom-bg-style');
        if (styleEl) styleEl.remove();
        removeBgSetting();
        clearPresetActiveState();
        closeBgModal();
    }

    function saveBgSetting(value, type) {
        if (!currentUser) return;
        const key = `noteflow_${currentUser.uid}_bg`;
        // For images, store the data URL (may be large but localStorage supports ~5MB)
        try {
            localStorage.setItem(key, JSON.stringify({ value, type }));
        } catch (e) {
            console.warn('Could not save background to localStorage:', e);
            showToast('Background too large to save. It will reset on reload.', 'error');
        }
    }

    function loadBgSetting() {
        if (!currentUser) return;
        const key = `noteflow_${currentUser.uid}_bg`;
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const { value, type } = JSON.parse(data);
                applyBackground(value, type);
            }
        } catch (e) {
            console.warn('Could not load background setting:', e);
        }
    }

    function removeBgSetting() {
        if (!currentUser) return;
        const key = `noteflow_${currentUser.uid}_bg`;
        localStorage.removeItem(key);
    }

    function updatePresetActiveState(activeBtn) {
        DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    function clearPresetActiveState() {
        DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(b => b.classList.remove('active'));
    }

    function syncPresetActiveState() {
        if (!currentUser) return;
        const key = `noteflow_${currentUser.uid}_bg`;
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const { value, type } = JSON.parse(data);
                if (type === 'gradient') {
                    DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(b => {
                        b.classList.toggle('active', b.dataset.bg === value);
                    });
                } else {
                    clearPresetActiveState();
                }
            } else {
                clearPresetActiveState();
            }
        } catch (e) { /* ignore */ }
    }

    // ===== BOOT =====
    function boot() {
        initEvents();
        console.log('%c✨ NoteFlow Loaded (with Firebase Auth)', 'color: #8B5CF6; font-weight: bold; font-size: 14px;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
