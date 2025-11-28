Zenzoro — Production bundle (Replit + Railway ready)
===================================================

This bundle contains a production-ready backend (Node/Express) and a frontend (Vite + React).
Use this in Replit or push to GitHub + connect with Railway.

Backend: backend/server.js
Frontend (client): client/

Demo mockup asset (uploaded by user) is available at:
/mnt/data/A_mockup_of_Zenzoro's_mobile_finance_app_dashboard.png

Quick start (Replit)
--------------------
1. Create a Replit project and upload this repository (all files).
2. Replit will use .replit and replit.nix to run start.sh which launches the backend.
3. To run frontend in Replit, open the Shell and run:
   cd client && npm install && npm run build && npm run preview

Quick start (locally)
---------------------
# Backend
cd backend
npm install
node server.js

# Frontend (dev)
cd client
npm install
npm run dev

Environment variables
---------------------
Copy backend/.env.example to backend/.env and set USE_FAKE_DATA=false when using real API.
