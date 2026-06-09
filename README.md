# 📱 WhatsApp Chat History Reader

[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![JSZip](https://img.shields.io/badge/JSZip-3.10.1-FFDE00?logo=javascript&logoColor=black)](https://stuk.github.io/jszip/)
[![React Virtuoso](https://img.shields.io/badge/React_Virtuoso-4.18.7-FF4081)](https://virtuoso.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A privacy-focused, premium web application designed to load, parse, and browse WhatsApp chat history exports. With an interface inspired by modern messaging apps, this tool lets you visualize conversation transcripts, view attached media (images, videos, voice notes, stickers, and documents), and search through messages at blazing speeds.

---

## 🔒 Privacy First by Design

**Your data never leaves your computer.**
* **Local Parsing**: The chat log parsing is performed completely inside your browser using JavaScript.
* **IndexedDB Media Storage**: When you import a `.zip` archive, images and other media are extracted using `JSZip` and saved directly in your browser's local **IndexedDB** storage. No server uploads, no cloud APIs, and no tracking.

---

## ✨ Key Features

* 📁 **Drag & Drop Import**: Drop your exported WhatsApp `.txt` or `.zip` file anywhere on the screen to import.
* ⚡ **High-Performance Virtualization**: Powered by `react-virtuoso`, the app renders conversation lists of 50,000+ messages smoothly, maintaining a constant 60 FPS.
* 🖼️ **Media Attachment Support**: View images, watch videos, listen to audio files/voice messages, view stickers, and open documents directly in the chat bubbles.
* 🎨 **Interactive Themes**: Switch dynamically between standard **WhatsApp style** (with customizable WhatsApp wallpapers) and elegant **iMessage style**.
* 🔍 **Dual Search Engines**:
  * **Sidebar Search**: Search and filter through the list of conversations and contacts.
  * **Chat Search**: Locate specific messages by keyword within the currently active conversation.
* ✏️ **Contact Aliasing**: Rename participants or phone numbers to clean up usernames (saved locally).
* 📅 **Smart Date Grouping**: Messages are separated into chronological sections (e.g. *Today*, *Yesterday*, *Monday*, *March 14, 2026*).

---

## 🛠️ Tech Stack & Dependencies

* **Core**: React 19 (Hooks, Context API)
* **Build System**: Vite 8 (Hot Module Replacement)
* **Parsing & Zip Extraction**: [JSZip](https://github.com/Stuk/jszip)
* **Virtualization**: [React Virtuoso](https://github.com/upleveled/react-virtuoso)
* **Icons**: [Lucide React](https://github.com/lucide/lucide)
* **Styles**: Vanilla CSS (CSS Variables for dynamic dark/light and app themes)

---

## 📁 Project Structure

```text
WhatsApp Reader/
├── public/                # Static assets
├── src/
│   ├── assets/            # App icons and default wallpapers
│   ├── components/
│   │   ├── Chat/          # Chat panels, message lists, bubbles, media views
│   │   ├── Sidebar/       # Sidebar list, search, and theme settings
│   │   └── Modals/        # Drag & drop overlay, contact renaming modal
│   ├── config/            # Themes definition (WhatsApp vs. iMessage)
│   ├── context/           # ChatContext (global state management)
│   ├── hooks/             # useFileImport, useChatStorage, useMediaStore, useThemeManager
│   ├── styles/            # Theme variables and structural CSS rules
│   ├── utils/             # WhatsApp parsing logic, IndexedDB storage wrapper
│   ├── App.jsx            # Main app shell & overlay setups
│   └── main.jsx           # React app mount
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### ⚙️ Installation
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/whatsapp-importer.git
   cd "WhatsApp Reader"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 💻 Development Server
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 📦 Production Build
To build the app for production:
```bash
npm run build
```
The production-ready assets will be generated in the `dist/` directory, which can be hosted on any static hosting provider (e.g. GitHub Pages, Vercel, Netlify).

### 🧹 Linting
To check and lint files:
```bash
npm run lint
```

---

## 📤 How to Export your WhatsApp Chat

To view your chats in the WhatsApp Reader, you will need to export them from your device.

### 🤖 From Android
1. Open the chat (individual or group) you want to export.
2. Tap the **Three Dots Menu** (top-right corner) and select **More**.
3. Tap **Export Chat**.
4. Select whether to export **Without Media** (creates a single `.txt` file) or **Include Media** (creates a `.zip` archive containing your text and all photos, videos, and audio).
5. Save the generated `.txt` or `.zip` file to your computer or cloud drive.

### 🍏 From iOS (iPhone)
1. Open the chat (individual or group) you want to export.
2. Tap on the **Contact Name** or **Group Topic** at the top of the screen.
3. Scroll down and tap **Export Chat**.
4. Choose **Without Media** or **Attach Media**.
5. Save the exported `.zip` or `.txt` file via AirDrop, Email, or Files.

---

## 💡 Usage Tip
For the best experience, export **With Media** and drag the resulting `.zip` file directly into the browser window. The app will extract the chat log and display all images, stickers, videos, and voice memos right in the feed!

---

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.
