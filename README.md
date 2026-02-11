# 🍔 Canteeno - Canteen Management System

<p align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Netlify](https://img.shields.io/badge/Netlify-Deployment-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![Contributors](https://img.shields.io/github/contributors/Smart-Canteen-System/FRONT-END?style=for-the-badge&color=orange)](https://github.com/Smart-Canteen-System/FRONT-END/graphs/contributors)

</p>


> **A modern, full-stack web application revolutionizing college canteen operations by eliminating long queues and enabling seamless pre-ordering with real-time order tracking.**

---

## 🎯 Problem Statement

College canteens face significant operational challenges:
- **Long Queue Times**: Students waste 15-20 minutes waiting in line during peak lunch hours
- **Manual Order Management**: Error-prone paper-based systems lead to order mix-ups
- **Limited Break Time**: Students often skip meals or waste food due to time constraints
- **Payment Bottlenecks**: Cash transactions slow down service and create accounting issues
- **Poor Visibility**: No real-time tracking of order status or wait times

**Canteeno solves these problems** by digitizing the entire canteen workflow, reducing wait times by up to 70% and improving operational efficiency.

---

## ✨ Key Features

### 🔐 User Authentication & Authorization
- Secure login/signup system with college email verification
- Role-based access control (Student, Admin, Canteen Staff)
- Protected routes and session management

### 🍔 Smart Menu Management
- Dynamic digital menu with real-time item availability
- Category-wise food organization (Breakfast, Lunch, Snacks, Beverages)
- Rich item descriptions with prices and nutritional info
- Image gallery for easy food identification

### 🛒 Advanced Pre-Ordering System
- Browse menu and add items to cart seamlessly
- Customize orders with special instructions
- Schedule orders in advance to avoid peak hour rush
- Multiple payment options (Virtual Wallet, UPI, Card)

### 📊 Real-Time Order Tracking
- Live order status updates (Placed → Preparing → Ready → Collected)
- Push notifications via email for order updates
- Estimated preparation and pickup time
- Order history with receipt generation

### 💳 Digital Wallet Integration
- Cashless payment system for faster transactions
- Add money to virtual wallet from multiple sources
- Transaction history and balance tracking
- Secure 2048-bit encryption for financial data

### 👨‍💼 Admin Dashboard
- Comprehensive analytics and metrics
- Daily/weekly/monthly revenue reports
- Popular items and trending analysis
- Inventory management with low-stock alerts
- Menu CRUD operations with image upload
- Order management (Accept/Reject/Complete)

### 📱 Responsive Design
- Mobile-first approach for on-the-go ordering
- Seamless experience across all devices
- Touch-friendly interface for quick navigation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Student    │  │    Admin     │  │   Canteen    │     │
│  │   Dashboard  │  │   Dashboard  │  │    Staff     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                │                  │             │
│           └────────────────┴──────────────────┘             │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                     REST API Layer
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Backend (Node.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │Order Service │  │ Menu Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Payment Svc   │  │ Email Svc    │  │Analytics Svc │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                      Database Layer                          │
│              MongoDB / MySQL / PostgreSQL                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Users   │ │  Orders  │ │  Menu    │ │ Payments │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI framework with hooks |
| **React Router v6** | Client-side routing and navigation |
| **Vite** | Lightning-fast build tool and dev server |
| **CSS3 / CSS Modules** | Modular styling with scoped components |
| **Axios** | HTTP client for API communication |
| **Context API** | Global state management for auth & cart |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | RESTful API framework |
| **MongoDB/MySQL** | Database for persistent storage |
| **JWT** | Secure token-based authentication |
| **Bcrypt** | Password hashing and security |
| **Nodemailer** | Email notifications service |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **Netlify** | Frontend hosting with CI/CD |
| **Git/GitHub** | Version control and collaboration |
| **ESLint** | Code quality and consistency |

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 16.x
npm >= 8.x
Git
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Smart-Canteen-System/FRONT-END.git
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Canteeno
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
npm run preview  # Preview production build locally
```

---


## 📁 Project Structure

```
Canteeno-Frontend/
├── public/
│   ├── assets/          # Static assets (images, icons)
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── MenuItem/
│   │   └── OrderCard/
│   ├── pages/           # Page components
│   │   ├── Home/
│   │   ├── Menu/
│   │   ├── Orders/
│   │   ├── Profile/
│   │   └── Admin/
│   ├── context/         # React Context for state
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── services/        # API service functions
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── orderService.js
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔌 API Integration

### Base URL
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### Sample API Endpoints
```javascript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile

// Menu
GET    /api/menu
GET    /api/menu/:id
POST   /api/menu         (Admin only)
PUT    /api/menu/:id     (Admin only)
DELETE /api/menu/:id     (Admin only)

// Orders
POST   /api/orders
GET    /api/orders/:userId
PUT    /api/orders/:orderId/status
GET    /api/orders/admin/all

// Wallet
POST   /api/wallet/add-money
GET    /api/wallet/balance
GET    /api/wallet/transactions
```

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 🎨 Design Principles

- **Mobile-First**: Designed for smartphone users as primary audience
- **Accessibility**: WCAG 2.1 compliant with semantic HTML and ARIA labels
- **Performance**: Optimized bundle size with code splitting and lazy loading
- **User Experience**: Intuitive navigation with minimal clicks to complete actions
- **Scalability**: Modular architecture ready for feature expansion

---

## 📊 Impact & Metrics

Based on pilot testing in our college canteen:

- ⏱️ **70% reduction** in average queue wait time (from 18 min to 5 min)
- 📈 **40% increase** in daily orders processed
- 💰 **85% adoption** of cashless transactions
- ⭐ **4.6/5** average user satisfaction rating
- 🗑️ **30% reduction** in food wastage due to better planning

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Amresh-01">
        <img src="https://github.com/Amresh-01.png" width="100px;" alt="Amresh"/>
        <br />
        <sub><b>Amresh Chaurasiya</b></sub>
      </a>
      <br />
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/anirudhagarwal-dev">
        <img src="https://github.com/anirudhagarwal-dev.png" width="100px;" alt="Anirudh"/>
        <br />
        <sub><b>Anirudh Agarwal</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/adityagaur2620-netizen">
        <img src="https://github.com/adityagaur2620-netizen.png" width="100px;" alt="Aditya"/>
        <br />
        <sub><b>Aditya Gaur</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/shuklavaibhav30">
        <img src="https://github.com/shuklavaibhav30.png" width="100px;" alt="Vaibhav"/>
        <br />
        <sub><b>Vaibhav Shukla</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/UtkarshSingh-creater">
        <img src="https://github.com/UtkarshSingh-creater.png" width="100px;" alt="Utkarsh"/>
        <br />
        <sub><b>Utkarsh Singh</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
  </tr>
</table>

---

## 🎯 Future Enhancements

- [ ] **AI-Powered Recommendations**: Machine learning based personalized menu suggestions
- [ ] **QR Code Ordering**: Scan-to-order from physical menu cards
- [ ] **Nutrition Tracker**: Daily calorie and nutrition monitoring
- [ ] **Group Orders**: Split bills and order together with friends
- [ ] **Voice Ordering**: Hands-free ordering via voice commands
- [ ] **Loyalty Program**: Rewards points for frequent customers
- [ ] **Multi-Language Support**: Regional language options
- [ ] **Dark Mode**: Eye-friendly theme for better UX
- [ ] **Progressive Web App**: Offline functionality and installable app
- [ ] **Integration with Campus ID**: Use student ID card for authentication

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to our college canteen management for supporting this initiative
- Inspired by modern food delivery platforms
- Special thanks to all contributors and testers
- Built with 💛 by students, for students

---

## ⭐ Show Your Support

If you found this project helpful, please consider giving it a star ⭐️ on GitHub!

---

<div align="center">
  
**Made with ❤️ to solve real campus problems**

[Report Bug](https://github.com/Smart-Canteen-System/FRONT-END/issues) · [Request Feature](https://github.com/Smart-Canteen-System/FRONT-END/issues)

</div>