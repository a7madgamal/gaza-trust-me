# Backend API Server

Production-ready Node.js backend for the Gazaconfirm help-seeking platform.

## Features

- **TypeScript** with strict mode enabled
- **tRPC** for end-to-end type safety
- **Zod** for runtime validation
- **Express.js** with security middleware
- **Supabase** integration for auth and database
- **Winston** for structured logging
- **Vitest** for testing
- **ESLint & Prettier** for code quality

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Development:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

## Project Structure

```
src/
├── index.ts              # Main server entry point
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── middleware/           # Express middleware
├── routes/               # API routes (to be implemented)
├── services/             # Business logic (to be implemented)
└── tests/                # Test files
```

## API Endpoints

- `GET /health` - Health check
- `POST /trpc/*` - tRPC endpoints

## Environment Variables

See `env.example` for all required environment variables.

## Testing

Tests are written with Vitest and located in `src/tests/`.

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Code Quality

- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **Strict TypeScript** configuration
- **No `any` types** allowed
- **Comprehensive error handling**

## Security Features

- **Helmet** for security headers
- **CORS** configuration
- **Rate limiting**
- **Input validation** with Zod
- **JWT authentication**
- **Role-based access control**
