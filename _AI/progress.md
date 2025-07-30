# Progress - Small MVP Features

## Current Status: Backend Foundation ✅

### Completed

- ✅ Express server with tRPC
- ✅ Database schema and migrations
- ✅ Authentication middleware
- ✅ Basic validation utilities
- ✅ Test setup with Vitest
- ✅ ESLint and TypeScript configuration

---

## MVP Feature 1: User Registration ✅

**Goal:** Users can create accounts

**Backend:**

- ✅ POST /auth/register endpoint
- ✅ Email/password validation
- ✅ User table storage
- ✅ Basic error handling

**Frontend:**

- ✅ Registration form component
- ✅ Form validation
- ✅ Success/error feedback
- ✅ Redirect to login

**Success:** User can register and see confirmation

---

## MVP Feature 2: User Login ✅

**Goal:** Users can sign in

**Backend:**

- ✅ POST /auth/login endpoint
- ✅ JWT token generation
- ✅ Password verification
- ✅ Session management

**Frontend:**

- Login form component
- Token storage (localStorage)
- Protected route wrapper
- Logout functionality

**Success:** User can login and access protected pages

---

## MVP Feature 3: Basic Profile ✅

**Goal:** Users have profile information

**Backend:**

- ✅ GET /user/profile endpoint
- ✅ Profile data storage
- ✅ Basic profile update

**Frontend:**

- Profile display component
- Profile edit form
- Avatar placeholder

**Success:** User can view and edit their profile

---

## MVP Feature 4: Case Submission Form

**Goal:** Users can submit help requests

**Backend:**

- POST /cases/submit endpoint
- Case table with basic fields
- File upload handling (1-2 images)
- Status: "pending"

**Frontend:**

- Case submission form
- Image upload component
- Form validation
- Success confirmation

**Success:** User can submit a case with images

---

## MVP Feature 5: Admin Case Review

**Goal:** Admins can approve/reject cases

**Backend:**

- GET /admin/cases (pending list)
- PUT /admin/cases/:id/approve
- PUT /admin/cases/:id/reject
- Admin role middleware

**Frontend:**

- Admin dashboard
- Case list with actions
- Approve/reject buttons
- Status indicators

**Success:** Admin can review and approve/reject cases

---

## MVP Feature 6: Public Case Display

**Goal:** Anyone can view approved cases

**Backend:**

- GET /cases/public (approved only)
- Case details endpoint
- Image serving

**Frontend:**

- Public case listings
- Case detail view
- Image gallery
- Basic pagination

**Success:** Public can browse approved cases

---

## MVP Feature 7: Home Page & Navigation

**Goal:** Basic site structure

**Frontend:**

- Home page with case previews
- Navigation menu
- Responsive layout
- Basic styling

**Success:** Site has clear navigation and structure

---

## MVP Feature 8: Search & Filter

**Goal:** Users can find specific cases

**Backend:**

- GET /cases/search endpoint
- Basic text search
- Category filtering

**Frontend:**

- Search bar
- Filter dropdowns
- Search results display

**Success:** Users can search and filter cases

---

## Technical Priorities

1. **Database**: User and case tables complete
2. **API**: RESTful endpoints for all features
3. **Auth**: JWT with role-based access
4. **Frontend**: React with routing and forms
5. **File Upload**: Basic image handling
6. **Deployment**: Simple hosting setup

## Success Criteria

- Users can register, login, and submit cases
- Admins can review and approve/reject cases
- Public can browse and search approved cases
- Basic security and validation throughout
- Deployed and accessible online
