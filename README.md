# 📦 Parcel Delivery API Backend

  

A role-based Parcel Delivery API system built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB** using **Mongoose**.  This project provides a robust foundation for managing parcel, user roles and real-time status tracking.

---
Live Link:

---

## **🎯 Project Overview**
Parcel Delivery API works like a courier service. Users can register, send parcels and track their delivery status. The system is secure, organized in modules and users role-based access control.

### 🚀 Features

  

 - JWT-based Authentication & Authorization
 - Role-based access control (Admin, Sender, Receiver)
 - Parcel tracking (status logs)
 - Cancel parcels before dispatched
 - Confirm delivery by receiver
 - Modular folder structure
 - Request validation & error handling
 - MongoDB with Mongoose

  
  

### 🔐 Authentication & Authorization

 
      JWT-based authentication system.
    
      Three user roles: admin, sender, and receiver.
    
      Role-based access control for all sensitive routes.
    

### 👥 Roles & Permissions

  


| Role     | Permissions                                                                 |
|----------|------------------------------------------------------------------------------|
| Admin    | Manage users and parcels, update parcel statuses                             |
| Sender   | Create parcels, view own parcels, cancel if not dispatched                   |
| Receiver | View parcels addressed to them, confirm delivery                             |


