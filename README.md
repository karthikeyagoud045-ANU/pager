# ⚡ TermView

**CLI Virtual Phone Preview Tool** - Real-time mobile previews in your terminal.

[![npm version](https://badge.fury.io/js/termview.svg)](https://www.npmjs.com/package/termview)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 🚀 Features

- **Zero API Dependency**: 100% local processing. Works offline, ensures code privacy, zero cloud costs.
- **Ultra-Lightweight**: Replaces heavy emulators with a minimal CLI footprint (<100MB RAM).
- **Spontaneous Hot-Reload**: Automatically detects codebase changes and instantly updates the preview (<500ms).
- **Terminal-First**: Designed for developers who prefer staying in the CLI.
- **QR Code Access**: Scan to test on real physical devices on your local network.
- **Framework Agnostic**: Works with any web project (React, Vue, vanilla HTML/CSS/JS, etc.).

## 📦 Installation

```bash
npm install -g termview
```

Or use it without installation:

```bash
npx termview
```

## 🎯 Quick Start

Navigate to your project directory and run:

```bash
termview
```

That's it! Your local server will start at `http://localhost:3000` with hot-reload enabled.

### Basic Usage

```bash
# Serve current directory on default port (3000)
termview

# Serve a specific directory
termview ./dist

# Use a custom port
termview --port 8080

# Disable QR code generation
termview --no-qr

# Bind to all network interfaces (for remote access)
termview --host 0.0.0.0

# Use a custom config file
termview --config ./my-config.js
```

## ⌨️ Keyboard Shortcuts

When TermView is running, use these keyboard shortcuts:

| Key | Action |
|-----|--------|
| `q` | Quit the server |
| `r` | Manually trigger reload on all connected devices |
| `o` | Open preview in default browser |
| `h` | Show help menu |

## 📁 Configuration

Create a `termview.config.js` file in your project root:

```javascript
module.exports = {
  // Directory to serve (default: '.')
  rootDir: './dist',
  
  // Port to run the server on (default: 3000)
  port: 3000,
  
  // Host to bind to (default: 'localhost')
  host: 'localhost',
  
  // Show QR code for device testing (default: true)
  showQR: true,
  
  // Additional ignore patterns for file watching
  ignore: [
    '**/*.test.js',
    '**/*.spec.ts',
    '**/coverage/**'
  ]
};
```

## 🔧 How It Works

1. **Local HTTP Server**: TermView spins up a lightweight HTTP server to serve your static files.
2. **WebSocket Injection**: Automatically injects a small WebSocket client script into your HTML pages.
3. **File Watching**: Uses `chokidar` to monitor your filesystem for changes.
4. **Hot Reload**: When a file changes, TermView broadcasts a reload signal via WebSocket to all connected browsers/devices.

```
[ User Terminal ]
       │
       ▼
[ CLI Parser ] ──> [ Config Manager ]
       │
       ▼
[ Core Orchestrator ]
       │
       ├──> [ File Watcher ] ──(changes)──> [ Event Bus ]
       │                                         │
       ├──> [ HTTP Server ] <────────────────────┤
       │         │                               │
       │         └──> [ Static Files ]           │
       │                                         │
       └──> [ WebSocket Server ] ──(reload)──> [ Connected Clients ]
```

## 🎨 Terminal UI

When you run TermView, you'll see a beautiful terminal dashboard:

```
╭────────────────────────────────────────────────╮
│                                                │
│   ⚡ TermView v1.0.0                           │
│                                                │
│   🚀 Server Running on http://localhost:3000   │
│   🌐 Network:   http://192.168.1.10:3000       │
│                                                │
│   📂 Watching: /path/to/project                │
│   👥 Devices: 2                                │
│                                                │
╰────────────────────────────────────────────────╯

📱 Scan QR for Real Device:
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀█▀▄▀█ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀█ ▄█ █   █ █
█ █▄▄▄█ █▀  █▄▄▀▄▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ ▀▄█ █ █▄▄▄▄▄▄▄█
...

[q] Quit  [r] Reload  [o] Open Browser  [h] Help
```

## 🛠 Technical Details

### Default Ignore Patterns

TermView automatically ignores these directories:
- `node_modules`
- `.git`
- `dist`
- `build`

### Supported File Types

TermView serves all file types with proper MIME types:
- HTML, CSS, JavaScript
- Images (PNG, JPG, GIF, SVG, ICO)
- Fonts (WOFF, WOFF2, TTF, EOT)
- JSON

### Performance Targets

| Metric | Target |
|--------|--------|
| Startup Time | < 2 seconds |
| Hot Reload Latency | < 500ms |
| Memory Footprint | < 100MB |
| CPU Usage (idle) | < 5% |

## 🔒 Security & Privacy

- **Zero Telemetry**: No data collection, analytics, or crash reporting.
- **Localhost Default**: Server binds to `localhost` by default.
- **No External APIs**: No outbound HTTP/WebSocket requests to the public internet.
- **Your Code Stays Local**: Never uploaded to third-party servers.

## 📋 Requirements

- Node.js 16.x, 18.x, or 20.x (LTS versions)
- npm, yarn, or pnpm

## 🌍 Compatibility

- macOS (Intel/Apple Silicon)
- Linux (Ubuntu/Debian/Arch)
- Windows 10/11 (WSL and native CMD/PowerShell)

## 🚧 Roadmap

### v1.1.0 (Planned)
- CSS Hot-Swap (inject styles without full page reload)

### v1.2.0 (Planned)
- Framework auto-detection (React, Vue, Vite optimizations)

### v2.0.0 (Planned)
- Plugin system for custom terminal widgets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ for developers who love the terminal.
