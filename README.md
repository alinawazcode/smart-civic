# Smart Civic Complaint Triage & Municipal Operations System
### Islamic Republic of Pakistan · Municipal Grievance, AI Triage & SQLite Dispatch Infrastructure

A production-grade, bilingual municipal grievance reporting, semantic deduplication, and field dispatch platform designed for municipal corporations across Pakistan (Karachi Municipal Corporation, KW&SB Water & Sanitation, Sindh Solid Waste Management Board, and provincial agencies).

---

## 1. Architecture Overview

The system bridges citizens, field dispatch crews, and municipal command centers:
- **Resident Citizens**: Submit geolocated municipal grievances (potholes, burst pipelines, open manholes, garbage heaps, broken streetlights) with automated duplicate warning alerts and real-time reference code tracking.
- **Field Staff Workforce**: Receive dispatched work orders on mobile devices, initiate field work, capture timestamped & geotagged resolution proof photos via device camera with baked watermarks, and inspect before-and-after evidence.
- **District Administrators**: Supervise local municipal personnel, triage complaints localized strictly to their assigned district jurisdiction, and approve work closures within their zonal boundaries.
- **Central Command Super Administrators**: Sovereign global system governance across all municipal districts, personnel CRUD across all tiers, database exports, SLA configuration, and central audit log inspections.
- **Backend & Database**: Full-stack Express server (`server.ts`) running on port 3000 with embedded cross-platform SQLite database (`sql.js` WebAssembly + disk persistence to `data/civiccare.sqlite`). Runs locally on any computer without external database installation!

---

## 2. District Admin vs Super Admin RBAC Separation

The access control model strictly differentiates administrative tiers (`src/models/rbacModel.ts`):

| Capability / Resource | Central Command Super Admin | District Administrator |
|---|---|---|
| **Municipal Geographic Scope** | Sovereign (All Karachi Districts & Zones) | Restricted to Assigned District (e.g. Karachi Central) |
| **Complaint Triage & Dispatch** | All districts; cross-district reassignment | Restricted strictly to tickets within their district |
| **Field Staff Management** | Full CRUD, can approve/suspend/reassign staff across any district | Can only supervise & approve field staff in their district |
| **Administrator Accounts Management** | Full CRUD, create/edit/suspend/delete admins, rotate secret keys | **Restricted / Read-Only**; cannot create or delete admins |
| **Admin Secret Keys** | Visible & rotatable with 1-click reveal | Masked as `•••••••••••• (Super Admin Protected)` |
| **System Settings & SLA Weights** | Read & Write (tune AI weights, SLA deadlines, confidence cutoffs) | Read-only observation with restricted notice banner |
| **SQLite Database Management** | Can trigger disk synchronization and download `.sqlite` database backups | View-only database engine health monitoring |
| **Audit Trail Scope** | Global system-wide audit history | Filtered to events relevant to their district jurisdiction |

---

## 3. Dedicated Models Organization

All AI/ML and heuristic models are organized cleanly in modular folders:

### 3.1 Client & Core Models (`src/models/`)
- **`src/models/duplicateDetectionModel.ts`**:
  - 128-dimensional dense vector space derived from subword character 3-grams and civic municipal domain weights.
  - L2 normalized cosine vector similarity metric:
    $$\text{CosineSimilarity}(A, B) = \sum_{i=1}^{128} A_i \cdot B_i$$
  - Geodesic Haversine spatial distance computation with exponential decay.
  - Multi-modal confidence scoring: Text Semantic (55%) + Category (25%) + Proximity (20%).
- **`src/models/triageClassificationModel.ts`**:
  - Multi-class natural language classification across 6 civic departments.
  - Automated urgency score ($1\text{--}100$), priority assignment (`critical`, `high`, `medium`, `low`), and SLA target hours calculation ($12\text{h}$ to $72\text{h}$).
  - Critical life hazard detection (bare live wires, open manholes, transformer sparking).
- **`src/models/cvQualityModel.ts`**:
  - Real-time Computer Vision analysis of resolution proof photos.
  - Laplacian convolution kernel variance check for blur detection.
  - Dynamic range & luminance evaluation to verify daylight visibility.
  - Metadata verification for municipal timestamp watermark overlays.
