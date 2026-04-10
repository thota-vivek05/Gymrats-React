# API Endpoint Authorization Map

> Which user role is authorized to access which endpoint, where the swagger doc is, and where the route is defined.

---

## Roles

| Role | Auth Method | Middleware |
|------|------------|------------|
| **Public** | None | No middleware |
| **User** | JWT Bearer Token | `protect` |
| **Trainer** | JWT Bearer Token | `protect` |
| **Admin / Manager** | JWT Bearer Token | `admin_Protect` |
| **Verifier** | Session Cookie | `requireAuth` |

---

## Public (No Login Required)

| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `POST` | `/api/auth/login` | Login as user or trainer | `auth.swagger.js` | `Routes/authRoutes.js` |
| `POST` | `/signup` | Register new user | `auth.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/trainer/signup` | Trainer application with resume | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `POST` | `/api/logout` | Destroy session | `auth.swagger.js` | `server.js` |
| `GET` | `/api/admin/login` | Admin login page | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/login` | Admin login | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/logout` | Admin logout | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/verifier/login` | Verifier login page | — | `Routes/verifierRoutes.js` |
| `POST` | `/api/verifier/login` | Verifier login | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/register` | Verifier registration page | — | `Routes/verifierRoutes.js` |
| `POST` | `/api/verifier/register` | Register verifier | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/pendingverifications` | View pending verifications | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/verify/:id` | View verification details | — | `Routes/verifierRoutes.js` |
| `POST` | `/api/verifier/verify/:id` | Process a verification | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/trainer/resume/:filename` | Download a resume | `trainer.swagger.js` | `Routes/trainerRoutes.js` |

---

## User (JWT — `protect`)

| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/auth/profile` | Get decoded JWT profile | `auth.swagger.js` | `Routes/authRoutes.js` |
| `GET` | `/api/user/profile` | Get full profile with trainer info | `user.swagger.js` | `Routes/userRoutes.js` |
| `PUT` | `/api/user/profile` | Update profile | `user.swagger.js` | `Routes/userRoutes.js` |
| `PUT` | `/api/user/password` | Change password | `user.swagger.js` | `Routes/userRoutes.js` |
| `DELETE` | `/api/user/account` | Delete own account | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/user/purchases` | Purchase history | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/user/trainer/rate` | Rate assigned trainer | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/user/trainer/change` | Request trainer change | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/workout/today` | Today's workout | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/workout/weekly-stats` | Weekly workout stats | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/workout/complete` | Mark workout completed | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/exercise/complete` | Mark exercise completed | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/exercise/progress` | Bench/Squat/Deadlift progress | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/nutrition/today` | Today's nutrition data | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/nutrition/mark-consumed` | Mark food consumed | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/class/upcoming` | Next upcoming class | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/exercises` | Exercises for user's workout type | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/exercises/recommended` | Recommended exercises | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/exercises/search?query=` | Search exercises | `user.swagger.js` | `Routes/userRoutes.js` |
| `GET` | `/api/exercises/:exerciseId` | Exercise details | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/exercises/:exerciseId/rate` | Rate an exercise | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/api/membership/extend` | Extend membership | `user.swagger.js` | `Routes/userRoutes.js` |
| `POST` | `/user/membership/change` | Change membership type | `user.swagger.js` | `Routes/userRoutes.js` |

---

## Trainer (JWT — `protect`)

| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/trainer/clients` | Get assigned clients | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/client/:id` | Get client details | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/client-progress/:clientId` | Client progress | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/workout/:userId` | Get client workout data | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `POST` | `/api/trainer/save-workout-plan` | Save client workout plan | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/nutrition/:userId` | Get client nutrition data | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `POST` | `/api/trainer/edit_nutritional_plan` | Save client nutrition plan | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/exercise-ratings/:userId` | Client exercise ratings | `trainer.swagger.js` | `Routes/trainerRoutes.js` |
| `GET` | `/api/trainer/exercises/list` | All verified exercises | `trainer.swagger.js` | `Routes/trainerRoutes.js` |

---

## Admin / Manager (JWT — `admin_Protect`)

### Users
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/dashboard` | Dashboard stats | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/users` | List all users | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/users/dropped` | Dropped users | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/users/:id/details` | User details | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/users` | Create user | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/users/:id` | Update user | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `DELETE` | `/api/admin/users/:id` | Delete user | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Trainers
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/trainers` | List all trainers | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/trainers` | Create trainer | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/trainers/:id` | Update trainer | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `DELETE` | `/api/admin/trainers/:id` | Delete trainer | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/trainers/search` | Search trainers | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/trainer-stats` | Trainer statistics | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Trainer Applications
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/trainer-applications` | Pending applications | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/trainer-applications/:id/approve` | Approve | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/trainer-applications/:id/reject` | Reject | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Trainer Assignment
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/trainer-assignment-data` | Assignment UI data | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/assign-trainer-admin` | Assign trainer to user | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Exercises
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/exercises` | List exercises | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/exercises/search` | Search exercises | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/exercises` | Create exercise | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/exercises/:id` | Update exercise | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `DELETE` | `/api/admin/exercises/:id` | Delete exercise | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Memberships
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/memberships` | List memberships | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/memberships` | Create membership | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/memberships/:id` | Update membership | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `DELETE` | `/api/admin/memberships/:id` | Delete membership | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Verifiers
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/verifiers` | List verifiers | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/verifiers` | Create verifier | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/verifiers/:id` | Update verifier | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `DELETE` | `/api/admin/verifiers/:id` | Delete verifier | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/verifiers/:id/approve` | Approve verifier | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/verifiers/:id/reject` | Reject verifier | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Ratings
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/ratings/top-exercises` | Top-rated exercises | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/ratings/trainer-leaderboard` | Trainer leaderboard | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/ratings/trainer/:trainerId/reviews` | Trainer reviews | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `PUT` | `/api/admin/ratings/flag-review/:reviewId` | Flag a review | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Reassignment
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/reassignment/poorly-rated-trainers` | Poorly rated trainers | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/reassignment/potential-trainers/:userId` | Potential replacements | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `POST` | `/api/admin/reassignment/assign` | Reassign user | `admin.swagger.js` | `Routes/adminRoutes.js` |
| `GET` | `/api/admin/reassignment/pending-flags` | Pending flags | `admin.swagger.js` | `Routes/adminRoutes.js` |

