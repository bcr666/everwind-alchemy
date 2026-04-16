# Everwind Alchemy Web App

A simple, lightweight, **static web application** for exploring alchemy items and their effects in Everwind.
No backend, no build tools—just open it and go.

---

## 📦 Project Structure

```
everwind-alchemy/
│
├── index.html        # Main application page
│
├── items.json        # Item data
├── effects.json      # Effect definitions
│
├── images/           # Item images
│   ├── item1.png
│   ├── item2.png
│   └── ...
│
└── README.md
```

---

## 🚀 Getting Started

### Option 1: Open Directly (Simplest)

1. Download or clone the repository:

   ```
   git clone https://github.com/yourusername/everwind-alchemy.git
   ```
2. Navigate to the folder
3. Double-click `index.html`

> ⚠️ Note: Some browsers may block loading local JSON files due to security restrictions.

---

### Option 2: Run a Local Server (Recommended)

Running a local server avoids issues with loading JSON files.

#### 🐍 Using Python (easy)

If you have Python installed:

```
cd everwind-alchemy
python -m http.server 8000
```

Then open your browser and go to:

```
http://localhost:8000
```

---

#### 🟢 Using Node.js

If you have Node.js installed:

```
npx serve .
```

---

## 🧪 Features

* 🔍 Lookup items and view their effects
* 🧪 Filter potions by one or more alchemy effects
* 🖼️ Display item images dynamically
* 📱 Responsive layout (works on desktop and mobile)

---

## 🗂️ Data Files

### `items.json`

Contains item definitions and their associated effects. Alchemy effects is an array even when there is only one effect.

---

### `effects.json`

Defines all possible alchemy effects. And the location of their respective images.

---

## 🖼️ Images

* All images should be placed in the `/images` folder
* Reference images in `items.json` and `effects.json` using `/images/{image file name}`

---

## ⚙️ Customization

You can easily extend the app by:

* Adding new items to `items.json`
* Adding new effects to `effects.json`
* Dropping new images into the `/images` folder
* Updating the UI in `index.html`

---

## 🛠️ Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* JSON (data storage)

---

## 📄 License

Feel free to use, modify, and share this project as needed.

---

## 🙌 Contributing

If you’d like to improve this app:

1. Fork the repo
2. Make your changes
3. Submit a pull request

---

## 💡 Notes

This project is intentionally kept simple—no frameworks, no dependencies—so anyone can run it with minimal setup.

If something doesn’t work, it’s almost always due to how your browser handles local files. When in doubt, use a local server.

---
