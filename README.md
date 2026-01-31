# Rental Management System

A full-stack **Rental Management System** that enables businesses to rent products online while efficiently managing quotations, rental orders, inventory, invoicing, payments, and returns.  
The system supports **Customers**, **Vendors**, and **Admins**, covering the complete rental lifecycle from product browsing to return and reporting.

---

## 🚀 Features Overview

### 🔄 End-to-End Rental Flow
- Product browsing → Quotation → Rental Order → Invoice → Pickup → Return
- Automated stock reservation to prevent overbooking
- Flexible rental durations with time-based pricing

### 👥 User Roles
- **Customer**: Browse products, create quotations, place orders, make payments, view invoices
- **Vendor**: Manage products, process orders, track pickups/returns, generate invoices
- **Admin**: Manage users, vendors, products, configurations, and view analytics

---

## 🧑‍💻 User Roles & Capabilities

### Customer (End User)
- Browse rentable products
- Create and edit rental quotations
- Confirm rental orders
- Make full or partial payments
- View invoices and order history

### Vendor (Internal User)
- Add and manage rental products
- Process rental orders
- Generate invoices
- Track pickups, returns, and earnings

### Admin (System Administrator)
- Full backend access
- Manage users, vendors, and products
- Configure rental settings
- View global dashboards and reports

---

## 🔐 Authentication & User Management
- Email & password login
- User signup with:
  - Name
  - Email
  - Company Name
  - GSTIN (mandatory for invoicing)
- Forgot password with email verification
- Coupon code support during signup

---

## 📦 Rental Product Management
- Products marked as **Rentable**
- Pricing options:
  - Hourly
  - Daily
  - Weekly
  - Custom duration
- Inventory tracking (quantity on hand)
- Variant-based pricing (e.g., Brand, Color)
- Publish / Unpublish products on website

---

## 📝 Quotations & Rental Orders

### Rental Flow
1. **Quotation**
   - Created when products are added to cart
   - Editable until confirmation
2. **Rental Order**
   - Created after quotation confirmation
   - Automatically reserves stock

### Order Status
- Draft → Sent → Confirmed

### Reservation Rules
- Reserved items cannot be double-booked
- Rental period blocks product availability
- Each order line has start & end rental dates

---

## 🚚 Pickup & Return Management

### Pickup
- Pickup document generated on order confirmation
- Stock status updated to “With Customer”
- Pickup instructions visible to vendors

### Return
- Return document auto-generated at rental end
- Stock restored after return
- Late return charges applied automatically

### Notifications
- Return reminders before due date
- Alerts for delayed returns

---

## 💰 Invoicing & Payments
- Draft invoice generated from rental order
- Supports:
  - Full upfront payment
  - Partial payment / security deposit
- Automatic tax (GST) calculation
- Invoice download & print support
- Online payment gateway integration

---

## 🌐 Website & Customer Portal

### Website
- Product listing with filters
- Product detail pages with rental configuration
- Cart & checkout flow
- Address and payment selection

### Customer Portal
- View rental orders
- Track order status
- Download invoices

---

## ⚙️ Settings & Configuration

### Admin Settings
- Rental duration configuration
- Product attributes & variants
- Role management (Admin / Vendor / Customer)
- GST and company details

### User Profile
- Company information
- GSTIN management
- Password change

---

## 📊 Reports & Dashboards

### Dashboards
- Total rental revenue
- Most rented products
- Vendor-wise performance
- Order trends over time

### Reports
- Exportable reports (PDF, XLSX, CSV)
- Date-range filters
- Role-based report visibility

---

## 📘 Key Terminology
- **Quotation**: Price proposal before order confirmation  
- **Rental Order**: Confirmed rental agreement  
- **Reservation**: Prevents double booking of products  
- **Invoice**: Legal payment request document  
- **Security Deposit**: Refundable amount for damages or late returns  

---

## 🛠️ Tech Stack (Example)
> _Update this section based on your actual implementation_

- Frontend: React / Next.js
- Backend: Node.js, Express.js
- Database: PostgreSQL / MongoDB
- Authentication: JWT
- Payments: Razorpay / Stripe
- Deployment: Render / Vercel

---

## 🎯 Project Objectives
- Model real-world rental business workflows
- Prevent overbooking using reservation logic
- Implement role-based access control
- Provide meaningful dashboards & reports
- Deliver a clean, business-aligned UI

---

## 📌 Deliverables
- Functional rental lifecycle
- Website + backend integration
- Role-based access control
- At least one dashboard or report
- Clean and intuitive UI

---

## 📎 Mockups
- Excalidraw Mockup:  
  https://link.excalidraw.com/l/65VNwvy7c4X/3tAPpflFLrG

---

## 📄 License
This project is created for educational purposes.

---

### ✨ Author
**Manthan Goswami**  
**Meet Bhuva**
**Ronit Dhimmar**

Bachelor of Engineering – Computer Engineering  
VGEC, Chandkheda
