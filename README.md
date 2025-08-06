# Gaza Confirm

A verification platform for Gazans to confirm their identity and location.

## Features

- User registration and verification
- Admin dashboard for managing users
- Public card pages for verified users
- Secure authentication system

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Testing**: Playwright (E2E) + Vitest (Unit)
- **Deployment**: Docker

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy environment files:
   ```
   copy packages\backend\.env-dev packages\backend\.env
   copy packages\frontend\.env-dev packages\frontend\.env
   ```
4. Start development servers:
   ```
   npm run dev
   ```

## Development

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

## Testing

```bash
# E2E tests
npm run test:e2e

# Backend tests
npm run test:backend
```

## Project Structure

```
packages/
├── frontend/     # React application
├── backend/      # Express API server
└── e2e/         # Playwright tests
```