// FusionOS - Enhanced Mobile Operating System with Educational Modules

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
    initEducationalModules();
    initOSHistoryTimeline();
    initOSComparison();
    initQuizSystem();
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

    const lockTimeEl = document.getElementById('lockTime');
    if (lockTimeEl) {
        lockTimeEl.textContent = timeString;
    }

    const statusLeftEl = document.getElementById('statusLeft');
    if (statusLeftEl) {
        statusLeftEl.textContent = timeString;
    }

    const desktopTimeEl = document.getElementById('desktopTime');
    if (desktopTimeEl) {
        const options = { hour: 'numeric', minute: '2-digit' };
        desktopTimeEl.textContent = now.toLocaleTimeString('en-US', options);
    }

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
    { id: 'learn', name: 'Learn OS', icon: '📚', color: '#ff6b6b' },
    { id: 'history', name: 'OS History', icon: '📜', color: '#4ecdc4' },
    { id: 'quiz', name: 'Quiz', icon: '✅', color: '#45b7d1' },
    { id: 'compare', name: 'Compare', icon: '⚖️', color: '#96ceb4' },
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

    const dockApps = ['phone', 'safari', 'messages', 'music', 'learn'];

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
    closeControlCenter();
    closeNotificationPanel();

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
        case 'learn':
            showApp('learningApp');
            break;
        case 'history':
            showApp('historyApp');
            break;
        case 'quiz':
            showApp('quizApp');
            break;
        case 'compare':
            showApp('compareApp');
            break;
        default:
            showNotification('FusionOS', 'App launching...', `${appId} is being prepared`);
    }
}

