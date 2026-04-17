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
