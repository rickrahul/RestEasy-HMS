# 🏨 Rest Easy – Hotel Management System

**Rest Easy** is a comprehensive hotel management system designed for hotels and hospitality businesses. It offers a full suite of front desk and back-office functionalities including room booking, staff management, admin dashboards, and a responsive user interface. Built with HTML, CSS, JavaScript, and MongoDB, this project provides both customer-facing and admin-facing features optimized for real-world hotel operations.

🌐 Live Demo: [Rest Easy HMS]( https://hms-by82.onrender.com/ )

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (with Express if applicable)  
- **Database:** MongoDB  
- **Hosting:** Render

---

## ✨ Features

### 👤 Customer Features
- Room booking interface with available room listing (`rooms2.html`, `@rooms.html`)
- Booking confirmation page (`confirm.html`)
- Customer registration and login (`register.html`, `signup.html`)
- Contact form (`contactus.html`)
- Hotel video tour (`hotel-tour.mp4` embedded)

### 🧑‍💼 Admin & Staff Features
- Admin dashboard for managing rooms, staff, and bookings (`admin.html`, `dashboard.html`)
- Staff login and attendance tracking (`stafflogin.html`, `staffattendance.html`)
- Receptionist portal and login (`receptionist-login.html`)
- Booking management interface (`bookingpage.html`, `@payment.html`)
- Staff and room detail pages (`staff.html`, `rooms2.html`)

### 🌟 General Site Features
- About Us page (`aboutus.html`)
- Main homepage (`index.html`, `mainpage.html`)
- Clean layout and responsive design using multiple CSS stylesheets (`style.css`, `style1.css`, etc.)
- Informative pages like features, dash, and find account

---

## 📁 Folder & File Structure

```
rest-easy/
├── .env
├── node_modules/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── aboutus.html
│   ├── bookingpage.html
│   ├── confirm.html
│   ├── contactus.html
│   ├── dashboard.html
│   ├── ...
├── styles/
│   ├── style.css
│   ├── style1.css
│   ├── style2.css
│   └── ...
├── assets/
│   ├── RESTEASY (1).png
│   ├── cu.png
│   ├── img.jpg
│   ├── hotel-tour.mp4
│   └── ...
```

---

## 📋 Getting Started

### Prerequisites
- Node.js
- MongoDB (installed locally or use MongoDB Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rest-easy-hms.git

# Navigate to project folder
cd rest-easy-hms

# Install dependencies
npm install

# Start the server
node server.js
```

Make sure to create a `.env` file with your MongoDB connection string and any other configuration values.

---

## 🔐 Demo Credentials (Optional)

- **Admin Login:** `admin@example.com` / `admin123`
- **Receptionist Login:** `reception@example.com` / `reception123`
- **Customer Login:** `user@example.com` / `user123`

---

## 🚀 Future Enhancements

- Payment gateway integration (Razorpay, Stripe)
- Booking cancellation & refund handling
- Email & SMS notifications
- Role-based access control (admin, receptionist, housekeeping, etc.)
- Integrated analytics for revenue and booking trends

---

## 👨‍💻 Developed with ❤️ by Rahul Mondal

```