function showApp(appScreenId) {
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

    controlCenter.addEventListener('click', (e) => {
        if (e.target === controlCenter) {
            closeControlCenter();
        }
    });

    document.querySelectorAll('.control-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    const focusModeTile = document.getElementById('focusModeTile');
    if (focusModeTile) {
        focusModeTile.addEventListener('click', function() {
            toggleFocusMode(this);
        });
    }

    const convergenceTile = document.getElementById('convergenceTile');
    if (convergenceTile) {
        convergenceTile.addEventListener('click', function() {
            toggleConvergence(this);
        });
    }

    const darkModeTile = document.getElementById('darkModeTile');
    if (darkModeTile) {
        darkModeTile.addEventListener('click', function() {
            toggleDarkMode(this);
        });
    }

    document.querySelectorAll('.quick-app').forEach(app => {
        app.addEventListener('click', function() {
            const appId = this.dataset.app;
            closeControlCenter();
            openApp(appId);
        });
    });

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
    showNotification('Focus Mode', tile.classList.contains('active') ? 'Activated' : 'Deactivated');
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

// ==================== Educational Modules ====================

const educationalContent = {
    introduction: {
        title: 'Introduction to Mobile OS',
        content: `
            <h2>What is a Mobile Operating System?</h2>
            <p>A mobile operating system, also called a mobile OS, is an operating system that is specifically designed to run on mobile devices such as mobile phones, smartphones, PDAs, tablet computers and other digital mobile devices.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Touchscreen interface</li>
                <li>Cellular connectivity</li>
                <li>Bluetooth & WiFi support</li>
                <li>GPS mobile navigation</li>
                <li>Camera integration</li>
                <li>Voice recognition</li>
                <li>Music player</li>
                <li>Near Field Communication (NFC)</li>
            </ul>
            
            <h3>Evolution Timeline</h3>
            <p>Mobile phones started with embedded systems (1979-1992), then evolved through:</p>
            <ul>
                <li>1993: First smartphone - IBM Simon</li>
                <li>1996: Windows CE & Palm OS</li>
                <li>2000: Symbian OS on Ericsson R380</li>
                <li>2007: iPhone OS & Android announced</li>
                <li>2008: First Android phone (HTC Dream)</li>
            </ul>
        `
    },
    
    types: {
        title: 'Types of Mobile Operating Systems',
        content: `
            <h2>Major Mobile OS Types</h2>
            
            <div class="os-type">
                <h3>1. Android OS (Google)</h3>
                <p>Based on modified Linux kernel. Open source (AOSP). World's best-selling smartphone platform. Java-based app development with Android SDK.</p>
            </div>
            
            <div class="os-type">
                <h3>2. iOS (Apple)</h3>
                <p>Derived from Mac OS X. Available only on Apple devices. Known for security and smooth user experience.</p>
            </div>
            
            <div class="os-type">
                <h3>3. Symbian OS (Nokia)</h3>
                <p>Open source OS for smartphones. Divided into Series 40, 60, 80, 90. Once dominated the smartphone market.</p>
            </div>
            
            <div class="os-type">
                <h3>4. BlackBerry OS (RIM)</h3>
                <p>Popular with corporate users. Excellent Exchange/Enterprise Server synchronization. Physical keyboard focus.</p>
            </div>
            
            <div class="os-type">
                <h3>5. Windows Phone (Microsoft)</h3>
                <p>Modern interface with Live Tiles. Discontinued but introduced innovative design concepts.</p>
            </div>
            
            <div class="os-type">
                <h3>6. Palm OS / webOS</h3>
                <p>Pioneered PDAs. webOS introduced card-based multitasking later acquired by HP.</p>
            </div>
            
            <div class="os-type">
                <h3>7. Bada (Samsung)</h3>
                <p>Proprietary OS for lower-end to high-end smartphones. Multi-touch, 3D graphics support.</p>
            </div>
            
            <div class="os-type">
                <h3>8. Maemo / MeeGo</h3>
                <p>Linux-based platforms from Nokia. Open source, Debian-based with GNOME frameworks.</p>
            </div>
        `
    },
    
    functions: {
        title: 'Functions of Mobile OS',
        content: `
            <h2>Core Functions of Mobile Operating Systems</h2>
            
            <h3>User View Functions</h3>
            <ul>
                <li><strong>Error Detection:</strong> Handles hardware/software errors and displays messages</li>
                <li><strong>Application Coordination:</strong> Manages multiple applications</li>
                <li><strong>Software Development:</strong> Provides editors, debuggers, SDKs</li>
                <li><strong>I/O Device Access:</strong> Abstracts device complexity</li>
                <li><strong>File Access:</strong> Manages read/write permissions</li>
                <li><strong>System Access:</strong> Protection from unauthorized users</li>
            </ul>
            
            <h3>System View Functions</h3>
            <ul>
                <li><strong>Memory Management:</strong> Allocates/deallocates RAM dynamically</li>
                <li><strong>Processor Management:</strong> Scheduling processes for CPU execution</li>
                <li><strong>Device Management:</strong> Controls all attached hardware</li>
                <li><strong>File Management:</strong> Secondary storage organization</li>
                <li><strong>Performance Monitoring:</strong> Tracks system efficiency</li>
            </ul>
            
            <h3>Mobile-Specific Functions</h3>
            <ul>
                <li>Battery management and power optimization</li>
                <li>Wireless connectivity (Cellular, WiFi, Bluetooth)</li>
                <li>Location services (GPS, AGPS)</li>
                <li>Sensor integration (accelerometer, gyroscope)</li>
                <li>Touch input processing</li>
            </ul>
        `
    },
    
    android: {
        title: 'Android Operating System',
        content: `
            <h2>Android OS Deep Dive</h2>
            
            <h3>Architecture Layers</h3>
            <ol>
                <li><strong>Linux Kernel:</strong> Hardware abstraction, memory management, power management</li>
                <li><strong>Hardware Abstraction Layer (HAL):</strong> Standard interfaces for hardware vendors</li>
                <li><strong>Native Libraries:</strong> C/C++ libraries for graphics, database, media</li>
                <li><strong>Android Runtime:</strong> Dalvik/ART VM, core libraries</li>
                <li><strong>Application Framework:</strong> APIs for app development (Activity Manager, Content Providers, etc.)</li>
                <li><strong>Applications:</strong> Native apps and user-installed apps</li>
            </ol>
            
            <h3>Key Components</h3>
            <ul>
                <li><strong>Activity:</strong> Single screen with UI</li>
                <li><strong>Service:</strong> Background operations</li>
                <li><strong>Broadcast Receiver:</strong> Event listeners</li>
                <li><strong>Content Provider:</strong> Data sharing between apps</li>
            </ul>
            
            <h3>Version History</h3>
            <ul>
                <li>2008: Android 1.0 (Alpha)</li>
                <li>2009: Cupcake (1.5), Donut (1.6), Eclair (2.0-2.1)</li>
                <li>2010: Froyo (2.2), Gingerbread (2.3), Honeycomb (3.0)</li>
                <li>2011: Ice Cream Sandwich (4.0), Jelly Bean (4.1-4.3)</li>
                <li>2013-2014: KitKat (4.4), Lollipop (5.0-5.1)</li>
                <li>2015+: Marshmallow (6.0), Nougat (7.0), Oreo (8.0)</li>
                <li>2018+: Pie (9.0), 10, 11, 12, 13, 14, 15</li>
            </ul>
        `
    },
    
    ios: {
        title: 'iOS Operating System',
        content: `
            <h2>iOS Operating System Deep Dive</h2>
            
            <h3>Architecture Layers</h3>
            <ol>
                <li><strong>Core OS:</strong> Mach kernel, BSD, drivers</li>
                <li><strong>Core Services:</strong> iCloud, Core Foundation, Security</li>
                <li><strong>Media Layer:</strong> Graphics, audio, video frameworks</li>
                <li><strong>Cocoa Touch:</strong> UIKit, Multi-touch, sensors</li>
            </ol>
            
            <h3>Key Features</h3>
            <ul>
                <li>App Store ecosystem with 2M+ apps</li>
                <li>Secure Enclave for biometric processing</li>
                <li>Sandboxed app environment</li>
                <li>AirDrop for wireless sharing</li>
                <li>Continuity features (Handoff, Universal Clipboard)</li>
                <li>Siri voice assistant</li>
            </ul>
            
            <h3>Security Model</h3>
            <ul>
                <li>Secure Boot chain</li>
                <li>Hardware encryption (Secure Enclave)</li>
                <li>App sandboxing</li>
                <li>Data Protection API</li>
                <li>Touch ID / Face ID</li>
            </ul>
            
            <h3>Development</h3>
            <p>iOS apps developed with Swift or Objective-C using Xcode IDE. Uses UIKit or SwiftUI frameworks.</p>
        `
    },
    
    rtos: {
        title: 'Real-Time Operating Systems',
        content: `
            <h2>Real-Time Operating Systems (RTOS)</h2>
            
            <h3>What is RTOS?</h3>
            <p>An RTOS is a system where the time required to process and respond to input is so small that it controls the environment. Response time must be deterministic.</p>
            
            <h3>Types of RTOS</h3>
            <ul>
                <li><strong>Hard Real-Time:</strong> Critical tasks MUST complete on time (e.g., weapon control systems)</li>
                <li><strong>Soft Real-Time:</strong> Tasks should complete ASAP but delays are tolerable (e.g., video calling)</li>
            </ul>
            
            <h3>RTOS in Mobile Devices</h3>
            <ul>
                <li>Camera image processing pipeline</li>
                <li>Audio/video codec operations</li>
                <li>Sensor data fusion (accelerometer, gyroscope)</li>
                <li>Touch input processing</li>
                <li>Baseband communication processing</li>
            </ul>
            
            <h3>Characteristics</h3>
            <ul>
                <li>Priority-based preemptive scheduling</li>
                <li>Minimal interrupt latency</li>
                <li>Predictable response times</li>
                <li>Efficient memory management</li>
            </ul>
        `
    },
    
    embedded: {
        title: 'Embedded Operating Systems',
        content: `
            <h2>Embedded Operating Systems in Mobile Devices</h2>
            
            <h3>Definition</h3>
            <p>An embedded OS is a system made for specific tasks. It combines computer hardware and software for specific functions within a larger system.</p>
            
            <h3>Components</h3>
            <ul>
                <li><strong>Hardware:</strong> Processors, memory, I/O devices</li>
                <li><strong>Software:</strong> Application-specific programs</li>
                <li><strong>RTOS:</strong> Real-time operating system for task scheduling</li>
            </ul>
            
            <h3>Mobile OS as Embedded System</h3>
            <ul>
                <li>Power management is primary concern</li>
                <li>Limited memory constraints</li>
                <li>Must work on microcontroller/microprocessor</li>
                <li>Hardware/software integration for security and performance</li>
            </ul>
            
            <h3>Advantages</h3>
            <ul>
                <li>Easy customization</li>
                <li>Fast loading (small size)</li>
                <li>Low development cost</li>
                <li>Low power consumption</li>
                <li>Efficient for specific tasks</li>
            </ul>
            
            <h3>Challenges</h3>
            <ul>
                <li>Limited multi-tasking capability</li>
                <li>Difficult troubleshooting</li>
                <li>Complex data transfer</li>
                <li>Updates require special procedures</li>
            </ul>
        `
    },
    
    networking: {
        title: 'Network Operating Systems',
        content: `
            <h2>Network Operating Systems for Mobile</h2>
            
            <h3>NOS Functions</h3>
            <ul>
                <li>Managing network devices and peripherals</li>
                <li>Creating and managing user accounts</li>
                <li>Controlling access to network resources</li>
                <li>Providing communication services</li>
                <li>Monitoring and troubleshooting</li>
                <li>Network routing features</li>
            </ul>
            
            <h3>Types</h3>
            <ul>
                <li><strong>Peer-to-Peer (P2P):</strong> Equal access for all nodes, small networks</li>
                <li><strong>Client/Server:</strong> Centralized server manages resources, enterprise use</li>
            </ul>
            
            <h3>Mobile Network Features</h3>
            <ul>
                <li>Cellular data (4G LTE, 5G)</li>
                <li>WiFi connectivity</li>
                <li>Bluetooth PAN</li>
                <li>NFC communication</li>
            </ul>
            
            <h3>Security Considerations</h3>
            <ul>
                <li>Encrypted communications (TLS/SSL)</li>
                <li>Certificate validation</li>
                <li>VPN support</li>
                <li>Firewall capabilities</li>
            </ul>
        `
    },
    
    distributed: {
        title: 'Distributed Systems in Mobile',
        content: `
            <h2>Distributed Operating Systems</h2>
            
            <h3>Definition</h3>
            <p>A distributed OS manages multiple processors across a network, making them appear as a single system to users.</p>
            
            <h3>Key Concepts</h3>
            <ul>
                <li>Resource sharing across nodes</li>
                <li>Distributed computing for speed</li>
                <li>Fault tolerance (continued operation if node fails)</li>
                <li>Transparent access to remote resources</li>
            </ul>
            
            <h3>Mobile Applications</h3>
            <ul>
                <li><strong>Cloud Sync:</strong> Data synchronization across devices</li>
                <li><strong>Edge Computing:</strong> Processing at network edge</li>
                <li><strong>Federated Learning:</strong> Distributed ML training</li>
                <li><strong>Content Delivery:</strong> CDN-based content delivery</li>
            </ul>
            
            <h3>Advantages</h3>
            <ul>
                <li>Resource sharing across locations</li>
                <li>Enhanced computational speed</li>
                <li>Fault tolerance</li>
                <li>Scalability</li>
            </ul>
            
            <h3>Challenges</h3>
            <ul>
                <li>Network dependency</li>
                <li>Security risks</li>
                <li>Data consistency</li>
                <li>Bandwidth requirements</li>
            </ul>
        `
    }
};

function initEducationalModules() {
    const moduleGrid = document.getElementById('moduleGrid');
    if (!moduleGrid) return;

    Object.keys(educationalContent).forEach((key, index) => {
        const module = educationalContent[key];
        const moduleItem = document.createElement('div');
        moduleItem.className = 'module-item';
        moduleItem.innerHTML = `
            <div class="module-icon">${['📱', '⚙️', '🔧', '🤖', '🍎', '⏱️', '📱', '🌐', '🖥️'][index]}</div>
            <h4>${module.title}</h4>
            <p>Learn about ${module.title.toLowerCase()}</p>
        `;
        moduleItem.addEventListener('click', () => showModule(key));
        moduleGrid.appendChild(moduleItem);
    });
}

function showModule(moduleKey) {
    const module = educationalContent[moduleKey];
    if (!module) return;

    const moduleContent = document.getElementById('moduleContent');
    if (moduleContent) {
        moduleContent.innerHTML = `
            <div class="module-header">
                <h2>${module.title}</h2>
                <button onclick="closeModule()">Close</button>
            </div>
            <div class="module-body">
                ${module.content}
            </div>
        `;
        document.getElementById('moduleViewer').classList.add('active');
    }
}

function closeModule() {
    document.getElementById('moduleViewer').classList.remove('active');
}

// ==================== OS History Timeline ====================

const historyTimeline = [
    { year: '1979-1992', event: 'Mobile phones with embedded systems' },
    { year: '1993', event: 'IBM Simon - First smartphone introduced' },
    { year: '1996', event: 'Windows CE & Palm OS launched' },
    { year: '1997-1998', event: 'Palm OS 2.0 and 3.0 released' },
    { year: '2000', event: 'Symbian OS on Ericsson R380' },
    { year: '2001-2004', event: 'Windows Mobile versions, Palm OS 5.0' },
    { year: '2005', event: 'Google acquires Android Inc.' },
    { year: '2007', event: 'iPhone announced, Open Handset Alliance formed' },
    { year: '2008', event: 'HTC Dream - First Android phone' },
    { year: '2009', event: 'Android 1.1, 1.5 (Cupcake), Bada 1.0' },
    { year: '2010', event: 'iPhone 4, Android 2.2 (Froyo), Windows Phone 7' },
    { year: '2011', event: 'MeeGo introduced, Android 3.0 (Honeycomb)' },
    { year: '2012', event: 'Intel-powered Android phone (Lenovo K800)' },
    { year: '2013', event: 'BlackBerry 10 released' },
    { year: '2014', event: 'Android Lollipop, iOS 8' },
    { year: '2016', event: 'Android Nougat, iOS 10' },
    { year: '2018', event: 'Android Pie, iOS 12' },
    { year: '2020', event: 'Android 11, iOS 14' },
    { year: '2022', event: 'Android 13, iOS 16' },
    { year: '2024', event: 'Android 15, iOS 18' }
];

function initOSHistoryTimeline() {
    const timelineContainer = document.getElementById('timelineContainer');
    if (!timelineContainer) return;

    historyTimeline.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-year">${item.year}</div>
            <div class="timeline-event">${item.event}</div>
        `;
        timelineContainer.appendChild(timelineItem);
    });
}

// ==================== OS Comparison ====================

const osComparison = {
    headers: ['Feature', 'Android', 'iOS', 'Windows Phone', 'Symbian', 'BlackBerry'],
    rows: [
        ['Open Source', 'Yes (AOSP)', 'No', 'Partially', 'Yes', 'No'],
        ['Developer', 'Google', 'Apple', 'Microsoft', 'Nokia', 'RIM'],
        ['Kernel', 'Linux-based', 'XNU (BSD + Mach)', 'Windows NT', 'Symbian kernel', 'BlackBerry kernel'],
        ['Programming Language', 'Java, Kotlin', 'Swift, Objective-C', 'C#, XAML', 'C++, Java', 'Java ME'],
        ['App Store', 'Google Play', 'App Store', 'Store', 'Nokia Store', 'BlackBerry World'],
        ['File System', 'FAT32, ext4', 'APFS', 'NTFS', 'FAT, EFS', 'FAT32'],
        ['Multi-tasking', 'Yes', 'Yes', 'Limited', 'Yes', 'Yes'],
        ['Customization', 'High', 'Low', 'Medium', 'Medium', 'Low'],
        ['Security', 'Variable', 'High', 'Medium', 'Medium', 'High (Enterprise)'],
        ['Market Share (Peak)', '85%+', '25%', <citation>2</citation>, '50%+ (2010)', '20% (2011)']
    ]
};

function initOSComparison() {
    const comparisonTable = document.getElementById('comparisonTable');
    if (!comparisonTable) return;

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    osComparison.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    comparisonTable.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    osComparison.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            if (index === 0) td.style.fontWeight = 'bold';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    comparisonTable.appendChild(tbody);
}

// ==================== Quiz System ====================

const quizQuestions = [
    {
        question: 'Which mobile OS is based on a modified version of the Linux kernel?',
        options: ['iOS', 'Android', 'Windows Phone', 'BlackBerry OS'],
        correct: 1,
        explanation: 'Android is based on a modified version of the Linux kernel, making it open source through the Android Open Source Project (AOSP).'
    },
    {
        question: 'What year was the first Android phone (HTC Dream) released?',
        options: ['2006', '2007', '2008', '2009'],
        correct: 2,
        explanation: 'The HTC Dream (T-Mobile G1) was released in June 2008 as the first commercially available Android phone.'
    },
    {
        question: 'Which type of operating system requires guaranteed completion of critical tasks within strict time limits?',
        options: ['Multi-tasking OS', 'Network OS', 'Hard Real-Time OS', 'Distributed OS'],
        correct: 2,
        explanation: 'Hard Real-Time Operating Systems guarantee that critical tasks will complete within specified time constraints.'
    },
    {
        question: 'What is the main purpose of an embedded operating system?',
        options: ['General-purpose computing', 'Server management', 'Specific task execution', 'Network routing'],
        correct: 2,
        explanation: 'Embedded OS are designed for specific tasks within larger systems, like mobile devices, ATMs, or automotive systems.'
    },
    {
        question: 'Which mobile OS was originally known as iPhone OS?',
        options: ['Android', 'iOS', 'Windows Phone', 'Symbian'],
        correct: 1,
        explanation: 'Apple\'s mobile operating system was originally called "iPhone OS" when first released in 2007, later renamed to iOS.'
    },
    {
        question: 'What are the two main types of Real-Time Operating Systems?',
        options: ['Single and Multi-user', 'Hard and Soft', 'Embedded and Networked', 'Mobile and Desktop'],
        correct: 1,
        explanation: 'RTOS are classified as Hard Real-Time (must meet deadlines) and Soft Real-Time (should meet deadlines but can tolerate some delays).'
    },
    {
        question: 'Which company developed the Symbian OS for smartphones?',
        options: ['Apple', 'Microsoft', 'Nokia', 'Samsung'],
        correct: 2,
        explanation: 'Nokia developed and maintained Symbian OS, which dominated the smartphone market until the late 2000s.'
    },
    {
        question: 'What does RTOS stand for?',
        options: ['Random Transfer Operating System', 'Real-Time Operating System', 'Remote Terminal Operating System', 'Reduced Time Operating System'],
        correct: 1,
        explanation: 'RTOS stands for Real-Time Operating System, designed for systems with strict timing requirements.'
    },
    {
        question: 'In which year was Google acquired Android Inc.?',
        options: ['2003', '2004', '2005', '2006'],
        correct: 2,
        explanation: 'Google acquired Android Inc. in 2005, before founding the Open Handset Alliance and releasing Android.'
    },
    {
        question: 'What is the primary function of a mobile operating system?',
        options: ['To replace desktop computers', 'To provide an interface between hardware and user', 'To increase phone price', 'To limit functionality'],
        correct: 1,
        explanation: 'A mobile OS provides an interface between the hardware and the user, managing resources and enabling functionality.'
    }
];

let currentQuestion = 0;
let score = 0;

function initQuizSystem() {
    const startBtn = document.getElementById('startQuiz');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }

    document.querySelectorAll('.quiz-option').forEach((option, index) => {
        option.addEventListener('click', () => selectAnswer(index));
    });

    document.getElementById('nextQuestion')?.addEventListener('click', nextQuestion);
    document.getElementById('restartQuiz')?.addEventListener('click', restartQuiz);
}

function startQuiz() {
    document.getElementById('quizStart').classList.remove('active');
    document.getElementById('quizActive').classList.add('active');
    currentQuestion = 0;
    score = 0;
    showQuestion(currentQuestion);
}

function showQuestion(index) {
    const question = quizQuestions[index];
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionNumber').textContent = `Question ${index + 1}/${quizQuestions.length}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, optIndex) => {
        const optionBtn = document.createElement('div');
        optionBtn.className = 'quiz-option';
        optionBtn.textContent = option;
        optionBtn.dataset.index = optIndex;
        optionBtn.addEventListener('click', () => selectAnswer(optIndex));
        optionsContainer.appendChild(optionBtn);
    });

    document.getElementById('explanation').style.display = 'none';
    document.getElementById('nextQuestion').style.display = 'none';
}

