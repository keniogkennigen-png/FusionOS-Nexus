// FusionOS - Mobile Operating System JavaScript

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    initTimeDisplay();
    initLockScreen();
    initAppGrid();
    initDock();
    initControlCenter();
    initPrivacyDashboard();
    initTerminal();
    initCalculator();
    initNotifications();
    initSettings();
    initTheme();
});

// ==================== Time & Date ====================

function initTimeDisplay() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Update lock screen time
    const lockTimeEl = document.getElementById('lockTime');
    if (lockTimeEl) {
        lockTimeEl.textContent = timeString;
    }

    // Update status bar time
    const statusLeftEl = document.getElementById('statusLeft');
    if (statusLeftEl) {
        statusLeftEl.textContent = timeString;
    }

    // Update desktop time
    const desktopTimeEl = document.getElementById('desktopTime');
    if (desktopTimeEl) {
        const options = { hour: 'numeric', minute: '2-digit' };
        desktopTimeEl.textContent = now.toLocaleTimeString('en-US', options);
    }

    // Update lock screen date
    const lockDateEl = document.getElementById('lockDate');
    if (lockDateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        lockDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ==================== Lock Screen ====================

function initLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    let startY = 0;
    let isDragging = false;

    lockScreen.addEventListener('touchstart', handleTouchStart, { passive: true });
    lockScreen.addEventListener('touchmove', handleTouchMove, { passive: false });
    lockScreen.addEventListener('touchend', handleTouchEnd);

    lockScreen.addEventListener('mousedown', handleMouseDown);
    lockScreen.addEventListener('mousemove', handleMouseMove);
    lockScreen.addEventListener('mouseup', handleMouseUp);
    lockScreen.addEventListener('mouseleave', handleMouseUp);

    function handleTouchStart(e) {
        isDragging = true;
        startY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;

        if (diff > 100) {
            unlockPhone();
            isDragging = false;
        }
    }

    function handleTouchEnd() {
        isDragging = false;
    }

    function handleMouseDown(e) {
        isDragging = true;
        startY = e.clientY;
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        const diff = startY - e.clientY;

        if (diff > 100) {
            unlockPhone();
            isDragging = false;
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }
}

function unlockPhone() {
    const lockScreen = document.getElementById('lockScreen');
    lockScreen.style.transform = 'translateY(-100%)';
    lockScreen.style.transition = 'transform 0.5s ease';

    setTimeout(() => {
        lockScreen.classList.remove('active');
        document.getElementById('homeScreen').classList.add('active');
    }, 500);
}

// ==================== Apps Configuration ====================

const apps = [
    { id: 'messages', name: 'Messages', icon: '💬', color: '#34c759' },
    { id: 'phone', name: 'Phone', icon: '📞', color: '#34c759' },
    { id: 'safari', name: 'Safari', icon: '🧭', color: '#007aff' },
    { id: 'mail', name: 'Mail', icon: '✉️', color: '#007aff' },
    { id: 'camera', name: 'Camera', icon: '📷', color: '#8e8e93' },
    { id: 'photos', name: 'Photos', icon: '🖼️', color: '#ff9500' },
    { id: 'appstore', name: 'App Store', icon: '🅰️', color: '#007aff' },
    { id: 'health', name: 'Health', icon: '❤️', color: '#ff2d55' },
    { id: 'wallet', name: 'Wallet', icon: '💳', color: '#1c1c1e' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: '#8e8e93' },
    { id: 'calculator', name: 'Calculator', icon: '🧮', color: '#1c1c1e' },
    { id: 'terminal', name: 'Terminal', icon: '⬛', color: '#000' },
    { id: 'privacy', name: 'Privacy', icon: '🛡️', color: '#34c759' },
    { id: 'ai', name: 'FusionAI', icon: '🤖', color: '#667eea' },
    { id: 'files', name: 'Files', icon: '📁', color: '#007aff' },
    { id: 'desktop', name: 'Desktop', icon: '🖥️', color: '#5856d6' }
];

function initAppGrid() {
    const grid = document.getElementById('appGrid');
    if (!grid) return;

    apps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.className = 'app-item';
        appItem.innerHTML = `
            <div class="app-icon" style="background: ${app.color}">${app.icon}</div>
            <span class="app-label">${app.name}</span>
        `;
        appItem.addEventListener('click', () => openApp(app.id));
        grid.appendChild(appItem);
    });
}

function initDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;

    const dockApps = ['phone', 'safari', 'messages', 'music'];

    dockApps.forEach(appId => {
        const app = apps.find(a => a.id === appId);
        if (app) {
            const appItem = document.createElement('div');
            appItem.className = 'app-item';
            appItem.innerHTML = `<div class="app-icon" style="background: ${app.color}">${app.icon}</div>`;
            appItem.addEventListener('click', () => openApp(app.id));
            dock.appendChild(appItem);
        }
    });
}

// ==================== Navigation ====================

function openApp(appId) {
    // Hide all overlays first
    closeControlCenter();
    closeNotificationPanel();

    // Special handling for certain apps
    switch(appId) {
        case 'privacy':
            showApp('privacyDashboard');
            break;
        case 'security':
            showApp('securityApp');
            break;
        case 'ai':
            showApp('aiAssistant');
            break;
        case 'settings':
            showApp('settingsApp');
            break;
        case 'appstore':
            showApp('appStore');
            break;
        case 'terminal':
            showApp('terminalApp');
            break;
        case 'calculator':
            showApp('calculatorApp');
            break;
        case 'camera':
            showApp('cameraApp');
            break;
        case 'desktop':
            enterDesktopMode();
            break;
        default:
            // Show a placeholder for other apps
            showApp('appStore');
    }
}

function showApp(appScreenId) {
    // Close any open apps first
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const appScreen = document.getElementById(appScreenId);
    if (appScreen) {
        appScreen.classList.add('active');
    }
}

function closeApp(appScreenId) {
    const appScreen = document.getElementById(appScreenId);
    if (appScreen) {
        appScreen.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => {
            appScreen.classList.remove('active');
            appScreen.style.animation = '';
        }, 280);
    }
}

function closeAllApps() {
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

function enterDesktopMode() {
    closeControlCenter();
    closeNotificationPanel();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('desktopMode').classList.add('active');
}

function exitDesktopMode() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
}

// ==================== Control Center ====================

