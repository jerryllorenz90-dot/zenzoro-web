#!/usr/bin/env bash
# Start backend and optionally serve frontend build
cd backend
node server.js &
cd ..
# If there's a client preview available, Replit will serve client via Vite preview if used
wait