- **`src/models/rbacModel.ts`**:
  - Role-based policy verification functions (`isSuperAdmin`, `isDistrictAdmin`, `canAccessTicket`, `canManageStaff`, `canSyncDatabase`).

### 3.2 Server-Side SQLite Data Models (`server/models/`)
- **`server/models/complaintModel.ts`**: Persistent SQLite CRUD, spatial proximity radius searches, status progression, and tracking queries.
- **`server/models/userModel.ts`**: Persistent SQLite storage for Super Admins, District Admins, Field Staff, and Residents with credential verification.
- **`server/models/auditModel.ts`**: Immutable event logging for municipal accountability.

---

## 4. Full-Stack Backend & SQLite Database Engine

### 4.1 Persistence Mechanism (`server/db/sqlite.ts`)
- Uses official SQLite compiled to WebAssembly (`sql.js`).
- Automatically serializes binary state to disk at `data/civiccare.sqlite`.
- Guarantees zero external database configuration: no Docker, PostgreSQL, or native C++ compiler tools required.
- Automatically initializes and seeds initial complaints, user accounts, and audit records on first run.

### 4.2 REST API Endpoints (`server.ts`)
- `GET /api/health`: Health diagnostics, database engine status, and active model descriptors.
- `GET /api/complaints`: List complaints with status, category, area, district, and search filters.
- `GET /api/complaints/:id`: Get complaint details by ID.
- `POST /api/complaints`: Submit new complaint (runs AI triage classification and inserts to SQLite).
- `PATCH /api/complaints/:id`: Update ticket status, resolution photo, or assigned crew.
- `GET /api/track/:code`: Instant citizen tracking by complaint reference code.
- `GET /api/nearby`: Geospatial proximity search for potential duplicate detection.
- `GET /api/accounts`: List accounts filtered by role and district.
- `POST /api/accounts/verify-admin`: Verify administrative credentials and secret key.
- `PATCH /api/accounts/:id`: Update account status, details, or department.
- `DELETE /api/accounts/:id`: Remove user profile (restricted to Super Admins).
- `GET /api/audit-logs`: Audit logs with action and district filters.
- `GET /api/db/stats`: Live SQLite row counts, disk storage size, and engine health.
- `GET /api/db/export`: Download complete SQLite database file (`civiccare_backup.sqlite`).
- `POST /api/db/sync`: Bidirectional synchronization between client cache and SQLite.
- `POST /api/models/duplicate-check`: Server-side duplicate match evaluation.
- `POST /api/models/triage`: Server-side NLP triage prediction.

---

## 5. Field Staff Mobile Proof & Camera Verification

Field workers resolve tasks using the mobile proof capture module (`src/components/common/ProofCameraCapture.tsx`):
- **Live Camera Viewfinder**: Utilizes HTML5 MediaStreams with front/rear camera switching, crosshair alignment, and live GPS telemetry.
- **Baked Municipal Watermark**: Canvas rendering stamps an official municipal audit watermark:
  - Authority Title: `CIVIC CARE PK · RESOLUTION PROOF`
  - Ticket Reference Code
  - Accurate GPS Coordinates (Latitude, Longitude)
  - Date & Timestamp in Pakistan Standard Time (PKT)
  - Officer Name & Department Badge ID
- **Interactive Before-After Comparison Slider**: Field crews and supervisors can drag horizontally to compare the resident's original report photo ("BEFORE") against the completed repair ("AFTER").
- **Direct File Fallback**: Immediate file picker with automatic watermarking when camera hardware is unavailable.

---

## 6. Project Structure