function initControlCenter() {
    const controlCenter = document.getElementById('controlCenter');
    const homeScreen = document.getElementById('homeScreen');

    // Click outside to close
    controlCenter.addEventListener('click', (e) => {
        if (e.target === controlCenter) {
            closeControlCenter();
        }
    });

    // Toggle buttons
    document.querySelectorAll('.control-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    // Focus mode
    const focusModeTile = document.getElementById('focusModeTile');
    if (focusModeTile) {
        focusModeTile.addEventListener('click', function() {
            toggleFocusMode(this);
        });
    }

    // Convergence mode
    const convergenceTile = document.getElementById('convergenceTile');
    if (convergenceTile) {
        convergenceTile.addEventListener('click', function() {
            toggleConvergence(this);
        });
    }

    // Dark mode toggle
    const darkModeTile = document.getElementById('darkModeTile');
    if (darkModeTile) {
        darkModeTile.addEventListener('click', function() {
            toggleDarkMode(this);
        });
    }

    // Quick apps
    document.querySelectorAll('.quick-app').forEach(app => {
        app.addEventListener('click', function() {
            const appId = this.dataset.app;
            closeControlCenter();
            openApp(appId);
        });
    });

    // Status bar click to open control center
    const statusRight = document.querySelector('.status-right');
    if (statusRight) {
        statusRight.addEventListener('click', () => {
            openControlCenter();
        });
    }
}

function openControlCenter() {
    closeNotificationPanel();
    document.getElementById('controlCenter').classList.add('active');
}

function closeControlCenter() {
    document.getElementById('controlCenter').classList.remove('active');
}

function toggleFocusMode(tile) {
    tile.classList.toggle('active');
    // Trigger focus mode animation
    if (tile.classList.contains('active')) {
        showNotification('Focus Mode', 'Focus mode activated');
    } else {
        showNotification('Focus Mode', 'Focus mode deactivated');
    }
}

function toggleConvergence(tile) {
    tile.classList.toggle('active');
    if (tile.classList.contains('active')) {
        enterDesktopMode();
    } else {
        exitDesktopMode();
    }
}

function toggleDarkMode(tile) {
    tile.classList.toggle('active');
    toggleTheme();
}

// ==================== Theme System ====================

function initTheme() {
    const savedTheme = localStorage.getItem('fusionos-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
        darkModeToggle.addEventListener('change', toggleTheme);
    }

    const convergenceToggle = document.getElementById('convergenceToggle');
    if (convergenceToggle) {
        convergenceToggle.addEventListener('change', function() {
            if (this.checked) {
                enterDesktopMode();
            } else {
                exitDesktopMode();
            }
        });
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('fusionos-theme', newTheme);

    const darkModeTile = document.getElementById('darkModeTile');
    if (darkModeTile) {
        darkModeTile.classList.toggle('active', newTheme === 'dark');
    }
}

// ==================== Privacy Dashboard ====================

function initPrivacyDashboard() {
    generatePermissionList();
    generateActivityList();
}

function generatePermissionList() {
    const permissionList = document.getElementById('permissionList');
    if (!permissionList) return;

    const permissions = [
        { icon: '📍', name: 'Location', status: 'When Using', active: true },
        { icon: '📷', name: 'Camera', status: 'Never', active: false },
        { icon: '🎤', name: 'Microphone', status: 'When Using', active: true },
        { icon: '👤', name: 'Contacts', status: 'Selected', active: true },
        { icon: '📁', name: 'Files', status: 'Never', active: false },
        { icon: '🌐', name: 'Network', status: 'Always', active: true }
    ];

    permissions.forEach(perm => {
        const item = document.createElement('div');
        item.className = 'permission-item';
        item.innerHTML = `
            <div class="permission-icon">${perm.icon}</div>
            <div class="permission-info">
                <h4>${perm.name}</h4>
                <p>${perm.status}</p>
            </div>
            <div class="permission-toggle ${perm.active ? 'active' : ''}" onclick="this.classList.toggle('active')"></div>
        `;
        permissionList.appendChild(item);
    });
}

function generateActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    const activities = [
        { time: '10:23 AM', title: 'Browser accessed', desc: '2 trackers blocked' },
        { time: '10:15 AM', title: 'Location accessed', desc: 'Maps app' },
        { time: '09:45 AM', title: 'Camera access', desc: 'QR Scanner' },
        { time: '09:30 AM', title: 'App installed', desc: 'ProtonMail' }
    ];

    activities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="activity-time">${act.time}</span>
            <div class="activity-info">
                <h4>${act.title}</h4>
                <p>${act.desc}</p>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// ==================== Terminal ====================

function initTerminal() {
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');

    if (!input || !output) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                processCommand(command);
            }
            input.value = '';
        }
    });
}

