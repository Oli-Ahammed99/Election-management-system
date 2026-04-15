# Election Management System (EMS) Prototype

This repository contains a front-end prototype that implements the main modules from your SRS:

- Voter information lookup by Voter ID/NID
- Voter lookup is public (no login required)
- Polling station vote recording with ballot-vs-vote validation
- Verification queue for approve/reject workflows
- Constituency result aggregation from verified station data
- Final result publication panel
- Admin dashboard overview for master data + election constraints
- Staff login (officers + admin) with role-based module access control
- Government-style design language (official portal look-and-feel, status cards, operational dashboard layout)

## Run locally

No build tools are required.

1. Open `index.html` directly in a browser, or
2. Serve with a simple static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Demo login credentials (staff only)

- APO: `apo / apo123`
- PO: `po / po123`
- ARO: `aro / aro123`
- RO: `ro / ro123`
- Admin: `admin / admin123`