function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach((opt, index) => {
        opt.style.pointerEvents = 'none';
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== question.correct) {
            opt.classList.add('incorrect');
        }
    });

    if (selectedIndex === question.correct) {
        score++;
        showNotification('Correct!', 'Well done!');
    } else {
        showNotification('Incorrect', `The answer was: ${question.options[question.correct]}`);
    }

    document.getElementById('explanation').textContent = question.explanation;
    document.getElementById('explanation').style.display = 'block';
    document.getElementById('nextQuestion').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
        showQuestion(currentQuestion);
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizActive').classList.remove('active');
    document.getElementById('quizResults').classList.add('active');

    const percentage = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('finalScore').textContent = `${score}/${quizQuestions.length}`;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;

    let feedback = '';
    if (percentage >= 90) {
        feedback = 'Excellent! You are a mobile OS expert!';
    } else if (percentage >= 70) {
        feedback = 'Great job! You have solid knowledge.';
    } else if (percentage >= 50) {
        feedback = 'Good effort! Keep learning.';
    } else {
        feedback = 'Keep studying! Practice makes perfect.';
    }
    document.getElementById('scoreFeedback').textContent = feedback;
}

function restartQuiz() {
    document.getElementById('quizResults').classList.remove('active');
    document.getElementById('quizStart').classList.add('active');
}