### Analytics
| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/admin/analytics/total-revenue` | Total revenue | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/monthly-revenue` | Monthly breakdown | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/monthly-growth` | Growth percentage | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/trainer-revenue` | Revenue per trainer | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/membership-revenue` | Revenue by plan | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/revenue-per-user` | Revenue per user | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/revenue-per-user/:userId` | Specific user revenue | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/trainer-performance` | Trainer metrics | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/trainer/:trainerId/user-revenue` | Trainer's user revenue | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/trainer/:trainerId/monthly-trend` | Trainer monthly trend | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/users/active` | Active users | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/users/expired` | Expired users | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/users/dropped` | Dropped users | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |
| `GET` | `/api/admin/analytics/users/renewals` | Renewal tracking | `admin.swagger.js` | `Routes/adminAnalyticsRoutes.js` |

---

## Verifier (Session — `requireAuth`)

| Method | Endpoint | Purpose | Swagger Doc | Route File |
|--------|----------|---------|-------------|------------|
| `GET` | `/api/verifier/` | Dashboard | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/api/dashboard` | Dashboard data (JSON) | — | `Routes/verifierRoutes.js` |
| `POST` | `/api/verifier/api/quick-action` | Quick action | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/approvedverifications` | Approved list | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/rejectedverifications` | Rejected list | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/approve/:id` | Approve trainer | — | `Routes/verifierRoutes.js` |
| `GET` | `/api/verifier/reject/:id` | Reject trainer | — | `Routes/verifierRoutes.js` |
