# Klop TeamDB CRM: Feature Recap & Overview

This document serves as a comprehensive recap of the medical sales CRM we've built, outlining the architecture, features, and workflows implemented.

## 🏗️ Architecture & Stack
- **Frontend Framework:** React (built with Vite)
- **Styling:** Tailwind CSS + Custom CSS (`idurar` inspired aesthetic)
- **Backend & Database:** Firebase (Authentication + Firestore)
- **Real-Time Data:** Fully synchronized. Changes made by one user instantly reflect for everyone else using Firestore `onSnapshot`.

---

## 🔒 Authentication & Permissions
- **Secure Login:** Required to access the CRM. 
- **Admin Controls:** Granular permission system where only specific admin users (e.g., `albear@...`) have destructive privileges, like deleting records from the database. Sales reps can add and edit, but cannot delete.

---

## 📊 Core Modules (Tabs)

### 1. Dashboard
The nerve center of the application, providing high-level business intelligence.
- **Dynamic KPI Cards:** Shows Total Invoiced, Active Pipeline, Target Achievement, and Pending Collections.
- **Currency Toggle (EUR / EGP):** A system-wide toggle that calculates and displays your dashboard metrics in EGP based on the live exchange rate.
- **Live Exchange Rate Engine:** Powered by a backend utility that scrapes the Central Bank of Egypt to ensure your EGP projections are perfectly accurate.

### 2. Pipelines (Forecast)
Where the sales team tracks ongoing deals.
- **Stage Tracking:** Tracks deals through customizable stages (e.g., Prospecting, Qualification, Proposal, Closed Won).
- **One-Click Translation:** When a deal is won, users click a **Translate to PO** button. This automatically generates a Purchase Order using the deal's data, eliminating double data-entry.
- **Safety Belts:** It prevents duplicate conversions. If a deal (matched by its unique code) has already been transferred to a PO, it highlights the deal with a green checkmark and prevents accidental duplication. Clicking an already transferred deal will auto-navigate you to the PO tab and highlight the exact row.

### 3. Purchase Orders (POs)
The operational fulfillment center.
- **Clean Slate Real Data:** Displays *only* your real, active orders pulled directly from Firebase.
- **Tracking:** Monitors order dates, expected delivery dates, and fulfillment statuses (Pending, Shipped, Delivered).
- **Translate to Invoice:** Similar to the pipeline, completed POs feature a one-click **Translate to Invoice** button to instantly move the order to the billing department.

### 4. Invoices & Collections
The financial tracking center.
- **Overdue Calculations:** Automatically tracks Issue Dates vs. Due Dates and calculates `daysOverdue`.
- **Status Monitoring:** Tracks whether an invoice is Pending, Paid, or Overdue to assist with cash collection.

### 5. Targets
Where management sets and tracks goals.
- Defines sales quotas for individuals and teams, feeding directly into the progress bars shown on the Dashboard.

### 6. Contacts (KlopDB)
The legacy Rolodex.
- We intentionally isolated all the old adding/contact management features from the original KlopDB into this single tab. This ensures your active sales pipelines stay completely clean while preserving access to all historical clients, hospitals, and doctors.

---

## ⚡ Technical & UX Highlights

- **Excel-Style Inline Editing:** Instead of clunky forms, users click "Edit Mode" and can double-click any cell in the data grid to change its value instantly.
- **Safe Batch Saving:** When you hit "Save changes", the system securely batches all modifications, strips out any invalid data, and syncs to Firestore. It includes Toast notifications (success/error alerts) for clear user feedback.
- **Auto-Scrolling & Highlighting:** When translating a deal to a PO, the app seamlessly jumps tabs, scrolls to the newly created row, and briefly highlights it so the user never loses their place.
- **No Ghost Data:** The tables are deeply integrated with Firebase so they will only ever show exactly what is saved in the cloud.