// ==================== Terminal ====================

function initTerminal() {
    const input = document.getElementById('terminalInput');
    if (!input) return;

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
    help: () => `Available commands:
  help     - Show this help message
  whoami   - Display current user
  date     - Show current date/time
  uname    - Display system information
  uptime   - Show system uptime
  clear    - Clear terminal
  echo     - Print text
  neofetch - Display system info
  privacy  - Privacy status report
  security - Security status report
  mobile   - Mobile OS information
  android  - Android details
  ios      - iOS details
  rtos     - RTOS information`,
    whoami: () => 'user',
    date: () => new Date().toString(),
    uname: () => 'FusionOS 1.0.0 Beta',
    uptime: () => {
        const hours = Math.floor(Math.random() * 24);
        const mins = Math.floor(Math.random() * 60);
        return `${hours}:${mins.toString().padStart(2, '0')} up ${hours} hours, ${mins} minutes`;
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
        .-/+oossssoo+/-.`,
    privacy: () => `Privacy Report:
  ✓ Tracker blocking: Active (1,247 blocked)
  ✓ Encryption: Hardware-backed
  ✓ Permission monitoring: Enabled
  ✓ Network hardening: Active
  ✓ On-device AI processing: Enabled
  Privacy Score: 90/100`,
    security: () => `Security Status:
  ✓ Verified boot: Active
  ✓ Encryption: Hardware-backed AES-256
  ✓ App sandboxing: Enabled
  ✓ SELinux: Enforcing
  ✓ Network hardening: Active
  ✓ Biometric security: 5-attempt limit
  Security Grade: A+`,
    mobile: () => `Mobile OS Information:
  Android: Google, Linux-based, Open Source
  iOS: Apple, XNU kernel, Closed Source
  Symbian: Nokia, Dominated 2000-2010
  BlackBerry: RIM, Enterprise focus
  Windows Phone: Microsoft, Modern UI`,
    android: () => `Android OS Details:
  First release: September 2008
  Latest: Android 15 (2024)
  Kernel: Modified Linux
  Languages: Java, Kotlin
  Market Share: ~70% globally`,
    ios: () => `iOS Details:
  First release: June 2007
  Latest: iOS 18 (2024)
  Kernel: XNU (Mach + BSD)
  Languages: Swift, Objective-C
  Market Share: ~25% globally`,
    rtos: () => `Real-Time OS Information:
  Types: Hard RTOS & Soft RTOS
  Hard RTOS: Must meet deadlines
  Soft RTOS: Should meet deadlines
  Mobile uses: Camera, Audio, Sensors
  Examples: QNX, VxWorks, FreeRTOS`
};

function processCommand(input) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.textContent = `user@fusionos:~$ ${input}`;
    output.appendChild(cmdLine);

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

    setTimeout(() => {
        addNotification('FusionOS Learn', '📚', 'Welcome!', 'Start learning about mobile operating systems', 'now');
    }, 2000);
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

    const aiContent = document.querySelector('.ai-content');
    if (aiContent) {
        const queryEl = document.createElement('div');
        queryEl.style.cssText = 'padding: 12px 16px; background: var(--bg-secondary); border-radius: 12px; margin: 0 16px; font-size: 14px;';
        queryEl.textContent = `You: ${query}`;
        aiContent.insertBefore(queryEl, aiContent.querySelector('.ai-welcome').nextSibling);

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

initAIAssistant();

// ==================== Desktop Mode ====================

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==================== Keyboard Shortcuts ====================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeControlCenter();
        closeNotificationPanel();
        closeModule();
        exitDesktopMode();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        enterDesktopMode();
    }
});

// ==================== Modal Functions ====================

function showAboutModal() {
    document.getElementById('aboutModal').classList.add('active');
}

function closeModal() {
    document.getElementById('aboutModal').classList.remove('active');
}

document.getElementById('aboutModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ==================== Long Press for About ====================

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

// Add About app to grid
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
console.log('%cEducational content from academic sources', 'font-size: 12px; color: #34c759;');