```
├── data/
│   └── civiccare.sqlite            # Persistent SQLite database file
├── server/
│   ├── db/
│   │   └── sqlite.ts               # SQLite WASM engine & disk persistence
│   └── models/
│       ├── auditModel.ts           # Server SQLite audit logging
│       ├── complaintModel.ts       # Server SQLite complaint CRUD & spatial queries
│       └── userModel.ts            # Server SQLite accounts & authentication
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx           # Status & priority badges
│   │   │   ├── Button.tsx          # Primary, secondary, destructive buttons
│   │   │   ├── FlagIcons.tsx       # Official SVG Pakistan & US flags
│   │   │   ├── LeafletMap.tsx      # Interactive GIS Leaflet map
│   │   │   ├── ProofCameraCapture.tsx # Device camera, watermark & comparison slider
│   │   │   └── ProtectedRoute.tsx  # Role-based route guard
│   │   └── layout/
│   │       ├── Navbar.tsx          # Polished header with SVG flags & user menu
│   │       ├── PortalLayout.tsx    # Staff & Admin sidebar and workspace layout
│   │       └── PublicLayout.tsx    # Citizen header and footer wrapper
│   ├── context/
│   │   └── RoleContext.tsx         # Authentication, session state & role switcher
│   ├── lib/
│   │   ├── accountStore.ts         # Client account store & audit logging
│   │   ├── api.ts                  # Complaints client API & SQLite sync
│   │   └── triageModel.ts          # Backward-compatible model re-exports
│   ├── models/
│   │   ├── cvQualityModel.ts       # Computer vision resolution proof validator
│   │   ├── duplicateDetectionModel.ts # 128-dim subword embeddings & Haversine distance
│   │   ├── rbacModel.ts            # District Admin vs Super Admin permission engine
│   │   └── triageClassificationModel.ts # Multi-class NLP classifier & urgency matrix
│   └── pages/
│       ├── admin/
│       │   ├── AccountsManagement.tsx # Full CRUD, District Admin constraints, Audit export
│       │   ├── CityOverview.tsx    # Municipal KPI dashboard with district scoping
│       │   ├── RankedQueue.tsx     # Triage priority queue
│       │   ├── ReviewQueue.tsx     # AI ambiguity resolution & duplicate clusters
│       │   └── Settings.tsx        # System settings & SQLite sync engine
│       ├── public/
│       │   ├── Landing.tsx         # Citizen portal home
│       │   ├── Login.tsx           # Verified citizen, staff & admin login
│       │   ├── ReportIssue.tsx     # Grievance submission with real-time AI duplicate scan
│       │   └── ResidentDashboard.tsx # Verified citizen complaint tracking
│       └── staff/
│           ├── StaffTasks.tsx      # Field crew task queue with camera resolution
│           └── StaffTicketDetail.tsx # Work order inspection & telemetry
├── metadata.json                   # Applet configuration & metadata
├── package.json                    # Full-stack dependencies & scripts
├── server.ts                       # Express backend server with Vite middleware (Port 3000)
└── README.md                       # Comprehensive documentation
```

---

## 7. How to Run Locally

You can run this project locally on your computer with a single command:

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack local server (Express + SQLite + Vite on Port 3000)
npm run dev

# 3. For production build and startup:
npm run build
npm start
```

Once running, navigate to `http://localhost:3000` in your web browser. Everything (database, ML models, camera uploads, audit logs) runs locally without external dependencies.

---

## 8. Authorized Credentials

Use the 1-click profiles on the Sign In page (`/login`):

| Role | Name | Identifier / Email | Credential / Badge | Operational Scope |
|---|---|---|---|---|
| **Chief Super Admin** | Mian Ali Nawaz | `superadmin@civiccare.gov.pk` | `CIVIC-SUPER-9921` | Sovereign Central Scope (All Districts, Full User CRUD, SQLite Sync) |
| **District Admin** | Director Tariq Jameel | `admin.tariq@karachicity.gov.pk` | `ADMIN-KMC-2026` | District Karachi Central (Local Staff Supervision & Dispatch) |
| **Municipal Staff** | Rashid Minhas | `KWSB-8821` | Standard Passcode | KW&SB Water & Sanitation · Karachi Central |
| **Verified Citizen** | Ayesha Siddiqui | `0300-2918273` | Standard Password | Karachi East (Gulshan-e-Iqbal) |
| **Verified Citizen** | Muhammad Usman | `0333-8172635` | Standard Password | Karachi South (Clifton & DHA) |
