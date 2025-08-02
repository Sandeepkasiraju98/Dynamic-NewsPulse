# 📰 Dynamic News Pulse

Dynamic News Pulse is a full-stack React web application that delivers real-time news updates using the GNews API and Firebase. It features user authentication, push notifications (FCM), search and category filters, and interactive sentiment-based data visualizations.

---

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password)
- 🔔 Push Notifications using Firebase Cloud Messaging (FCM)
- 🧠 Real-time news feed using GNews API
- 📊 Interactive sentiment-based charts with Chart.js
- 📁 Save and view favorite articles
- 🌐 Category & keyword filters (e.g., Tech, Sports, Business)
- 🌈 Responsive UI with Tailwind CSS & animated gradient themes

---

## 📦 Tech Stack

### Frontend
- React
- Tailwind CSS
- Chart.js

### Backend
- Node.js (for breaking news delivery)
- Firebase Cloud Firestore
- Firebase Authentication
- Firebase Cloud Messaging (FCM)

### APIs
- GNews API

---

## 💻 Installation

### Pre-requisites

- Node.js (v16+)
- Firebase Project (with service account credentials)
- GNews API Key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/dynamic-news-pulse.git
cd dynamic-news-pulse
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env` file

Create a `.env` file in the root folder and add:

```env
REACT_APP_GNEWS_API_KEY=your_gnews_api_key
REACT_APP_FIREBASE_VAPID_KEY=your_fcm_vapid_key
```

### 4. Add Firebase credentials

Save your Firebase service account key as:

```
public/serviceAccountKey.json
```

> ⚠️ **Do not commit this file to GitHub!**

---

## ▶️ How to Run

```bash
npm start
```

Then open your browser and visit:
[http://localhost:3000](http://localhost:3000)

### What you can do:

* Sign up or log in using email/password
* Browse news by category or search keywords
* Click 🔖 to save favorite articles
* Get push alerts for breaking news

---

## 🌍 Deployment

You can deploy using:

* **Frontend:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
* **Backend:** Firebase Functions (for breaking news notification delivery)

---

## 🔐 Security Notice

Ensure the following files are added to your `.gitignore`:

```
.env
serviceAccountKey.json
node_modules/
```

> Never commit API keys or secrets to GitHub.

---

## 🙌 Credits

This app was built as a full-stack project to explore:

* Real-time data APIs
* Firebase Auth & FCM
* Chart.js visualizations
* React + Tailwind animations
* Backend trigger notifications

---

## 📄 License

This project is licensed under the MIT License.


