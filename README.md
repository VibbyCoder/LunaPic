# LunaPic 🌙

A lightning-fast, lightweight Windows image viewer built with Electron. Designed with a frameless, pitch-black AMOLED aesthetic and a sleek glassmorphism HUD, LunaPic gets out of the way so your images take center stage.

## ✨ Features
* **AMOLED & Glass UI:** Frameless window design with an auto-hiding frosted glass heads-up display (HUD).
* **Smart Zoom:** Scroll wheel zooming and precise double-click-to-zoom (centers perfectly on your cursor).
* **Native Performance:** Bypasses standard browser protocols to stream local files directly via Node.js for instant loading.
* **Rich Metadata:** Instantly view file size, resolution, aspect ratio, and modified dates on hover.
* **Seamless Navigation:** Arrow key navigation, click-to-browse, and drag-and-drop support.
* **Portable:** Run it as a standalone executable without installing, or install it system-wide.

## 🛠️ Prerequisites
To run or build this project from source, you will need:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* Git

## 🚀 How to Run (Development)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/lunapic.git](https://github.com/yourusername/lunapic.git)
   cd lunapic
2. **Install dependencies:**
   ```bash
   npm install
3. **Start the app:**
   ```bash
   npm start
## How to Build
To package LunaPic into standalone Windows binaries (Installer and Portable .exe), run:
   ```bash
npm run build
