# FusionOS Source Code

This directory contains the complete source code for the FusionOS web-based mobile operating system simulation.

## Structure

```
src/
├── index.html              # Main HTML entry point
├── styles.css              # Core CSS styles
├── enhanced_styles.css     # Enhanced educational content styles
├── app.js                  # Core application JavaScript
└── enhanced_app.js         # Enhanced educational features JavaScript

public/
├── icon.svg                # App icon
└── manifest.json           # PWA manifest

dist/                       # Production build output (generated)
```

## Running Locally

### Using a Web Server

```bash
# Python 3
python -m http.server 8080

# Node.js with npx
npx serve .

# PHP
php -S localhost:8080
```

### Using Vite (Recommended)

```bash
npm install
npm start
```

## Features

- **Mobile OS Simulation**: Complete lock screen, home screen, and app interfaces
- **Privacy Dashboard**: Real-time permission monitoring and tracker blocking
- **Security Center**: Encryption status, verified boot, app sandboxing
- **FusionAI**: On-device AI assistant with privacy-first processing
- **Convergence Mode**: Desktop experience with windowed applications
- **Educational Content**: Modules on mobile OS concepts, history, and quiz
- **Functional Apps**: Calculator, Terminal, Camera, Settings, etc.

## Technologies

- HTML5 for semantic structure
- CSS3 for modern styling and animations
- JavaScript (ES6+) for application logic
- Vite for build tooling

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+
- Mobile browsers with ES6 support

## License

MIT License - see LICENSE file for details.