const terminalCommands = {
    help: () => {
        return `Available commands:
  help     - Show this help message
  whoami   - Display current user
  date     - Show current date/time
  uname    - Display system information
  uptime   - Show system uptime
  clear    - Clear terminal
  echo     - Print text
  neofetch - Display system info
  privacy  - Privacy status report
  security - Security status report`;
    },
    whoami: () => 'user',
    date: () => new Date().toString(),
    uname: () => 'FusionOS 1.0.0 Beta',
    uptime: () => {
        const hours = Math.floor(Math.random() * 24);
        const mins = Math.floor(Math.random() * 60);
        return ` ${hours}:${mins.toString().padStart(2, '0')} up ${hours} hours, ${mins} minutes`;
    },
    clear: () => {
        const output = document.getElementById('terminalOutput');
        if (output) output.innerHTML = '';
        return '';
    },
    echo: (args) => args.join(' '),
    neofetch: () => `
        .-/+oossssoo+/-.              user@fusionos
    \`:+ssssssssssssssssss+:\`          -----------
  -+ssssssssssssssssssyyssss+-        OS: FusionOS 1.0.0 Beta
.ossssssssssssssssssdMMMNysssso.      Kernel: Linux 6.0
/ssssssssssshdmmNNmmyNMMMMhssssss/    Uptime: 12 hours
+ssssssssshmydMMMMMMMNddddyssssss+    Shell: fusion-term
/sssssssshNMMMyhhyyyyhmNMMMNhssssss/  Terminal: fusion-term
.ssssssssdMMMNh+++++hmNMMMMMNdssssss. CPU: Virtual ARM 8-core
+sssshhhyNMMNy++++++yNMMMNhssssss+    Memory: 4GB / 8GB
ossyNMMMNyMMh++++++hmMMMMMNyysssso
ossyNMMMNyMMh++++++hmMMMMMNyysssso
+sssshhhyNMMNy++++++yNMMMNhssssss+
.ssssssssdMMMNh+++++hmNMMMMMNdssssss.
/sssssssshNMMMyhhyyyyhmNMMMNhssssss/
+ssssssssshmydMMMMMMMNddddyssssss+
/sssssssssshdmmNNmmyNMMMMhssssss/
.ossssssssssssssssssdMMMNysssso.
  -+ssssssssssssssssssyyssss+-
    \`:+ssssssssssssssssss+:\`
        .-/+oossssoo+/-.`;
    privacy: () => `
Privacy Report:
  ✓ Tracker blocking: Active (1,247 blocked)
  ✓ Encryption: Hardware-backed
  ✓ Permission monitoring: Enabled
  ✓ Network hardening: Active
  ✓ On-device AI processing: Enabled
  Privacy Score: 90/100`,
    security: () => `
Security Status:
  ✓ Verified boot: Active
  ✓ Encryption: Hardware-backed AES-256
  ✓ App sandboxing: Enabled
  ✓ SELinux: Enforcing
  ✓ Network hardening: Active
  ✓ Biometric security: 5-attempt limit
  Security Grade: A+`
};

function processCommand(input) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add command to output
    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.textContent = `user@fusionos:~$ ${input}`;
    output.appendChild(cmdLine);

    // Process command
    let result = '';
    if (terminalCommands[cmd]) {
        const cmdFunc = terminalCommands[cmd];
        result = typeof cmdFunc === 'function' ? cmdFunc(args) : cmdFunc;
    } else {
        result = `Command '${cmd}' not found. Type 'help' for available commands.`;
    }

    if (result) {
        const resultLines = result.split('\n');
        resultLines.forEach(line => {
            const lineEl = document.createElement('div');
            lineEl.className = 'terminal-line';
            lineEl.textContent = line;
            output.appendChild(lineEl);
        });
    }

    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
}

// ==================== Calculator ====================

let calcDisplay = '0';
let calcFirstNum = null;
let calcOperatorPending = null;
let calcNewEntry = true;

function initCalculator() {
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.value = calcDisplay;
    }
}

function calcNumber(num) {
    if (calcNewEntry) {
        calcDisplay = num;
        calcNewEntry = false;
    } else {
        calcDisplay = calcDisplay === '0' ? num : calcDisplay + num;
    }
    updateCalcDisplay();
}

function calcDecimal() {
    if (calcNewEntry) {
        calcDisplay = '0.';
        calcNewEntry = false;
    } else if (!calcDisplay.includes('.')) {
        calcDisplay += '.';
    }
    updateCalcDisplay();
}

function calcClear() {
    calcDisplay = '0';
    calcFirstNum = null;
    calcOperatorPending = null;
    calcNewEntry = true;
    updateCalcDisplay();
}

