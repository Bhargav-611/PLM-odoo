# Project: PLM - Engineering Changes, Executed with Control

Team name: 56

Team members:
- Bhargav Chalodiya
- Tilak Vaghasiya
- Ghanshyam Variya
- Prit Chovatiya

## 📌 Project Overview
PLM (Product Lifecycle Management) is an Engineering Change Order (ECO) based system that allows controlled and versioned changes to Products and Bills of Materials (BoM).  
Instead of directly editing master data, all changes must go through an approval workflow to ensure traceability, stability, and auditability.

The system prevents accidental overwrites and ensures that only approved changes become active in operations.

This project demonstrates real-world PLM workflow including:
- Product versioning
- BoM versioning
- Approval flow
- Change comparison
- Audit logs
- Role-based access control

---

## 💡 Project Idea
In many manufacturing systems, products and BoMs are edited directly, which causes:

- ❌ No version control
- ❌ Data overwritten
- ❌ No approval flow
- ❌ No change history
- ❌ Difficult to track changes

This project solves these problems by introducing:

✔ Engineering Change Orders (ECO)  
✔ Version-based Products & BoMs  
✔ Approval stages  
✔ Change comparison before apply  
✔ Archived history  
✔ Role-based permissions  

Only approved changes become active.

---

## 🏗️ How It Works (Workflow)

The system works using a controlled Engineering Change Order (ECO) workflow to ensure that Products and Bills of Materials are never edited directly.  
All changes must go through a proper approval and versioning process before becoming active.

When a user logs into the system, access is controlled based on role.  
Engineering users can create change requests, approvers can validate them, operations users can only view active data, and admin users manage workflow rules and stages.

The workflow starts when an Engineering User creates an ECO (Engineering Change Order).  
In the ECO, the user selects whether the change is for a Product or a Bill of Materials and then proposes the required modifications such as price updates, component changes, or operation updates.  
These changes are stored in draft form and do not affect the active master data.

Once the changes are prepared, the ECO moves to the approval stage.  
Depending on the configured rules, one or more approvers must review the change.  
Before approval, the system shows a comparison view where the old version and the new version are displayed side-by-side so the approver can clearly see what has been modified.

After approval, the system applies the change by creating a new version of the Product or BoM.  
The previous version is automatically archived to keep history safe.  
Archived versions cannot be edited and remain only for traceability and audit purposes.

Only active versions of Products and BoMs are allowed to be used in operations.  
Draft or unapproved changes are never used in manufacturing or downstream processes, which ensures data stability.

Every action in the system is recorded in audit logs.  
The system tracks ECO creation, stage transitions, approvals, version creation, and value changes along with user name and timestamp.  
This guarantees full traceability of all modifications.

This workflow ensures that all engineering changes are controlled, approved, versioned, and traceable, which makes the system safe for real manufacturing and product lifecycle management.

---

## 🚀 How to Clone and Run

To run this project locally, first clone the repository from GitHub and move into the project folder.

```bash
git clone https://github.com/your-username/plm-eco-system.git
cd plm-eco-system
```

Install dependencies for both frontend and backend.

```bash
cd client
npm install

cd ../server
npm install
```

Create a `.env` file inside the server folder and add the following environment variables.

```
PORT=5000
DB_URL=mongodb://localhost:27017/plm
JWT_SECRET=secret

EMAIL_USER=REPLACE_YOUR_EMAIL
EMAIL_PASS=REPLACE_YOUR_PASSWORD


# AWS S3 Configuration for Attachments & Images
AWS_REGION=REPLACE_YOUR_REGION
AWS_ACCESS_KEY_ID=REPLACE_YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=REPLACE_YOUR_SECRET_ACCESS_KEY
AWS_S3_BUCKET=REPLACE_YOUR_BUCKET
```

Run the backend server.

```bash
npm start
```

or

```bash
nodemon index.js
```

Run the frontend.

```bash
cd ../client
npm run dev
```

or

```bash
npm start
```

Open the browser and go to:

```
http://localhost:3000
```

Login to the system and access the dashboard where you can manage Products, Bill of Materials (BoM), and Engineering Change Orders (ECO).
