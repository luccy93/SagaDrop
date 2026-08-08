# 📚 SagaDrop — Premium Story Book Marketplace

<div align="center">

<img src="./frontend/public/sagadrop-logo.png" alt="SagaDrop Logo" width="140"/>

### Discover Stories. Collect Worlds. Begin Your Next Adventure.

A modern full-stack story book marketplace built for readers who want a beautiful, immersive, and seamless way to discover and purchase books.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-SagaDrop-7C3AED?style=for-the-badge)](https://saga-drop-gules.vercel.app)
[![Backend](https://img.shields.io/badge/⚡_API-FastAPI-009688?style=for-the-badge)](https://sagadrop-backend.onrender.com)
[![Health](https://img.shields.io/badge/🟢_API_Status-Healthy-22C55E?style=for-the-badge)](https://sagadrop-backend.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/💻_Source-GitHub-181717?style=for-the-badge)](https://github.com/luccy93/SagaDrop)

</div>

---

## ✨ Overview

**SagaDrop** is a production-deployed full-stack story book marketplace designed around a premium reading and shopping experience.

The platform combines:

- 📚 Story book discovery
- 🔎 Product search
- 🛒 Shopping cart
- ❤️ Wishlist
- 🔐 Secure authentication
- 📧 Email OTP verification
- 🔑 Google OAuth
- 💳 Razorpay payments
- 💳 Stripe payments
- 📦 Order management
- 👤 User accounts
- 🛠️ Admin management
- ⚡ Redis-backed services
- 🗄️ MongoDB Atlas
- ☁️ Vercel + Render deployment

The project is designed as a real-world production application rather than a static frontend demo.

---

# 🌐 Live Application

### 🚀 Frontend

**SagaDrop Web Application**

https://saga-drop-gules.vercel.app

### ⚡ Backend API

**FastAPI Production API**

https://sagadrop-backend.onrender.com

### 🟢 API Health

https://sagadrop-backend.onrender.com/api/health

### 💻 Source Code

https://github.com/luccy93/SagaDrop

---

# 🖼️ Product Preview

> Replace the image paths below with your actual screenshots.

## 🏠 Landing Page

<p align="center">
  <img src="./docs/screenshots/home.png" width="90%" alt="SagaDrop Home Page"/>
</p>

SagaDrop uses a cinematic, premium interface focused on storytelling, discovery, and visual book browsing.

---

## 📚 Book Discovery

<p align="center">
  <img src="./docs/screenshots/books.png" width="90%" alt="SagaDrop Book Catalog"/>
</p>

Users can browse the available collection and discover books through a clean marketplace interface.

---

## 📖 Book Details

<p align="center">
  <img src="./docs/screenshots/book-details.png" width="90%" alt="SagaDrop Book Details"/>
</p>

Each book receives a dedicated product experience containing its cover, description, pricing, and purchasing actions.

---

## 🛒 Shopping Cart

<p align="center">
  <img src="./docs/screenshots/cart.png" width="90%" alt="SagaDrop Shopping Cart"/>
</p>

Users can review selected books before proceeding to checkout.

---

## 💳 Checkout

<p align="center">
  <img src="./docs/screenshots/checkout.png" width="90%" alt="SagaDrop Checkout"/>
</p>

The checkout system supports multiple payment providers for Indian and international customers.

---

## 👤 User Account

<p align="center">
  <img src="./docs/screenshots/profile.png" width="90%" alt="SagaDrop User Profile"/>
</p>

Users can manage their account and access their order-related information.

---

## 🛠️ Admin Dashboard

<p align="center">
  <img src="./docs/screenshots/admin.png" width="90%" alt="SagaDrop Admin Dashboard"/>
</p>

Administrators can manage the marketplace and monitor platform activity.

---

# 🚀 Core Features

## 🔐 Authentication

SagaDrop provides multiple authentication mechanisms.

### Email Authentication

- User registration
- Email OTP verification
- Login OTP
- Password reset
- 6-digit verification codes
- 10-minute OTP expiration
- 60-second resend cooldown
- Failed-attempt protection

### Google Authentication

Google OAuth is supported for production authentication.

Authorized production origin:

```text
https://saga-drop-gules.vercel.app