function calcToggleSign() {
    calcDisplay = (parseFloat(calcDisplay) * -1).toString();
    updateCalcDisplay();
}

function calcPercent() {
    calcDisplay = (parseFloat(calcDisplay) / 100).toString();
    updateCalcDisplay();
}

function calcOperator(op) {
    if (calcFirstNum === null) {
        calcFirstNum = parseFloat(calcDisplay);
    } else if (calcOperatorPending) {
        const result = calculate(calcFirstNum, parseFloat(calcDisplay), calcOperatorPending);
        calcDisplay = result.toString();
        calcFirstNum = result;
    }
    calcOperatorPending = op;
    calcNewEntry = true;
    updateCalcDisplay();
}

function calcEquals() {
    if (calcOperatorPending && calcFirstNum !== null) {
        const result = calculate(calcFirstNum, parseFloat(calcDisplay), calcOperatorPending);
        calcDisplay = result.toString();
        calcFirstNum = null;
        calcOperatorPending = null;
        calcNewEntry = true;
        updateCalcDisplay();
    }
}

function calculate(a, b, op) {
    switch(op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default: return b;
    }
}

// ==================== Notifications ====================

function initNotifications() {
    const statusBar = document.querySelector('.status-bar');
    const notificationPanel = document.getElementById('notificationPanel');

    if (statusBar && notificationPanel) {
        statusBar.addEventListener('click', (e) => {
            // Don't trigger if clicking on status elements
            if (e.target.closest('.status-left') || e.target.closest('.status-right')) {
                return;
            }
            toggleNotificationPanel();
        });

        notificationPanel.addEventListener('click', (e) => {
            if (e.target === notificationPanel) {
                closeNotificationPanel();
            }
        });
    }

    // Add sample notifications
    setTimeout(() => {
        addNotification('Messages', '💬', 'John Doe', 'Hey, are you free tomorrow?', '2m ago');
    }, 2000);

    setTimeout(() => {
        addNotification('Privacy', '🛡️', 'Tracker Blocked', '3 trackers blocked in Safari', '15m ago');
    }, 4000);
}

function toggleNotificationPanel() {
    closeControlCenter();
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('active');
}

function closeNotificationPanel() {
    document.getElementById('notificationPanel').classList.remove('active');
}

function addNotification(appName, icon, title, body, time) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    // Check if notification already exists
    const existing = list.querySelector(`[data-title="${title}"]`);
    if (existing) return;

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.dataset.title = title;
    item.innerHTML = `
        <div class="notification-app-header">
            <span class="notification-app-icon">${icon}</span>
            <span class="notification-app-name">${appName}</span>
            <span class="notification-time">${time}</span>
        </div>
        <div class="notification-title">${title}</div>
        <div class="notification-body">${body}</div>
    `;

    list.insertBefore(item, list.firstChild);
}

function showNotification(title, body) {
    addNotification('FusionOS', '🔔', title, body, 'now');
}

// ==================== Settings ====================

function initSettings() {
    // Settings interactions are handled in HTML
}

// ==================== AI Assistant ====================

const aiResponses = {
    schedule: "You have 3 meetings today: 10 AM team standup, 2 PM project review, 4 PM 1:1 with manager. Would you like me to set focus mode during these times?",
    battery: "Battery optimization applied. Current battery life: 87%. Expected usage pattern suggests you can get through today with 20% remaining. Enabling adaptive battery...",
    privacy: "Your privacy score is 90/100. Over the past week, 1,247 trackers were blocked and 48 data points were protected. Your most secure areas are encryption and network hardening.",
    focus: "Based on your calendar and work patterns, I recommend focus time from 2-4 PM during your project review. Shall I enable do not disturb during this period?"
};

function initAIAssistant() {
    const input = document.getElementById('aiInput');
    const suggestions = document.querySelectorAll('.ai-suggestion');

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                processAIQuery(input.value);
                input.value = '';
            }
        });
    }

    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            const query = suggestion.textContent.trim();
            processAIQuery(query);
        });
    });
}

