# OasisReserve


OasisReserve is my hospitality management SaaS for hotels, guest stays, and reservation operations. It combines a modern React frontend with an Express and MongoDB backend to help teams manage customers, services, reservations, reports, and staff in one place.

## What It Can Do

- Manage customer profiles and guest records.
- Create, update, and track reservations.
- Organize hotel services and booking-related activity.
- Show dashboard summaries, recent activity, and reservation trends.
- Display customer reservation counts and live operational data.
- Support role-based access for admin, staff, receptionist, and customer users.
- Restrict staff creation to admin users only.
- Provide a customer signup flow with secure authentication.

## Features

- Modern SaaS-style UI with responsive layouts.
- Role-based navigation and page visibility.
- JWT login, refresh tokens, and protected routes.
- Real dashboard notifications based on actual data.
- Calendar, reports, analytics, and export-ready views.
- Theme-aware styling for light and dark mode readability.
- Deployment-ready environment configuration.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, TanStack Query
- Backend: Node.js, Express, MongoDB, Mongoose, bcrypt, jsonwebtoken

## Project Structure

- `Frontend/` - React app and UI screens
- `Backend/` - API server, routes, models, and auth logic

## Local Setup

Before starting, copy the example environment files:

- `Backend/.env.example` to `Backend/.env`
- `Frontend/.env.example` to `Frontend/.env`

Backend:

```bash
cd Backend
npm install
npm start
```

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

## Environment Variables

- Set `FRONTEND_URL` in the backend for CORS.
- Set `VITE_API_BASE_URL` in the frontend to point to the deployed API.

## Made By Me

This project was built by me as a complete hospitality management dashboard and SaaS-style admin system.

OasisReserve is a reservation management system for customers and services. It includes an admin dashboard and user-friendly interfaces for managing reservations.

## License

This project is licensed under the MIT License.

