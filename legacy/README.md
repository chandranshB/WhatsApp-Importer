# WhatsApp Export Viewer

<div align="center">

**A secure, client-side WhatsApp chat export viewer with customizable themes.**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture) • [Privacy](#privacy)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/Dependencies-0-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>

---

## Features

- **Universal Format Support**: Import `.txt` or `.zip` WhatsApp exports from both Android and iOS platforms.
- **Multiple Themes**: Includes high-fidelity representations of WhatsApp and iMessage interfaces.
- **Rich Media Display**: Full support for viewing images, videos, audio, documents, and GIFs included in `.zip` exports.
- **Persistent Storage**: Utilizes IndexedDB for local, client-side persistence of imported chat data.
- **Smart Search**: Real-time filtering capabilities for imported conversations.
- **Infinite Scroll**: Optimized rendering pipeline capable of handling thousands of messages efficiently.
- **Multi-Chat Management**: Isolate, import, and organize multiple chat histories concurrently.
- **Zero Dependencies**: Developed with vanilla JavaScript; executes entirely offline post-load.
- **Data Privacy**: Strictly client-side execution ensures no data transmission to external servers.

---

## Installation

### Option 1: Direct Usage

```bash
git clone https://github.com/yourusername/whatsapp-reader.git
cd whatsapp-reader
```

Open `index.html` in any modern web browser. The application requires no build process or dependency installation.

### Option 2: Local Server (Recommended for Media Support)

To ensure full compatibility with local file access restrictions in modern browsers (specifically for ZIP media support), serving the application over HTTP is recommended.

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (requires http-server)
npx http-server
```

Navigate to `http://localhost:8000` in your browser.

---

## Usage

### Exporting from WhatsApp

**Android / iOS:**
1. Open the target WhatsApp conversation.
2. Access the menu (three dots) -> **More** -> **Export chat**.
3. Select **Include Media** or **Without Media** based on your requirements.
4. Save the generated `.txt` or `.zip` file locally.

### Importing to WhatsApp Export Viewer

1. Launch `index.html` in your browser.
2. Use the import function to load your `.txt` or `.zip` export file.
3. Identify the primary user (the account from which the export was generated) to correctly map outgoing messages.
4. The chat will be parsed and rendered immediately.

### Supported File Formats

| File Type | Format | Media Support |
|-----------|--------|---------------|
| `.txt` | Plain text export | None |
| `.zip` | Archive containing `.txt` and media | Images, video, audio, documents |

---

## Architecture

WhatsApp Export Viewer is built on a modular, component-based architecture using vanilla JavaScript to minimize footprint and maximize performance.

### Project Structure

```text
whatsapp-reader/
├── index.html              # Main application entry point
├── assets/
│   ├── jszip.min.js        # ZIP archive manipulation (sole dependency)
│   └── wallpaper-wa.png    # Default background asset
├── css/
│   ├── base.css            # Core layout and styling
│   ├── sidebar.css         # Chat navigation styling
│   ├── chat.css            # Message rendering styles
│   ├── animations.css      # Transition definitions
│   └── themes/             # Pluggable UI themes
│       ├── whatsapp.css    
│       └── imessage.css    
└── js/
    ├── app.js              # Application initialization
    ├── parser.js           # Export format parsing engine
    ├── renderer.js         # DOM manipulation and view updates
    ├── storage.js          # IndexedDB abstraction layer
    ├── themeManager.js     # UI theme state management
    └── scrollManager.js    # Virtualization and scroll handling
```

### Technical Implementation

- **Memory Management**: Employs DOM virtualization techniques to maintain performance when rendering extensive chat histories.
- **State Persistence**: 
  - Chat data and application state are stored securely in IndexedDB.
  - Media assets utilize auto-revoking Blob URLs to prevent memory leaks.
  - Theme preferences are retained via LocalStorage.
- **Parsing Engine**: Robust regular expression parsing handles disparate formatting across Android/iOS exports, varying time formats, and multi-line messages.

---

## Privacy and Security

WhatsApp Export Viewer operates on a strict zero-trust model regarding user data:

- **Client-Side Only**: All data processing and rendering occurs locally within the browser context.
- **No Telemetry**: The application includes no tracking, analytics, or external telemetry of any kind.
- **Offline Capability**: Once the initial assets are loaded, the application functions entirely offline.

To purge data, users may delete individual chats via the interface or clear their browser's site data.

---

## Compatibility

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome  | 60+             | Fully Supported |
| Firefox | 55+             | Fully Supported |
| Safari  | 11+             | Fully Supported |
| Edge    | 79+             | Fully Supported |

**Required Browser APIs:**
- IndexedDB
- FileReader API
- URL.createObjectURL (Blob URLs)
- ES6 JavaScript support

---

## Development and Contribution

Contributions to the project are evaluated via pull requests. 

### Guidelines

- Maintain the zero-dependency philosophy for the core engine (excluding necessary utilities like JSZip).
- Adhere to vanilla JavaScript (ES6+) standards without transpilation.
- Follow BEM methodology for CSS additions.
- Ensure all modules remain self-contained via IIFE patterns to prevent global scope pollution.

### Roadmap

- Implementation of full-text indexing and search.
- Bidirectional export capabilities (re-exporting to `.txt`).
- Native dark mode system integration.
- Analytical tools for chat statistics.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for full terms and conditions.

---

<div align="center">

**Developed for privacy-conscious data portability.**

</div>
