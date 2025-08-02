# 📰 Dynamic News Pulse

**Dynamic News Pulse** is a modern, full-stack web application that delivers real-time, sentiment-aware news updates. Built with React and Firebase, it integrates push notifications, authentication, and data visualizations to provide an engaging, personalized news experience.

🔗 **Live Demo:** [https://dynamic-news-pulse.vercel.app](https://dynamic-news-pulse-43jhlg5if-sandeep-kasiraju-projects.vercel.app)

---

## 🚀 Key Features

- **🔐 Secure Authentication** via Firebase (Email/Password)
- **🔔 Real-Time Push Notifications** with Firebase Cloud Messaging (FCM)
- **🧠 Live News Feed** from the GNews API
- **📊 Interactive Sentiment Charts** powered by Chart.js
- **🔖 Save Articles** for later reading
- **🔎 Filter by Category or Keyword** (Tech, Sports, Business, etc.)
- **💡 Smooth, Responsive UI** with Tailwind CSS and dynamic animations

---

## 🛠️ Tech Stack

### Frontend
- React (Create React App)
- Tailwind CSS
- Chart.js

### Backend / Infra
- Node.js (for notification triggers)
- Firebase Cloud Firestore
- Firebase Authentication
- Firebase Cloud Messaging (FCM)

### External APIs
- GNews API

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16+)
- Firebase Project with FCM enabled
- GNews API Key

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dynamic-news-pulse.git
cd dynamic-news-pulse
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_GNEWS_API_KEY=your_gnews_api_key
REACT_APP_FIREBASE_VAPID_KEY=your_fcm_vapid_key
```

### 4. Add Firebase Service Account

Place your Firebase service account credentials in:

```
public/serviceAccountKey.json
```

> ⚠️ **Never commit this file to version control.**

---

## ▶️ Running Locally

```bash
npm start
```

Navigate to: [http://localhost:3000](http://localhost:3000)

You can:

* Register or sign in using email/password
* Browse news by categories or search
* Save favorite articles
* Receive push notifications

---

## 🌐 Deployment

* **Frontend:** Deployed via [Vercel](https://vercel.com)
* **Backend Notifications:** Triggered using Firebase Cloud Functions

---

## 🔐 Security Best Practices

Ensure the following are in your `.gitignore`:

```
.env
serviceAccountKey.json
node_modules/
```

> Keep all credentials and secrets out of your repository.

---

## 📚 Project Goals

This project was built to explore and integrate:

* Real-time API consumption
* Cloud messaging and notifications
* User authentication and data persistence
* Frontend data visualization (Chart.js)
* Full-stack deployment and CI/CD workflows

---

## 📄 License

MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

Special thanks to the GNews API team and Firebase community for enabling open access to powerful tools that fuel innovation.


