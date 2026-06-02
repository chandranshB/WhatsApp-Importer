# 💬 ChatView – WhatsApp Chat Reader

<div align="center">

**A beautiful, privacy-first WhatsApp chat viewer with multiple themes**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Themes](#themes) • [Privacy](#privacy)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/Dependencies-0-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>

---

## ✨ Features

- 📱 **Universal Format Support** – Import `.txt` or `.zip` WhatsApp exports from Android & iOS
- 🎨 **Multiple Themes** – Switch between WhatsApp and iMessage styles
- 🖼️ **Rich Media Display** – View images, videos, audio, documents, and GIFs from `.zip` exports
- 💾 **Persistent Storage** – Chats are saved locally using IndexedDB
- 🔍 **Smart Search** – Filter through your imported chats instantly
- 📜 **Infinite Scroll** – Smooth navigation through thousands of messages
- 🌓 **Theme Switching** – Seamlessly switch visual themes without losing your place
- 📂 **Multi-Chat Management** – Import and organize multiple conversations
- 🚀 **No Dependencies** – Pure vanilla JavaScript, runs entirely offline
- 🔒 **100% Private** – All data stays in your browser, nothing leaves your device

---

## 🎬 Demo

Import your WhatsApp chat export and watch it come to life with a beautiful, familiar interface.

### WhatsApp Theme
Classic green bubbles with the iconic WhatsApp wallpaper – feels just like home.

### iMessage Theme
Clean, modern blue and grey bubbles with Apple's signature design language.

---

## 🚀 Installation

### Option 1: Clone & Open

```bash
git clone https://github.com/yourusername/whatsapp-reader.git
cd whatsapp-reader
```

Open `index.html` in your browser – that's it! No build process, no npm install, no webpack.

### Option 2: Download ZIP

1. Download this repository as a ZIP file
2. Extract it anywhere on your computer
3. Open `index.html` in any modern browser

### Option 3: Serve Locally

If you prefer a local server (recommended for full ZIP media support):

```bash
# Python 3
python -m http.server 8000

# Node.js (if http-server is installed)
npx http-server
```

Then visit `http://localhost:8000`

---

## 📖 Usage

### Exporting from WhatsApp

#### On Android/iOS:
1. Open the WhatsApp chat you want to export
2. Tap the **⋮** (three dots) menu → **More** → **Export chat**
3. Choose **Include Media** (for images/videos) or **Without Media** (text only)
4. Save the export file to your device

### Importing to ChatView

1. **Launch the app** – Open `index.html` in your browser
2. **Import your chat** – Click the **+** button or drag & drop your `.txt` or `.zip` file
3. **Identify yourself** – Select which name is you (the person who exported the chat)
4. **Enjoy!** – Your chat appears with beautiful styling and smooth scrolling

### Supported Files

| File Type | Format | Media Included |
|-----------|--------|----------------|
| `.txt` | Plain text export | ❌ No media |
| `.zip` | Archive with `.txt` + media files | ✅ Images, videos, audio, documents |

---

## 🎨 Themes

ChatView comes with two carefully crafted themes:

### 🟢 WhatsApp Theme
- Authentic green outgoing messages (`#DCF8C6`)
- WhatsApp's classic teal header
- Iconic chat wallpaper background
- System messages styled like the real app

### 🔵 iMessage Theme
- iOS-style blue bubbles for your messages
- Clean grey bubbles for incoming messages
- Smooth gradient backgrounds
- Apple San Francisco font styling

**Switch themes instantly** using the 🎨 palette button in the sidebar.

---

## 🗂️ Project Structure

```
whatsapp-reader/
├── index.html              # Main HTML file
├── assets/
│   ├── jszip.min.js       # ZIP file handling (only dependency)
│   └── wallpaper-wa.png   # WhatsApp background texture
├── css/
│   ├── base.css           # Global styles & layout
│   ├── sidebar.css        # Chat list sidebar
│   ├── chat.css           # Message view
│   ├── animations.css     # Transitions & effects
│   └── themes/
│       ├── whatsapp.css   # WhatsApp theme
│       └── imessage.css   # iMessage theme
└── js/
    ├── app.js             # Main app orchestrator
    ├── parser.js          # WhatsApp export format parser
    ├── renderer.js        # DOM rendering engine
    ├── storage.js         # IndexedDB persistence layer
    ├── themeManager.js    # Theme switching logic
    └── scrollManager.js   # Scroll state & auto-load
```

---

## 🔧 Technical Highlights

### Architecture
- **Modular Design** – Each JS module has a single, clear responsibility
- **Memory Efficient** – Only renders visible messages, loads earlier content on demand
- **Scroll Preservation** – Remembers your exact position when switching chats
- **Smart Parsing** – Handles Android & iOS formats, 12h/24h times, multi-line messages

### Browser Storage
- **IndexedDB** for chat messages and metadata
- **Blob URLs** for media files (session-scoped, auto-cleaned)
- **LocalStorage** for theme preference

### Media Handling
When you import a `.zip` export:
1. Extracts all media files (images, videos, audio, documents)
2. Creates in-memory Blob URLs for instant access
3. Matches media files to messages by filename
4. Automatically revokes Blobs when chats are deleted

---

## 🔒 Privacy & Security

**Your data never leaves your device.** ChatView is a 100% client-side application:

- ✅ No server communication
- ✅ No analytics or tracking
- ✅ No external API calls
- ✅ All data stored locally in your browser
- ✅ Works completely offline after first load

**What gets stored?**
- Chat messages (IndexedDB)
- Media files (temporary Blob URLs, cleared on page close)
- Theme preference (LocalStorage)

**Clearing your data:**
- Delete individual chats using the 🗑️ button
- Clear all data by clearing your browser storage

---

## 🌐 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |

**Required APIs:**
- IndexedDB
- FileReader API
- Blob URLs
- ES6+ JavaScript

---

## 🐛 Known Limitations

- **Date Parsing** – Ambiguous date formats (DD/MM vs MM/DD) use international format (DD/MM) as default
- **Group Chats** – Fully supported, but participant avatars are auto-generated from names
- **Encrypted Media** – Cannot decrypt media from encrypted backups (use WhatsApp's export feature)
- **Storage Limits** – Browser storage quotas apply (~50MB–10GB depending on browser)

---

## 🛠️ Development

Want to contribute or customize?

### Prerequisites
- A modern browser
- A text editor
- (Optional) A local web server for testing

### Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/whatsapp-reader.git
cd whatsapp-reader

# No build step needed! Just open index.html or serve locally:
python -m http.server 8000
```

### Code Style
- **Vanilla JavaScript** – No frameworks, no transpilers
- **Modern ES6+** – Classes, arrow functions, async/await
- **IIFE Modules** – Self-contained, no global pollution
- **BEM CSS** – Consistent, scalable naming conventions

---

## 📝 FAQ

**Q: Can I import multiple chats?**  
A: Yes! Import as many chats as you want and switch between them from the sidebar.

**Q: Will my chats sync across devices?**  
A: No, chats are stored locally in your browser. Export them from each device separately.

**Q: Can I search within messages?**  
A: Currently, you can filter the chat list by name. Full-text message search is planned for a future release.

**Q: What happens if I run out of storage?**  
A: The app will show a warning and keep the chat viewable for the current session, but it won't persist after refresh.

**Q: Can I export my chats back to .txt?**  
A: Not yet – this feature is on the roadmap!

---

## 🗺️ Roadmap

- [ ] Full-text message search across all chats
- [ ] Export chats back to `.txt` format
- [ ] Dark mode variants for both themes
- [ ] Reply/quote message highlighting
- [ ] Starred messages view
- [ ] Chat statistics & analytics
- [ ] Custom theme creator

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or pull requests:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **JSZip** – For ZIP file handling
- **WhatsApp** – For the export format
- **Apple** – For iMessage design inspiration
- **You** – For using and supporting this project!

---

<div align="center">

**Made with ❤️ for privacy-conscious chat readers**

⭐ Star this repo if you find it useful!

</div>
