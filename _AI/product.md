1 # Help-Seeking Platform - Product Requirements Document
2
3 ## Document Update Guidelines
4
5 **Important:** When updating this document, maintain the hierarchical numbering system:
6
7 1. Keep existing numbering for unchanged items
8 2. When adding new items, insert them with appropriate numbering
9 3. When removing items, update all subsequent numbering in that section
10 4. Maintain consistent indentation levels for sub-items
11 5. Always verify that the numbering sequence is complete and logical after changes
12
13 ## Project Overview
14
15 **Product Name:** Help-Seeking Platform  
16 **Type:** Production-ready web application  
17 **Purpose:** Connect people in need with potential helpers through a human verified, secure platform
18
19 ## User Roles & Permissions
20
21 ### 1. Help Seekers (Registration Required)
22
23 **Core Features:**
24
25 1.1. User registration with email verification (Supabase Auth)
26 1.2. Profile creation with personal information (Supabase Storage)
27 1.3. Case submission with:
28 1.3.1. Full Name
29 1.3.2. Description
30 1.3.3. Image uploads (multiple images supported)
31 1.3.4. Contact preference (GoFundMe link OR WhatsApp number)
32 1.3.5. Urgency level
33 1.3.6. Location
34 1.4. View submission status (pending, verified, flagged)
35 1.5. Edit profile information
36 1.6. Delete account
37
38 **Data Requirements:**
39
40 1.7. Email address (verified)
41 1.8. Full name
42 1.9. Phone number
43 1.10. Case details
44 1.11. Donation link (GoFundMe link etc.)
45
46 ### 2. Help Providers (Optional Registration)
47
48 **Core Features:**
49
50 2.1. Browse verified help seeker cases
51 2.2. Search and filter cases by:
52 2.2.1. Location
53 2.2.2. Urgency level
54 2.2.3. Category/type of help needed
55 2.3. View case details including:
56 2.3.1. Seeker's basic information
57 2.3.2. Case description
58 2.3.3. Images
59 2.3.4. Contact information (GoFundMe or WhatsApp)
60
61 ### 3. Admins (Secure Login Required)
62
63 **Core Features:**
64
65 3.1. Secure login with email/password
66 3.2. Review pending help seeker submissions
67 3.3. Verify or flag cases with:
68 3.3.1. Approval/rejection decision
69 3.3.2. Remarks/notes for each action
70 3.3.3. Timestamp and admin identification
71 3.4. View verified and flagged cases
72 3.5. Search and filter cases by status
73 3.6. Bulk operations for multiple cases
74 3.7. View admin activity history
75
76 **Permissions:**
77
78 3.8. Can verify/flag cases
79 3.9. Can view all case details
80 3.10. Can leave remarks
81 3.11. Cannot assign other admins
82 3.12. Cannot view audit logs
83
84 ### 4. Super Admins (Secure Login Required)
85
86 **Core Features:**
87
88 4.1. All Admin features plus:
89 4.2. User role management:
90 4.2.1. Assign admin roles by email
91 4.2.2. Remove admin roles
92 4.2.3. View all users and their roles
93 4.3. Comprehensive audit logging:
94 4.3.1. View all system actions
95 4.3.2. Filter by user, action type, date range
96 4.3.3. Export audit logs
97 4.4. System-wide settings management
98 4.5. Database maintenance tools
99 4.6. User account management
100
101 **Permissions:**
102
103 4.7. Full system access
104 4.8. Can assign/remove admin roles
105 4.9. Can view all audit logs
106 4.10. Can manage system settings
107 4.11. Can delete user accounts
108
109 ## Core Features & Requirements
110
111 ### Authentication & Security
112
113 5.1. Multi-factor authentication for admin and super admin accounts
114 5.2. Role-based access control (RBAC) with JWT tokens
115 5.3. Session management with secure token refresh
116 5.4. Password policies for admin accounts
117 5.5. Rate limiting on authentication endpoints
118 5.6. Audit logging for all authentication events
119
120 ### Case Management
121
122 5.7. Case submission workflow:
123 5.7.1. User registers/logs in
124 5.7.2. Fills case details form
125 5.7.3. Uploads images (max 5 images, 5MB each)
126 5.7.4. Submits for admin review
127 5.7.5. Receives status updates
128 5.8. Case verification process:
129 5.8.1. Admin reviews submission
130 5.8.2. Checks images and details
131 5.8.3. Approves or flags with remarks
132 5.8.4. System logs action with timestamp
133 5.9. Case display:
134 5.9.1. Public listing of verified cases only
135 5.9.2. Responsive card layout
136 5.9.3. Image gallery with lazy loading
137 5.9.4. Contact information display
138 5.9.5. Search and filter functionality
139
140 ### Image Management
141
142 5.10. Upload requirements:
143 5.10.1. Supported formats: JPG, PNG, WebP
144 5.10.2. Maximum file size: 5MB per image
145 5.10.3. Maximum images per case: 5
146 5.10.4. Automatic image optimization
147 5.11. Storage:
148 5.11.1. Supabase Storage with RLS policies
149 5.11.2. Signed URLs for secure access
150 5.11.3. Image transformations (resize, compress)
151 5.12. Security:
152 5.12.1. Virus scanning on upload
153 5.12.2. Content validation
154 5.12.3. Access control via RLS
155
156 ### Database Requirements
157
158 #### Core Tables
159
160 5.13. Users Table: Store user accounts with roles, authentication data, and profile information
161 5.14. Cases Table: Store help requests with status, verification data, and contact information
162 5.15. Case Images Table: Store uploaded images with metadata and file information
163 5.16. Audit Logs Table: Track all system actions for security and compliance
164
165 #### Data Relationships
166
167 5.17. Users can have multiple cases (one-to-many)
168 5.18. Cases can have multiple images (one-to-many)
169 5.19. All actions are logged in audit table with user and resource references
170 5.20. Role-based access control enforced at database level
171
172 ### API Endpoints
173
174 #### Authentication
175
176 5.21. POST /auth/register - User registration
177 5.22. POST /auth/login - User login
178 5.23. POST /auth/logout - User logout
179 5.24. POST /auth/refresh - Refresh token
180 5.25. POST /auth/verify-email - Email verification
181
182 #### Cases
183
184 5.26. GET /cases - List verified cases (public)
185 5.27. POST /cases - Create new case (authenticated)
186 5.28. GET /cases/:id - Get case details
187 5.29. PUT /cases/:id - Update case (owner only)
188 5.30. DELETE /cases/:id - Delete case (owner only)
189 5.31. POST /cases/:id/images - Upload case images
190 5.32. DELETE /cases/:id/images/:imageId - Delete case image
191
192 #### Admin
193
194 5.33. GET /admin/cases - List all cases (admin only)
195 5.34. PUT /admin/cases/:id/verify - Verify case (admin only)
196 5.35. PUT /admin/cases/:id/flag - Flag case (admin only)
197 5.36. GET /admin/audit-logs - View audit logs (super admin only)
198
199 #### Users
200
201 5.37. GET /users/profile - Get user profile
202 5.38. PUT /users/profile - Update user profile
203 5.39. GET /admin/users - List all users (super admin only)
204 5.40. PUT /admin/users/:id/role - Assign user role (super admin only)
205
206 ## UI/UX Requirements
207
208 ### Design System
209
210 6.1. Material UI v5 with custom theme
211 6.2. Responsive design (mobile-first approach)
212 6.3. Accessibility compliance (WCAG 2.1 AA)
213 6.4. Dark/Light mode support
214 6.5. Consistent spacing and typography
215
216 ### Key Pages
217
218 #### Public Pages
219
220 6.6. Home/Landing Page: Introduction, featured cases, call-to-action
221 6.7. Cases Listing: Grid/list view of verified cases with filters
222 6.8. Case Detail: Full case information with images and contact details
223 6.9. Registration: User registration form
224 6.10. Login: Authentication form
225
226 #### Authenticated Pages
227
228 6.11. Dashboard: User's cases and status
229 6.12. Case Submission: Multi-step form for creating cases
230 6.13. Profile Management: Edit personal information
231 6.14. Admin Panel: Case review interface
232 6.15. Super Admin Panel: User and system management
233
234 ### Responsive Breakpoints
235
236 6.16. Mobile: 320px - 768px
237 6.17. Tablet: 768px - 1024px
238 6.18. Desktop: 1024px+
239
240 ## Performance Requirements
241
242 ### Frontend
243
244 7.1. Initial load time: < 3 seconds
245 7.2. Image loading: Lazy loading with placeholders
246 7.3. Bundle size: < 500KB gzipped
247 7.4. Core Web Vitals: Pass all metrics
248
249 ### Backend
250
251 7.5. API response time: < 200ms for most endpoints
252 7.6. Database queries: Optimized with proper indexing
253 7.7. File uploads: Progress indicators and validation
254 7.8. Rate limiting: Prevent abuse
255
256 ## Security Requirements
257
258 ### Data Protection
259
260 8.1. Encryption at rest for sensitive data
261 8.2. HTTPS only in production
262 8.3. Input sanitization and validation
263 8.4. XSS protection on all user inputs
264 8.5. CSRF protection for forms
265
266 ### Access Control
267
268 8.6. JWT token validation on all protected routes
269 8.7. Role-based permissions enforced at API level
270 8.8. Row-level security in database
271 8.9. Audit logging for all sensitive operations
272
273 ### File Security
274
275 8.10. Virus scanning on uploads
276 8.11. File type validation
277 8.12. Size limits enforcement
278 8.13. Secure file serving with signed URLs
279
280 ## Deployment & DevOps
281
282 ### Environment Configuration
283
284 9.1. Development: Local development setup
285 9.2. Staging: Pre-production testing
286 9.3. Production: Live environment
287
288 ### Monitoring & Logging
289
290 9.4. Application logs with structured logging
291 9.5. Error tracking and alerting
292 9.6. Performance monitoring
293 9.7. Health checks for all services
294
295 ### Backup & Recovery
296
297 9.8. Database backups (daily)
298 9.9. File storage backups (daily)
299 9.10. Disaster recovery procedures
300 9.11. Point-in-time recovery capability
301
302 ## Testing Strategy
303
304 ### Unit Testing
305
306 10.1. Frontend: React components and utilities
307 10.2. Backend: API endpoints and business logic
308 10.3. Coverage target: > 80%
309
310 ### Integration Testing
311
312 10.4. API testing with real database
313 10.5. Authentication flows
314 10.6. File upload scenarios
315
316 ### End-to-End Testing
317
318 10.7. User registration and case submission
319 10.8. Admin verification workflow
320 10.9. Super admin role management
321
322 ## Success Metrics
323
324 ### User Engagement
325
326 11.1. Registration rate for help seekers
327 11.2. Case submission completion rate
328 11.3. Admin response time for verifications
329 11.4. User retention rates
330
331 ### Platform Performance
332
333 11.5. System uptime > 99.9%
334 11.6. API response times < 200ms
335 11.7. Error rates < 1%
336 11.8. Security incidents = 0
337
338 ### Business Impact
339
340 11.9. Number of verified cases published
341 11.10. Help provider engagement with cases
342 11.11. Successful connections made through platform
