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
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // ===== STATE =====
    let currentUser = null;
    let notes = [];
    let goals = [];
    let dailyTasks = [];
    let currentPage = 'home';
    let timerInterval = null;
    let unsubNotes = null;
    let unsubGoals = null;
    let unsubDailyTasks = null;
    let searchQuery = '';
    let selectedCategoryFilter = 'All';

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
        noteTag: $('#note-tag'),
        noteContent: $('#note-content'),
        noteDate: $('#note-date'),
        notesContainer: $('#notes-container'),
        noteSearchInput: $('#note-search-input'),
        searchClearBtn: $('#search-clear-btn'),
        categoryFilterPills: $('#category-filter-pills'),

        // Edit Note Modal
        editNoteModalOverlay: $('#edit-note-modal-overlay'),
        editNoteModalClose: $('#edit-note-modal-close'),
        editNoteForm: $('#edit-note-form'),
        editNoteId: $('#edit-note-id'),
        editNoteTitle: $('#edit-note-title'),
        editNoteTag: $('#edit-note-tag'),
        editNoteDate: $('#edit-note-date'),
        editNoteContent: $('#edit-note-content'),
        editNoteCancelBtn: $('#edit-note-cancel-btn'),
        editNoteColorPicker: $('#edit-note-color-picker'),

        // Color Picker (create form)
        noteColorPicker: $('#note-color-picker'),

        // Goals
        goalForm: $('#goal-form'),
        goalTitle: $('#goal-title'),
        goalDescription: $('#goal-description'),
        goalDeadline: $('#goal-deadline'),
        goalsContainer: $('#goals-container'),

        // Daily Tasks
        taskForm: $('#task-form'),
        taskText: $('#task-text'),
        taskProgressPct: $('#task-progress-pct'),
        taskProgressBar: $('#task-progress-bar'),
        tasksContainer: $('#tasks-container'),
        homeTasksList: $('#home-tasks-list'),
        homeTasksEmpty: $('#home-tasks-empty'),

        // Background Modal
        bgSettingsBtn: $('#bg-settings-btn'),
        bgModalOverlay: $('#bg-modal-overlay'),
        bgModalClose: $('#bg-modal-close'),
        bgUploadArea: $('#bg-upload-area'),
        bgFileInput: $('#bg-file-input'),
        bgPresetsGrid: $('#bg-presets-grid'),
        bgResetBtn: $('#bg-reset-btn'),

        // Profile Photo
        changeProfilePicBtn: $('#change-profile-pic-btn'),
        profilePicInput: $('#profile-pic-input'),

        // Google Password Modal
        googlePasswordModalOverlay: $('#google-password-modal-overlay'),
        googlePasswordForm: $('#google-password-form'),
        googleSetPassword: $('#google-set-password'),
        googleConfirmPassword: $('#google-confirm-password'),
        googlePasswordSkipBtn: $('#google-password-skip-btn'),

        // Security & Auth Modals
        forgotPasswordLink: $('#forgot-password-link'),
        resetPasswordModalOverlay: $('#reset-password-modal-overlay'),
        resetPasswordModalClose: $('#reset-password-modal-close'),
        resetPasswordForm: $('#reset-password-form'),
        resetEmail: $('#reset-email'),
        resetPasswordCancelBtn: $('#reset-password-cancel-btn'),

        changePasswordBtn: $('#change-password-btn'),
        changePasswordModalOverlay: $('#change-password-modal-overlay'),
        changePasswordModalClose: $('#change-password-modal-close'),
        changePasswordForm: $('#change-password-form'),
        cpOldPassword: $('#cp-old-password'),
        cpNewPassword: $('#cp-new-password'),
        cpConfirmPassword: $('#cp-confirm-password'),
        changePasswordCancelBtn: $('#change-password-cancel-btn'),

        pinLockSettingsBtn: $('#pin-lock-settings-btn'),
        lockAppNowBtn: $('#lock-app-now-btn'),
        pinSettingsModalOverlay: $('#pin-settings-modal-overlay'),
        pinSettingsModalClose: $('#pin-settings-modal-close'),
        pinSettingsForm: $('#pin-settings-form'),
        pinEnableToggle: $('#pin-enable-toggle'),
        pinNew: $('#pin-new'),
        pinConfirm: $('#pin-confirm'),
        pinSettingsCancelBtn: $('#pin-settings-cancel-btn'),

        deleteAccountBtn: $('#delete-account-btn'),
        deleteAccountModalOverlay: $('#delete-account-modal-overlay'),
        deleteAccountModalClose: $('#delete-account-modal-close'),
        deleteAccountForm: $('#delete-account-form'),
        deleteConfirmText: $('#delete-confirm-text'),
        deletePassword: $('#delete-password'),
        deleteAccountCancelBtn: $('#delete-account-cancel-btn'),

        // PIN Lock Screen
        pinLockscreenOverlay: $('#pin-lockscreen-overlay'),
        pinLockAvatar: $('#pin-lock-avatar'),
        pinDots: $$('#pin-dots .pin-dot'),
        pinKeypad: $$('.pin-key'),
        pinKeyClear: $('#pin-key-clear'),
        pinKeyBack: $('#pin-key-back'),
        pinSwitchAccountBtn: $('#pin-switch-account-btn'),

        // Main & Notifications
        mainEl: $('#main'),
        navNotifyBtn: $('#nav-notify-btn'),
        themeToggleBtn: $('#theme-toggle-btn'),

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
            if (DOM.loadingScreen) DOM.loadingScreen.classList.add('hidden');
        }, 600);

        if (user) {
            // Check email verification for password users
            const isGoogleProvider = user.providerData.some(p => p.providerId === 'google.com');
            if (!isGoogleProvider && !user.emailVerified) {
                currentUser = null;
                showAuth();
                stopApp();
                DOM.loginError.innerHTML = 'Email not verified. Please check your inbox or <a href="#" id="resend-verification-link" style="color: var(--accent-secondary); text-decoration: underline;">Resend verification link</a>.';
                
                setTimeout(() => {
                    const resendBtn = document.getElementById('resend-verification-link');
                    if (resendBtn) {
                        resendBtn.onclick = async (e) => {
                            e.preventDefault();
                            try {
                                await user.sendEmailVerification();
                                showToast('Verification email sent! ✉️', 'success');
                            } catch (err) {
                                console.error(err);
                                showToast('Failed to send verification email.', 'error');
                            }
                        };
                    }
                }, 150);
                
                auth.signOut();
                return;
            }

            currentUser = user;
            showApp();
            subscribeToData();
            loadBgSetting();
            loadThemeSetting();
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

    async function updateUserProfile() {
        if (!currentUser) return;

        const name = currentUser.displayName || currentUser.email.split('@')[0];
        const email = currentUser.email;
        let photoURL = currentUser.photoURL;

        try {
            const profileDoc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('profile').get();
            if (profileDoc.exists && profileDoc.data().photoURL) {
                photoURL = profileDoc.data().photoURL;
            }
        } catch (e) {
            console.warn('Could not load profile photo from Firestore:', e);
        }

        // LocalStorage fallback if Firestore did not yield a valid Base64 image
        if (!photoURL || photoURL === 'custom') {
            const localPic = localStorage.getItem(`noteflow_${currentUser.uid}_profile_pic`);
            if (localPic) {
                photoURL = localPic;
            }
        }

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
            // Send email verification
            await cred.user.sendEmailVerification();
            // Sign out until they verify
            await auth.signOut();
            
            showToast('Account created! A verification email has been sent. Please check your inbox! ✉️', 'success');
            switchAuthTab('login');
            DOM.loginError.innerHTML = 'Verification email sent. Please verify your email before logging in.';
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
            const cred = await auth.signInWithEmailAndPassword(email, password);
            if (!cred.user.emailVerified) {
                // Trigger authStateChanged logic by leaving user unverified.
                // The observer will log them out and show resend link.
                setButtonLoading(DOM.loginSubmitBtn, false);
                return;
            }
            showToast('Welcome back! 👋', 'success');
        } catch (error) {
            DOM.loginError.textContent = getAuthErrorMessage(error.code);
            setButtonLoading(DOM.loginSubmitBtn, false);
        }
    }

    // --- Google Sign-In ---
    let pendingGoogleUser = null;

    async function handleGoogleSignIn() {
        DOM.loginError.textContent = '';
        DOM.signupError.textContent = '';
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const isNewUser = result.additionalUserInfo.isNewUser;
            if (isNewUser) {
                pendingGoogleUser = result.user;
                DOM.googlePasswordModalOverlay.classList.add('open');
            } else {
                showToast('Signed in with Google! 🚀', 'success');
            }
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                showToast(getAuthErrorMessage(error.code), 'error');
            }
        }
    }

    // --- Sign Out ---
    async function handleSignOut() {
        try {
            DOM.userDropdown.classList.remove('open');
            unsubscribeFromData();
            await auth.signOut();
            showToast('Signed out successfully', 'info');
        } catch (error) {
            console.error('Sign out error:', error);
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
    // FIRESTORE DATA LAYER
    // ============================================================
    function getUserCollection(collectionName) {
        if (!currentUser) return null;
        return db.collection('users').doc(currentUser.uid).collection(collectionName);
    }

    function subscribeToData() {
        if (!currentUser) return;

        // Unsubscribe existing listeners
        if (unsubNotes) unsubNotes();
        if (unsubGoals) unsubGoals();
        if (unsubDailyTasks) unsubDailyTasks();

        // Real-time listener for Notes
        unsubNotes = getUserCollection('notes')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderNotes();
                renderHome();
            }, (error) => {
                console.error('Notes listener error:', error);
                showToast('Failed to load notes', 'error');
            });

        // Real-time listener for Goals
        unsubGoals = getUserCollection('goals')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderGoals();
                renderSidebar();
                renderHome();
            }, (error) => {
                console.error('Goals listener error:', error);
                showToast('Failed to load goals', 'error');
            });

        // Real-time listener for Daily Tasks
        unsubDailyTasks = getUserCollection('dailyTasks')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                dailyTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderDailyTasks();
                renderHome();
            }, (error) => {
                console.error('Daily tasks listener error:', error);
                showToast('Failed to load daily tasks', 'error');
            });
    }

    function unsubscribeFromData() {
        if (unsubNotes) { unsubNotes(); unsubNotes = null; }
        if (unsubGoals) { unsubGoals(); unsubGoals = null; }
        if (unsubDailyTasks) { unsubDailyTasks(); unsubDailyTasks = null; }
    }

    // ============================================================
    // MARKDOWN PARSER & UTILITIES
    // ============================================================
    function parseMarkdown(text) {
        if (!text) return '';
        let escaped = escapeHtml(text);

        // Headings (#, ##, ###)
        escaped = escaped.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        escaped = escaped.replace(/^## (.*$)/gim, '<h2>$2</h2>');
        escaped = escaped.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold (**text** or __text__)
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic (*text* or _text_)
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
        escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');

        // Inline Code (`code`)
        escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');

        // Unordered lists (- item or * item)
        escaped = escaped.replace(/^\s*[\-\*]\s+(.*$)/gim, '<ul><li>$1</li></ul>');
        escaped = escaped.replace(/<\/ul>\s*<ul>/g, '');

        // Line breaks
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    }

    // ============================================================
    // COLOR PICKER HELPERS
    // ============================================================
    function initColorSwatchListeners(container) {
        if (!container) return;
        container.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            });
        });
    }

    function getSelectedColor(container) {
        if (!container) return '';
        const active = container.querySelector('.color-swatch.active');
        return active ? (active.dataset.color || '') : '';
    }

    function setActiveColorSwatch(container, color) {
        if (!container) return;
        container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        const target = container.querySelector(`.color-swatch[data-color="${color}"]`);
        if (target) {
            target.classList.add('active');
        } else {
            // Default swatch (first one, empty color)
            const def = container.querySelector('.color-swatch[data-color=""]');
            if (def) def.classList.add('active');
        }
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function resizeProfileImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const max_size = 128;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                callback(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
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
        else if (page === 'daily-tasks') renderDailyTasks();

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

        if (DOM.statNotes) DOM.statNotes.textContent = notes.length;
        const activeGoals = goals.filter(g => !g.completed);
        const completedGoals = goals.filter(g => g.completed);
        if (DOM.statActive) DOM.statActive.textContent = activeGoals.length;
        if (DOM.statCompleted) DOM.statCompleted.textContent = completedGoals.length;

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

        // Daily tasks summary widget on Home
        DOM.homeTasksList.querySelectorAll('.home-task-item').forEach(el => el.remove());
        if (dailyTasks.length === 0) {
            DOM.homeTasksEmpty.style.display = 'block';
        } else {
            DOM.homeTasksEmpty.style.display = 'none';
            let html = '';
            dailyTasks.forEach((task) => {
                const today = getTodayStr();
                const isCompleted = task.completed && task.lastCompletedDate === today;
                
                html += `
                    <div class="home-task-item ${isCompleted ? 'completed' : ''}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${isCompleted ? 'var(--success)' : 'var(--text-tertiary)'}" stroke-width="2.5">
                            ${isCompleted ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/>'}
                        </svg>
                        <span class="home-task-text">${escapeHtml(task.text)}</span>
                    </div>
                `;
            });
            DOM.homeTasksList.insertAdjacentHTML('afterbegin', html);
        }
    }

    // ============================================================
    // RENDER NOTES
    // ============================================================
    function renderSingleNoteCard(note, gi, ni) {
        const timeStr = new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const tag = note.tag || 'General';
        const tagClass = `tag-${tag.toLowerCase()}`;
        const noteColor = note.color || '';
        const colorClass = noteColor ? 'has-color' : '';
        const colorStyle = noteColor ? `style="--note-accent-color: ${noteColor}; animation-delay: ${(gi * 0.1) + (ni * 0.05)}s"` : `style="animation-delay: ${(gi * 0.1) + (ni * 0.05)}s"`;
        const isPinned = note.pinned || false;

        return `
            <div class="note-card ${colorClass}" ${colorStyle} data-note-id="${note.id}">
                <div class="note-card-header">
                    <div class="note-card-title">
                        <span>${escapeHtml(note.title)}</span>
                        <span class="tag-badge ${tagClass}">${escapeHtml(tag)}</span>
                    </div>
                    <div class="note-card-actions">
                        <button class="btn-icon ${isPinned ? 'active' : ''}" onclick="window.NoteFlow.togglePinNote('${note.id}')" aria-label="${isPinned ? 'Unpin note' : 'Pin note'}" title="${isPinned ? 'Unpin note' : 'Pin note'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.48A2 2 0 0 1 15 9.28V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4.28a2 2 0 0 1-.78 1.24l-2.78 3.48A2 2 0 0 0 5 15.24z"/></svg>
                        </button>
                        <button class="btn-icon" onclick="window.NoteFlow.editNote('${note.id}')" aria-label="Edit note" title="Edit note">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="window.NoteFlow.deleteNote('${note.id}')" aria-label="Delete note" title="Delete note">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
                ${note.content ? `<div class="note-card-content">${parseMarkdown(note.content)}</div>` : ''}
                <div class="note-card-footer">
                    <span class="note-card-time">Added at ${timeStr}</span>
                </div>
            </div>
        `;
    }

    function renderNotes() {
        const filteredNotes = notes.filter(note => {
            const tag = note.tag || 'General';
            const matchesCategory = (selectedCategoryFilter === 'All') || (tag === selectedCategoryFilter);

            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                note.title.toLowerCase().includes(q) ||
                (note.content && note.content.toLowerCase().includes(q)) ||
                tag.toLowerCase().includes(q);

            return matchesCategory && matchesSearch;
        });

        if (filteredNotes.length === 0) {
            const isFiltering = searchQuery || selectedCategoryFilter !== 'All';
            DOM.notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p>${isFiltering ? 'No matching notes found' : 'No notes yet'}</p>
                    <span>${isFiltering ? 'Try clearing your search query or filter' : 'Add your first note above to get started'}</span>
                </div>
            `;
            return;
        }

        const pinned = filteredNotes.filter(n => n.pinned);
        const unpinned = filteredNotes.filter(n => !n.pinned);

        let html = '';

        // Render Pinned Notes first
        if (pinned.length > 0) {
            html += `
                <div class="pinned-section" style="width: 100%;">
                    <div class="pinned-section-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.48A2 2 0 0 1 15 9.28V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4.28a2 2 0 0 1-.78 1.24l-2.78 3.48A2 2 0 0 0 5 15.24z"/></svg>
                        <span>Pinned Notes (${pinned.length})</span>
                    </div>
                    <div class="notes-list" style="margin-bottom: 28px;">
            `;
            pinned.forEach((note, ni) => {
                html += renderSingleNoteCard(note, 0, ni);
            });
            html += `</div></div>`;
        }

        if (unpinned.length > 0) {
            const grouped = {};
            unpinned.forEach(note => {
                if (!grouped[note.date]) grouped[note.date] = [];
                grouped[note.date].push(note);
            });

            const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
            sortedDates.forEach(date => grouped[date].sort((a, b) => b.createdAt - a.createdAt));

            sortedDates.forEach((date, gi) => {
                const label = formatDate(date);
                const count = grouped[date].length;

                html += `<div class="date-group" style="animation-delay: ${gi * 0.1}s; width: 100%;">
                    <div class="date-group-header">
                        <span class="date-group-label">${escapeHtml(label)}</span>
                        <div class="date-group-line"></div>
                        <span class="date-group-count">${count} note${count > 1 ? 's' : ''}</span>
                    </div>
                    <div class="notes-list">`;

                grouped[date].forEach((note, ni) => {
                    html += renderSingleNoteCard(note, gi, ni);
                });

                html += `</div></div>`;
            });
        }

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

        const pinnedActive = goals.filter(g => g.pinned && !g.completed);
        const unpinnedActive = goals.filter(g => !g.pinned && !g.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        const completed = goals.filter(g => g.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
        const sorted = [...pinnedActive, ...unpinnedActive, ...completed];

        let html = '';
        sorted.forEach((goal, i) => {
            const cd = goal.completed ? { text: 'Completed', status: 'completed' } : getCountdown(goal.deadline);
            const isPinned = goal.pinned && !goal.completed;

            html += `
                <div class="goal-card ${goal.completed ? 'completed' : ''} ${isPinned ? 'pinned' : ''}" style="animation-delay: ${i * 0.06}s" data-goal-id="${goal.id}">
                    <div class="goal-status-dot ${cd.status}" data-dot-goal="${goal.id}"></div>
                    <div class="goal-info">
                        <div class="goal-title">
                            ${isPinned ? '<span style="color: var(--warning); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">⭐ Daily Focus Goal</span>' : ''}
                            ${escapeHtml(goal.title)}
                        </div>
                        ${goal.description ? `<div class="goal-desc">${escapeHtml(goal.description)}</div>` : ''}
                        <div class="goal-deadline-text">${formatDeadline(goal.deadline)}</div>
                    </div>
                    <div class="goal-timer-badge ${cd.status}" data-timer-goal="${goal.id}">${cd.text}</div>
                    <div class="goal-actions">
                        ${!goal.completed ? `
                            <button class="btn-icon btn-pin-goal ${goal.pinned ? 'active' : ''}" onclick="window.NoteFlow.togglePinGoal('${goal.id}')" aria-label="${goal.pinned ? 'Unfocus goal' : 'Focus goal'}" title="${goal.pinned ? 'Unfocus goal' : 'Set as focus goal'}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="${goal.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
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
    // CRUD: NOTES (Firestore)
    // ============================================================
    async function addNote(title, content, date, tag, color) {
        try {
            await getUserCollection('notes').add({
                title, content, date, tag: tag || 'General', color: color || '', createdAt: Date.now()
            });
            showToast('Note added successfully!', 'success');
        } catch (error) {
            console.error('Error adding note:', error);
            showToast('Failed to add note', 'error');
        }
    }

    async function updateNote(id, title, content, date, tag, color) {
        try {
            await getUserCollection('notes').doc(id).update({
                title, content, date, tag: tag || 'General', color: color || '', updatedAt: Date.now()
            });
            showToast('Note updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating note:', error);
            showToast('Failed to update note', 'error');
        }
    }

    function editNote(id) {
        openEditNoteModal(id);
    }

    function openEditNoteModal(id) {
        const note = notes.find(n => n.id === id);
        if (!note) return;

        DOM.editNoteId.value = note.id;
        DOM.editNoteTitle.value = note.title;
        DOM.editNoteTag.value = note.tag || 'General';
        DOM.editNoteDate.value = note.date;
        DOM.editNoteContent.value = note.content || '';

        // Set color swatch
        setActiveColorSwatch(DOM.editNoteColorPicker, note.color || '');

        DOM.editNoteModalOverlay.classList.add('open');
    }

    function closeEditNoteModal() {
        DOM.editNoteModalOverlay.classList.remove('open');
    }

    async function deleteNote(id) {
        const card = document.querySelector(`[data-note-id="${id}"]`);
        if (card) card.style.animation = 'cardRemove 0.35s ease forwards';

        try {
            await getUserCollection('notes').doc(id).delete();
            showToast('Note deleted', 'info');
        } catch (error) {
            console.error('Error deleting note:', error);
            showToast('Failed to delete note', 'error');
        }
    }

    // ============================================================
    // CRUD: GOALS (Firestore)
    // ============================================================
    async function addGoal(title, description, deadline) {
        try {
            await getUserCollection('goals').add({
                title, description, deadline,
                completed: false, createdAt: Date.now(), completedAt: null
            });
            showToast('Goal created! Stay focused 💪', 'success');
        } catch (error) {
            console.error('Error adding goal:', error);
            showToast('Failed to add goal', 'error');
        }
    }

    async function completeGoal(id) {
        try {
            await getUserCollection('goals').doc(id).update({
                completed: true, completedAt: Date.now()
            });
            showToast('Goal completed! 🎉', 'success');
        } catch (error) {
            console.error('Error completing goal:', error);
            showToast('Failed to complete goal', 'error');
        }
    }

    async function deleteGoal(id) {
        const card = document.querySelector(`[data-goal-id="${id}"]`);
        if (card) card.style.animation = 'cardRemove 0.35s ease forwards';

        try {
            await getUserCollection('goals').doc(id).delete();
            showToast('Goal removed', 'info');
        } catch (error) {
            console.error('Error deleting goal:', error);
            showToast('Failed to delete goal', 'error');
        }
    }

    async function togglePinNote(id) {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        try {
            await getUserCollection('notes').doc(id).update({
                pinned: !note.pinned
            });
        } catch (e) {
            console.error('Error toggling pin:', e);
            showToast('Failed to pin note', 'error');
        }
    }

    async function togglePinGoal(id) {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        
        const isCurrentlyPinned = goal.pinned || false;
        
        try {
            if (!isCurrentlyPinned) {
                // We are pinning this goal. Unpin all other goals first to maintain "Max 1"!
                const batch = db.batch();
                const pinnedGoals = goals.filter(g => g.pinned && g.id !== id);
                
                pinnedGoals.forEach(pg => {
                    const ref = getUserCollection('goals').doc(pg.id);
                    batch.update(ref, { pinned: false });
                });
                
                const selfRef = getUserCollection('goals').doc(id);
                batch.update(selfRef, { pinned: true });
                
                await batch.commit();
                showToast('Focus goal set! ⭐', 'success');
            } else {
                // Just unpin it
                await getUserCollection('goals').doc(id).update({ pinned: false });
                showToast('Focus goal removed', 'info');
            }
        } catch (e) {
            console.error('Error toggling focus goal:', e);
            showToast('Failed to set focus goal', 'error');
        }
    }

    // ============================================================
    // CRUD: DAILY TASKS (Firestore with daily reset logic)
    // ============================================================
    async function addDailyTask(text) {
        try {
            await getUserCollection('dailyTasks').add({
                text,
                completed: false,
                lastCompletedDate: '',
                createdAt: Date.now()
            });
            showToast('Daily task added!', 'success');
        } catch (error) {
            console.error('Error adding daily task:', error);
            showToast('Failed to add daily task', 'error');
        }
    }

    async function deleteDailyTask(id) {
        const card = document.querySelector(`[data-task-id="${id}"]`);
        if (card) card.style.animation = 'cardRemove 0.35s ease forwards';
        try {
            await getUserCollection('dailyTasks').doc(id).delete();
            showToast('Daily task removed', 'info');
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Failed to delete task', 'error');
        }
    }

    async function toggleDailyTask(id) {
        const task = dailyTasks.find(t => t.id === id);
        if (!task) return;

        const today = getTodayStr();
        const wasCompleted = task.completed && task.lastCompletedDate === today;
        
        try {
            await getUserCollection('dailyTasks').doc(id).update({
                completed: !wasCompleted,
                lastCompletedDate: !wasCompleted ? today : ''
            });
        } catch (error) {
            console.error('Error toggling task:', error);
            showToast('Failed to update task', 'error');
        }
    }

    function renderDailyTasks() {
        if (dailyTasks.length === 0) {
            DOM.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <p>No daily tasks yet</p>
                    <span>Add habits or recurring tasks to track your daily progress</span>
                </div>
            `;
            DOM.taskProgressPct.textContent = '0%';
            DOM.taskProgressBar.style.width = '0%';
            return;
        }

        const today = getTodayStr();
        let completedCount = 0;
        let html = '';

        // Sort: active first, completed second
        const sortedTasks = [...dailyTasks].sort((a, b) => {
            const aComp = a.completed && a.lastCompletedDate === today;
            const bComp = b.completed && b.lastCompletedDate === today;
            if (aComp === bComp) return b.createdAt - a.createdAt;
            return aComp ? 1 : -1;
        });

        sortedTasks.forEach((task, i) => {
            const isCompleted = task.completed && task.lastCompletedDate === today;
            if (isCompleted) completedCount++;

            html += `
                <div class="task-card ${isCompleted ? 'completed' : ''}" style="animation-delay: ${i * 0.05}s" data-task-id="${task.id}">
                    <div class="task-left">
                        <button class="task-checkbox-btn" onclick="window.NoteFlow.toggleDailyTask('${task.id}')" aria-label="Toggle task">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <span class="task-text">${escapeHtml(task.text)}</span>
                    </div>
                    <button class="btn-icon btn-icon-danger" onclick="window.NoteFlow.deleteDailyTask('${task.id}')" aria-label="Delete task" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;
        });

        DOM.tasksContainer.innerHTML = html;

        // Update progress bar
        const pct = Math.round((completedCount / dailyTasks.length) * 100);
        DOM.taskProgressPct.textContent = `${pct}%`;
        DOM.taskProgressBar.style.width = `${pct}%`;
    }

    // ===== EXPOSE PUBLIC API =====
    window.NoteFlow = { 
        deleteNote, 
        editNote, 
        deleteGoal, 
        completeGoal, 
        togglePinNote, 
        togglePinGoal, 
        toggleDailyTask, 
        deleteDailyTask 
    };

    // ============================================================
    // SECURITY & AUTH UPGRADES
    // ============================================================

    // --- 1. Forgot Password via Email ---
    async function handleResetPassword(e) {
        e.preventDefault();
        const email = DOM.resetEmail.value.trim();
        if (!email) return;
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Password reset email sent! Please check your inbox ✉️', 'success');
            DOM.resetPasswordModalOverlay.classList.remove('open');
            DOM.resetPasswordForm.reset();
        } catch (error) {
            console.error('Password reset error:', error);
            showToast(getAuthErrorMessage(error.code), 'error');
        }
    }

    // --- 2. Change Password inside Profile ---
    async function handleChangePassword(e) {
        e.preventDefault();
        if (!currentUser) return;

        const oldPass = DOM.cpOldPassword.value;
        const newPass = DOM.cpNewPassword.value;
        const confirmPass = DOM.cpConfirmPassword.value;

        if (newPass.length < 6) {
            showToast('New password must be at least 6 characters.', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        try {
            const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPass);
            await currentUser.reauthenticateWithCredential(cred);
            await currentUser.updatePassword(newPass);
            showToast('Password updated successfully! 🔒', 'success');
            DOM.changePasswordModalOverlay.classList.remove('open');
            DOM.changePasswordForm.reset();
        } catch (error) {
            console.error('Change password error:', error);
            showToast('Failed to update password. Check your current password.', 'error');
        }
    }

    // --- 3. 4-Digit Security PIN & Auto-Lock ---
    let isPinEnabled = false;
    let userPin = '';
    let enteredPin = '';
    let lastActivityTime = Date.now();
    let inactivityInterval = null;

    function updatePinDots() {
        if (!DOM.pinDots) return;
        DOM.pinDots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < enteredPin.length);
            dot.classList.remove('error');
        });
    }

    function showPinLockscreen() {
        if (!isPinEnabled || !userPin) return;

        const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
        const initial = name.charAt(0).toUpperCase();

        let photoURL = currentUser?.photoURL;
        if (!photoURL || photoURL === 'custom') {
            const localPic = localStorage.getItem(`noteflow_${currentUser?.uid}_profile_pic`);
            if (localPic) photoURL = localPic;
        }

        if (photoURL && photoURL !== 'custom') {
            DOM.pinLockAvatar.innerHTML = `<img src="${photoURL}" alt="${name}">`;
        } else {
            DOM.pinLockAvatar.textContent = initial;
        }

        enteredPin = '';
        updatePinDots();
        DOM.pinLockscreenOverlay.style.display = 'flex';
    }

    function hidePinLockscreen() {
        DOM.pinLockscreenOverlay.style.display = 'none';
        enteredPin = '';
        lastActivityTime = Date.now();
    }

    function handlePinKey(key) {
        if (enteredPin.length < 4) {
            enteredPin += key;
            updatePinDots();
            if (enteredPin.length === 4) {
                verifyPin();
            }
        }
    }

    function verifyPin() {
        if (enteredPin === userPin) {
            hidePinLockscreen();
            showToast('App Unlocked 🔓', 'success');
        } else {
            DOM.pinDots.forEach(dot => dot.classList.add('error'));
            const card = document.querySelector('.pin-lockscreen-card');
            if (card) {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 400);
            }
            showToast('Incorrect PIN. Please try again.', 'error');
            setTimeout(() => {
                enteredPin = '';
                updatePinDots();
            }, 500);
        }
    }

    function lockAppNow() {
        if (!isPinEnabled || !userPin) {
            showToast('Please set and enable a 4-digit PIN first.', 'error');
            if (DOM.pinEnableToggle) DOM.pinEnableToggle.checked = true;
            if (DOM.pinSettingsModalOverlay) DOM.pinSettingsModalOverlay.classList.add('open');
            return;
        }
        showPinLockscreen();
        showToast('App Locked 🔒', 'info');
    }

    async function savePinSettings(e) {
        e.preventDefault();
        if (!currentUser) return;

        const enabled = DOM.pinEnableToggle.checked;
        const newPin = DOM.pinNew.value.trim();
        const confirmPin = DOM.pinConfirm.value.trim();

        if (enabled) {
            if (newPin) {
                if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
                    showToast('PIN must be exactly 4 digits.', 'error');
                    return;
                }
                if (newPin !== confirmPin) {
                    showToast('PINs do not match.', 'error');
                    return;
                }
                userPin = newPin;
            } else if (!userPin) {
                showToast('Please enter a 4-digit numeric PIN.', 'error');
                return;
            }
        }

        isPinEnabled = enabled;

        try {
            const pinData = { enabled: isPinEnabled, pin: userPin };
            localStorage.setItem(`noteflow_${currentUser.uid}_pin`, JSON.stringify(pinData));
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('pin').set(pinData);
            showToast(isPinEnabled ? 'Security PIN Lock enabled! 🔒' : 'PIN Lock disabled.', 'success');
            DOM.pinSettingsModalOverlay.classList.remove('open');
            DOM.pinSettingsForm.reset();
        } catch (error) {
            console.error('Save PIN error:', error);
            showToast('Failed to save PIN settings.', 'error');
        }
    }

    async function loadPinSettings() {
        if (!currentUser) return;
        try {
            const local = localStorage.getItem(`noteflow_${currentUser.uid}_pin`);
            if (local) {
                const data = JSON.parse(local);
                isPinEnabled = data.enabled || false;
                userPin = data.pin || '';
            }
            const doc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('pin').get();
            if (doc.exists) {
                const data = doc.data();
                isPinEnabled = data.enabled || false;
                userPin = data.pin || '';
            }
            if (isPinEnabled && userPin) {
                showPinLockscreen();
            }
        } catch (e) {
            console.warn('Could not load PIN settings:', e);
        }
    }

    function initInactivityMonitor() {
        const resetTimer = () => { lastActivityTime = Date.now(); };
        ['mousemove', 'keydown', 'touchstart', 'click'].forEach(evt => {
            window.addEventListener(evt, resetTimer, { passive: true });
        });

        if (inactivityInterval) clearInterval(inactivityInterval);
        inactivityInterval = setInterval(() => {
            if (currentUser && isPinEnabled && userPin && DOM.pinLockscreenOverlay.style.display === 'none') {
                // 10 minutes = 600,000 ms
                if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
                    showPinLockscreen();
                }
            }
        }, 10000);
    }

    // --- 4. Delete Account & Wipe Data ---
    async function handleDeleteAccount(e) {
        e.preventDefault();
        if (!currentUser) return;

        const confirmText = DOM.deleteConfirmText.value.trim();
        const password = DOM.deletePassword.value;

        if (confirmText !== 'DELETE') {
            showToast('Please type DELETE to confirm.', 'error');
            return;
        }

        try {
            const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(cred);

            showToast('Wiping cloud data...', 'info');

            const collections = ['notes', 'goals', 'dailyTasks', 'settings'];
            for (const colName of collections) {
                const snap = await getUserCollection(colName).get();
                const batch = db.batch();
                snap.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }

            await db.collection('users').doc(currentUser.uid).delete();
            localStorage.clear();

            const userToDelete = currentUser;
            stopApp();
            await userToDelete.delete();

            showToast('Account and all data permanently deleted.', 'info');
            DOM.deleteAccountModalOverlay.classList.remove('open');
            DOM.deleteAccountForm.reset();
        } catch (error) {
            console.error('Delete account error:', error);
            showToast('Failed to delete account. Check your password.', 'error');
        }
    }

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
        initNotifications();

        // Start timer & notification checker
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            updateTimers();
            updateClock();
            checkGoalNotifications();
        }, 1000);
    }

    function stopApp() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        unsubscribeFromData();
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
            const tag = DOM.noteTag.value;
            const content = DOM.noteContent.value.trim();
            const date = DOM.noteDate.value;

            if (!title || !date) {
                showToast('Please fill in the title and date', 'error');
                return;
            }
            addNote(title, content, date, tag, getSelectedColor(DOM.noteColorPicker));
            DOM.noteForm.reset();
            DOM.noteDate.value = getTodayStr();
            setActiveColorSwatch(DOM.noteColorPicker, '');
        });

        // Edit Note Modal & Form
        DOM.editNoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = DOM.editNoteId.value;
            const title = DOM.editNoteTitle.value.trim();
            const tag = DOM.editNoteTag.value;
            const date = DOM.editNoteDate.value;
            const content = DOM.editNoteContent.value.trim();

            if (!title || !date) {
                showToast('Please fill in the title and date', 'error');
                return;
            }

            await updateNote(id, title, content, date, tag, getSelectedColor(DOM.editNoteColorPicker));
            closeEditNoteModal();
        });
        DOM.editNoteModalClose.addEventListener('click', closeEditNoteModal);
        DOM.editNoteCancelBtn.addEventListener('click', closeEditNoteModal);
        DOM.editNoteModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.editNoteModalOverlay) closeEditNoteModal();
        });

        // Search Input
        DOM.noteSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            DOM.searchClearBtn.style.display = searchQuery ? 'block' : 'none';
            renderNotes();
        });
        DOM.searchClearBtn.addEventListener('click', () => {
            DOM.noteSearchInput.value = '';
            searchQuery = '';
            DOM.searchClearBtn.style.display = 'none';
            renderNotes();
        });

        // Category Filter Pills
        DOM.categoryFilterPills.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.categoryFilterPills.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCategoryFilter = btn.dataset.category;
                renderNotes();
            });
        });

        // Notification Button
        DOM.navNotifyBtn.addEventListener('click', requestNotificationPermission);

        // Theme Toggle Button
        if (DOM.themeToggleBtn) {
            DOM.themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Google Password Modal Submit
        DOM.googlePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!pendingGoogleUser) return;
            const password = DOM.googleSetPassword.value;
            const confirm = DOM.googleConfirmPassword.value;

            if (password.length < 6) {
                showToast('Password must be at least 6 characters.', 'error');
                return;
            }
            if (password !== confirm) {
                showToast('Passwords do not match.', 'error');
                return;
            }

            try {
                const credential = firebase.auth.EmailAuthProvider.credential(pendingGoogleUser.email, password);
                await pendingGoogleUser.linkWithCredential(credential);
                showToast('Password set successfully! 🔒 You can now log in using Google or email/password.', 'success');
                DOM.googlePasswordModalOverlay.classList.remove('open');
                DOM.googlePasswordForm.reset();
                pendingGoogleUser = null;
            } catch (err) {
                console.error(err);
                showToast(`Failed to set password: ${err.message}`, 'error');
            }
        });

        // Google Password Modal Skip
        DOM.googlePasswordSkipBtn.addEventListener('click', () => {
            DOM.googlePasswordModalOverlay.classList.remove('open');
            DOM.googlePasswordForm.reset();
            pendingGoogleUser = null;
            showToast('Password set skipped. You can set it later if needed.', 'info');
        });

        // Change Profile Picture click
        DOM.changeProfilePicBtn.addEventListener('click', () => {
            DOM.userDropdown.classList.remove('open');
            DOM.profilePicInput.click();
        });

        // Profile Picture select
        DOM.profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showToast('Please select an image file', 'error');
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Profile picture must be smaller than 2MB', 'error');
                    return;
                }
                
                resizeProfileImage(file, async (dataUrl) => {
                    try {
                        // Save in localStorage immediately so it works on this device
                        // even if Firestore is unreachable/unconfigured
                        localStorage.setItem(`noteflow_${currentUser.uid}_profile_pic`, dataUrl);
                        
                        // Try to store the Base64 image in Firestore for cross-device sync
                        try {
                            await db.collection('users').doc(currentUser.uid)
                                .collection('settings').doc('profile')
                                .set({ photoURL: dataUrl });
                        } catch (firestoreErr) {
                            console.warn('Firestore profile sync failed, relying on localStorage:', firestoreErr);
                        }
                        
                        try {
                            // Save a placeholder to Auth profile so we know a custom photo exists
                            await currentUser.updateProfile({ photoURL: 'custom' });
                        } catch (authErr) {
                            console.warn('Auth profile photoURL update failed:', authErr);
                        }
                        
                        updateUserProfile();
                        showToast('Profile picture updated! 👤', 'success');
                    } catch (err) {
                        console.error(err);
                        showToast('Failed to update profile picture.', 'error');
                    }
                });
            }
            e.target.value = ''; // Reset
        });

        // Color Swatch Pickers
        initColorSwatchListeners(DOM.noteColorPicker);
        initColorSwatchListeners(DOM.editNoteColorPicker);

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

        // Task form
        DOM.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = DOM.taskText.value.trim();
            if (!text) return;
            addDailyTask(text);
            DOM.taskForm.reset();
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
                closeBgModal();
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
                closeEditNoteModal();
                DOM.userDropdown.classList.remove('open');
                if (DOM.resetPasswordModalOverlay) DOM.resetPasswordModalOverlay.classList.remove('open');
                if (DOM.changePasswordModalOverlay) DOM.changePasswordModalOverlay.classList.remove('open');
                if (DOM.pinSettingsModalOverlay) DOM.pinSettingsModalOverlay.classList.remove('open');
                if (DOM.deleteAccountModalOverlay) DOM.deleteAccountModalOverlay.classList.remove('open');
            }
        });

        // --- Security Event Listeners ---
        if (DOM.forgotPasswordLink) {
            DOM.forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                DOM.resetPasswordModalOverlay.classList.add('open');
            });
        }
        if (DOM.resetPasswordForm) DOM.resetPasswordForm.addEventListener('submit', handleResetPassword);
        if (DOM.resetPasswordModalClose) DOM.resetPasswordModalClose.addEventListener('click', () => DOM.resetPasswordModalOverlay.classList.remove('open'));
        if (DOM.resetPasswordCancelBtn) DOM.resetPasswordCancelBtn.addEventListener('click', () => DOM.resetPasswordModalOverlay.classList.remove('open'));

        if (DOM.changePasswordBtn) {
            DOM.changePasswordBtn.addEventListener('click', () => {
                DOM.userDropdown.classList.remove('open');
                DOM.changePasswordModalOverlay.classList.add('open');
            });
        }
        if (DOM.changePasswordForm) DOM.changePasswordForm.addEventListener('submit', handleChangePassword);
        if (DOM.changePasswordModalClose) DOM.changePasswordModalClose.addEventListener('click', () => DOM.changePasswordModalOverlay.classList.remove('open'));
        if (DOM.changePasswordCancelBtn) DOM.changePasswordCancelBtn.addEventListener('click', () => DOM.changePasswordModalOverlay.classList.remove('open'));

        if (DOM.pinLockSettingsBtn) {
            DOM.pinLockSettingsBtn.addEventListener('click', () => {
                DOM.userDropdown.classList.remove('open');
                DOM.pinEnableToggle.checked = isPinEnabled;
                DOM.pinSettingsModalOverlay.classList.add('open');
            });
        }
        if (DOM.lockAppNowBtn) {
            DOM.lockAppNowBtn.addEventListener('click', () => {
                DOM.userDropdown.classList.remove('open');
                lockAppNow();
            });
        }
        if (DOM.pinSettingsForm) DOM.pinSettingsForm.addEventListener('submit', savePinSettings);
        if (DOM.pinSettingsModalClose) DOM.pinSettingsModalClose.addEventListener('click', () => DOM.pinSettingsModalOverlay.classList.remove('open'));
        if (DOM.pinSettingsCancelBtn) DOM.pinSettingsCancelBtn.addEventListener('click', () => DOM.pinSettingsModalOverlay.classList.remove('open'));

        if (DOM.pinKeypad) {
            DOM.pinKeypad.forEach(keyBtn => {
                keyBtn.addEventListener('click', () => {
                    const key = keyBtn.dataset.key;
                    if (key !== undefined) handlePinKey(key);
                });
            });
        }
        if (DOM.pinKeyClear) DOM.pinKeyClear.addEventListener('click', () => { enteredPin = ''; updatePinDots(); });
        if (DOM.pinKeyBack) DOM.pinKeyBack.addEventListener('click', () => { if (enteredPin.length > 0) { enteredPin = enteredPin.slice(0, -1); updatePinDots(); } });
        if (DOM.pinSwitchAccountBtn) DOM.pinSwitchAccountBtn.addEventListener('click', () => { hidePinLockscreen(); handleSignOut(); });

        // Physical Keyboard listener for PIN lock screen
        window.addEventListener('keydown', (e) => {
            if (DOM.pinLockscreenOverlay && DOM.pinLockscreenOverlay.style.display === 'flex') {
                if (/^[0-9]$/.test(e.key)) {
                    handlePinKey(e.key);
                } else if (e.key === 'Backspace') {
                    if (enteredPin.length > 0) {
                        enteredPin = enteredPin.slice(0, -1);
                        updatePinDots();
                    }
                } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
                    enteredPin = '';
                    updatePinDots();
                }
            }
        });

        if (DOM.deleteAccountBtn) {
            DOM.deleteAccountBtn.addEventListener('click', () => {
                DOM.userDropdown.classList.remove('open');
                DOM.deleteAccountModalOverlay.classList.add('open');
            });
        }
        if (DOM.deleteAccountForm) DOM.deleteAccountForm.addEventListener('submit', handleDeleteAccount);
        if (DOM.deleteAccountModalClose) DOM.deleteAccountModalClose.addEventListener('click', () => DOM.deleteAccountModalOverlay.classList.remove('open'));
        if (DOM.deleteAccountCancelBtn) DOM.deleteAccountCancelBtn.addEventListener('click', () => DOM.deleteAccountModalOverlay.classList.remove('open'));
    }

    // ============================================================
    // BROWSER NOTIFICATIONS INTEGRATION
    // ============================================================
    function initNotifications() {
        if (!("Notification" in window)) {
            if (DOM.navNotifyBtn) DOM.navNotifyBtn.style.display = 'none';
            return;
        }

        if (Notification.permission === "granted" && DOM.navNotifyBtn) {
            DOM.navNotifyBtn.classList.add('enabled');
            DOM.navNotifyBtn.title = "Notifications Enabled";
        }
    }

    async function requestNotificationPermission() {
        if (!("Notification" in window)) {
            showToast('Browser notifications are not supported', 'error');
            return;
        }

        if (Notification.permission === "granted") {
            showToast('Notifications are already enabled 🔔', 'info');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            if (DOM.navNotifyBtn) {
                DOM.navNotifyBtn.classList.add('enabled');
                DOM.navNotifyBtn.title = "Notifications Enabled";
            }
            showToast('Notifications enabled successfully! 🔔', 'success');
            try {
                new Notification('NoteFlow Notifications Enabled', {
                    body: 'You will receive reminders for upcoming deadlines!',
                });
            } catch (e) { /* ignore */ }
        } else {
            showToast('Notification permission denied', 'error');
        }
    }

    const notifiedGoals = new Set();
    function checkGoalNotifications() {
        if (!("Notification" in window) || Notification.permission !== "granted") return;

        const now = Date.now();
        goals.forEach(goal => {
            if (goal.completed) return;
            const targetTime = new Date(goal.deadline).getTime();
            const diffMin = (targetTime - now) / 60000;

            if (diffMin > 0 && diffMin <= 15 && !notifiedGoals.has(goal.id)) {
                notifiedGoals.add(goal.id);
                try {
                    new Notification(`Goal Deadline Approaching! 🎯`, {
                        body: `"${goal.title}" is due in ${Math.ceil(diffMin)} minutes!`,
                    });
                } catch (e) { /* ignore */ }
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

        const bgValue = type === 'image' ? `url("${value}")` : value;
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

    async function saveBgSetting(value, type) {
        if (!currentUser) return;
        try {
            if (type === 'image') {
                // Images are too large for Firestore (1MB limit) — keep in localStorage
                const key = `noteflow_${currentUser.uid}_bg`;
                localStorage.setItem(key, JSON.stringify({ value, type }));
            } else {
                // Gradients are small — save to Firestore for cross-device sync
                await db.collection('users').doc(currentUser.uid)
                    .collection('settings').doc('background')
                    .set({ value, type });
                // Also cache locally
                const key = `noteflow_${currentUser.uid}_bg`;
                localStorage.setItem(key, JSON.stringify({ value, type }));
            }
        } catch (e) {
            console.warn('Could not save background:', e);
            showToast('Failed to save background setting', 'error');
        }
    }

    async function loadBgSetting() {
        if (!currentUser) return;
        try {
            // Try Firestore first (for gradients synced across devices)
            const doc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('background').get();
            if (doc.exists) {
                const { value, type } = doc.data();
                applyBackground(value, type);
                return;
            }
            // Fallback to localStorage (for images)
            const key = `noteflow_${currentUser.uid}_bg`;
            const data = localStorage.getItem(key);
            if (data) {
                const { value, type } = JSON.parse(data);
                applyBackground(value, type);
            }
        } catch (e) {
            console.warn('Could not load background setting:', e);
        }
    }

    async function removeBgSetting() {
        if (!currentUser) return;
        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('background').delete();
            const key = `noteflow_${currentUser.uid}_bg`;
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Could not remove background setting:', e);
        }
    }

    // ============================================================
    // THEME MANAGEMENT (Light / Dark)
    // ============================================================
    let currentTheme = 'dark';

    function applyTheme(theme) {
        currentTheme = theme;
        const isLight = theme === 'light';
        document.documentElement.classList.toggle('light-theme', isLight);
        document.body.classList.toggle('light-theme', isLight);
        
        if (DOM.themeToggleBtn) {
            const sunIcon = DOM.themeToggleBtn.querySelector('.sun-icon');
            const moonIcon = DOM.themeToggleBtn.querySelector('.moon-icon');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = isLight ? 'block' : 'none';
                moonIcon.style.display = isLight ? 'none' : 'block';
            }
        }
    }

    async function toggleTheme() {
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        saveThemeSetting(nextTheme);
        showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} theme`, 'info');
    }

    async function saveThemeSetting(theme) {
        localStorage.setItem('noteflow_theme', theme);
        if (currentUser) {
            try {
                await db.collection('users').doc(currentUser.uid)
                    .collection('settings').doc('theme').set({ theme });
            } catch (e) {
                console.warn('Could not save theme to Firestore:', e);
            }
        }
    }

    async function loadThemeSetting() {
        const localTheme = localStorage.getItem('noteflow_theme');
        if (localTheme) {
            applyTheme(localTheme);
        }

        if (!currentUser) return;

        try {
            const doc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('theme').get();
            if (doc.exists && doc.data().theme) {
                applyTheme(doc.data().theme);
                localStorage.setItem('noteflow_theme', doc.data().theme);
            }
        } catch (e) {
            console.warn('Could not load theme from Firestore:', e);
        }
    }

    function updatePresetActiveState(activeBtn) {
        DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    function clearPresetActiveState() {
        DOM.bgPresetsGrid.querySelectorAll('.bg-preset').forEach(b => b.classList.remove('active'));
    }

    async function syncPresetActiveState() {
        if (!currentUser) return;
        try {
            const doc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('background').get();
            if (doc.exists) {
                const { value, type } = doc.data();
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
        loadThemeSetting();
        initEvents();
        initInactivityMonitor();
        console.log('%c✨ NoteFlow Loaded (with Firebase Auth & Security)', 'color: #8B5CF6; font-weight: bold; font-size: 14px;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
