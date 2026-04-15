# Election Management System (EMS) Prototype

This repository contains a front-end prototype that implements the main modules from your SRS:

- Voter information lookup by Voter ID/NID
- Polling station vote recording with ballot-vs-vote validation
- Verification queue for approve/reject workflows
- Constituency result aggregation from verified station data
- Final result publication panel
- Admin dashboard overview for master data + election constraints

## Run locally

No build tools are required.

1. Open `index.html` directly in a browser, or
2. Serve with a simple static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
