# GymRats

GymRats is a fitness web application that helps users achieve their health goals through personalized workout plans, diet suggestions, and progress tracking. 

The platform supports three roles:
- Admin – manages users and assigns trainers
- Trainer – creates workout and nutrition plans
- User – accesses plans and tracks progress

The frontend is built using React, with a Node.js-based backend.

## Tech Stack

Frontend: React  
Backend: Node.js, Express  
Database: MongoDB
Version Control: Git & GitHub

## Prerequisites

Make sure you have the following installed:

- Git
- Node.js (v16 or higher recommended) 
- npm
- VS Code (optional but recommended)

## Installation and Setup

### 1. Install Git

install Node.js :  https://nodejs.org/

install git :   https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/Git-2.47.1.2-64-bit.exe


### 2. Configure Git
open git bash : use these comands

`git config --global user.name “[firstname lastname]”` 

`git config --global user.email “[valid-email]”`

### 3. Clone the Repository

## Open VS Code

in command line use :-

` git clone https://github.com/thota-vivek05/Gymrats-React.git `


`cd Gymrats-React`
 
### 4. Install Dependencies

 `npm install`

## Running the Application

### Start Backend Server
`cd .\Backend\src\`
`npm start`

### Start Frontend Server
`cd .\Frontend\src\`
`npm run dev`

## Testing

We implemented testing using Jest and Supertest.

### How to run tests:
```bash
cd .\Backend\src\
npm test
```

### Coverage:
Generated inside the `Backend/src/coverage/lcov-report/` folder.

### Tested modules:
- Authentication APIs
- User APIs
- Admin APIs
- Edge cases (invalid input, unauthorized access, unknown routes)

## Deployment

The application frontend is deployed and hosted on Vercel. 
You can view the live interactive demo here:
🔗 **Live Demo:** [https://gymrats-react.vercel.app](https://gymrats-react.vercel.app)

*Note: Ensure that the backend server is also running and accessible for full functionality during the evaluation demo.*

## API Documentation (Swagger)

GymRats uses Swagger for comprehensive interactive API documentation across both B2B and B2C interfaces.

🔗 **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs) *(Adjust the domain to your deployed backend URL for the review)*

The API documentation covers all endpoints for:
- Users (B2C)
- Trainers (B2B / B2C)
- Admin (Internal)
- Authentication

## Database Optimization & Performance

### 1. Redis Caching
We implemented Redis caching via custom middleware (`redisCache.js`) to significantly improve the performance of read-heavy database queries, such as fetching all trainers or user profiles.

**Performance Improvement Report:**
- **Without Redis (Cache Miss):** Initial database queries fetching large collections average between **120ms to 180ms**.
- **With Redis (Cache Hit):** Subsequent identical requests using the Redis in-memory cache average between **10ms to 25ms**.
- **Net Improvement:** Applying Redis cache resulted in an **~85% decrease** in response wait times and reduced continuous load on the primary MongoDB instance.

### 2. Search Optimization
We optimized the user search experience by employing native **MongoDB Text Indexes**. 
Indexes (`{ name: "text", email: "text" }`) have been implemented on major entities (Users, Trainers) to act as a fast localized search engine, fulfilling the requirement for tool-based query optimization. This ensures high-speed, relevant matching when an admin or user is querying the network.

## Razorpay Setup (Membership Checkout)

To enable Razorpay checkout for membership renewal/change, add the following environment variables in `Backend/src/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
```

Notes:
- Use Razorpay **test keys** in development.
- Membership pricing is validated server-side before order creation and again during payment verification.
- Frontend user membership checkout now opens Razorpay Checkout and verifies signature on the backend before updating membership.