function processAIQuery(query) {
    const lowerQuery = query.toLowerCase();

    // Add user query to display
    const aiContent = document.querySelector('.ai-content');
    if (aiContent) {
        const queryEl = document.createElement('div');
        queryEl.style.cssText = 'padding: 12px 16px; background: var(--bg-secondary); border-radius: 12px; margin: 0 16px; font-size: 14px;';
        queryEl.textContent = `You: ${query}`;
        aiContent.insertBefore(queryEl, aiContent.querySelector('.ai-welcome').nextSibling);

        // Simulate AI response
        setTimeout(() => {
            let response = "I'm processing your request. All analysis happens locally on your device for maximum privacy.";
            response = getAIResponse(lowerQuery);
            const responseEl = document.createElement('div');
            responseEl.style.cssText = 'padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin: 8px 16px; font-size: 14px; line-height: 1.5;';
            responseEl.textContent = `FusionAI: ${response}`;
            aiContent.insertBefore(responseEl, queryEl.nextSibling);
        }, 500);
    }
}

function getAIResponse(query) {
    if (query.includes('schedule') || query.includes('calendar') || query.includes('meeting')) {
        return aiResponses.schedule;
    } else if (query.includes('battery') || query.includes('optimize')) {
        return aiResponses.battery;
    } else if (query.includes('privacy') || query.includes('status')) {
        return aiResponses.privacy;
    } else if (query.includes('focus') || query.includes('time')) {
        return aiResponses.focus;
    } else if (query.includes('hello') || query.includes('hi')) {
        return "Hello! I'm FusionAI, your on-device assistant. I process everything locally to protect your privacy. How can I help you today?";
    } else {
        return "I understand you're asking about \"" + query + "\". My capabilities include checking your schedule, optimizing battery, reporting privacy status, and suggesting focus times. What would you like to know?";
    }
}

// Initialize AI assistant
initAIAssistant();

// ==================== Desktop Mode Sidebar ====================

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==================== Keyboard Shortcuts ====================

document.addEventListener('keydown', (e) => {
    // Escape to close apps
    if (e.key === 'Escape') {
        closeControlCenter();
        closeNotificationPanel();
        closeApp('privacyDashboard');
        closeApp('securityApp');
        closeApp('aiAssistant');
        closeApp('settingsApp');
        closeApp('appStore');
        closeApp('terminalApp');
        closeApp('calculatorApp');
        closeApp('cameraApp');
        exitDesktopMode();
    }

    // Ctrl/Cmd + D for dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }

    // Ctrl/Cmd + C for convergence mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        enterDesktopMode();
    }
});

// ==================== Show About Modal ====================

function showAboutModal() {
    document.getElementById('aboutModal').classList.add('active');
}

function closeModal() {
    document.getElementById('aboutModal').classList.remove('active');
}

// Close modal on background click
document.getElementById('aboutModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ==================== Utility Functions ====================

// Long press detection for app icons
let pressTimer;
document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('mousedown', function() {
        pressTimer = setTimeout(() => {
            showAboutModal();
        }, 1000);
    });
    item.addEventListener('mouseup', () => clearTimeout(pressTimer));
    item.addEventListener('mouseleave', () => clearTimeout(pressTimer));
});

// Add About app to grid for easy access
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('appGrid');
    if (grid) {
        const aboutItem = document.createElement('div');
        aboutItem.className = 'app-item';
        aboutItem.innerHTML = `
            <div class="app-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">ℹ️</div>
            <span class="app-label">About</span>
        `;
        aboutItem.addEventListener('click', showAboutModal);
        grid.insertBefore(aboutItem, grid.lastChild);
    }
});

// Console Easter Egg
console.log('%c🦀 FusionOS - The Future of Mobile', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cWhere Privacy Meets Innovation', 'font-size: 14px; color: #764ba2;');
console.log('%cBuilt with the best of open source', 'font-size: 12px; color: #8e8e93;');
