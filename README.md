# Meemli Program Manager

A program management platform for Meemli, an organization providing pro-bono tutoring services to students. Meemli has asked us to consolidate and simplify their student attendance workflow. This application allows for program and student management in one centralized interface. Administrative users can assign teachers and restrict visibility only to their respective courses. Teachers can track their students' progress, mark attendance, and leave comments on their performance.

## Setup

### Tools
Before starting development, make sure you have these tools installed:

- [Node.js](https://nodejs.org/en) - this is our JS runtime
- [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - this is our package manager
- [Postman](https://www.postman.com/downloads/) - helpful for testing API routes
- [MongoDB Community](https://www.mongodb.com/docs/manual/administration/install-community/) - necessary if you want to run database locally

### Environment
Add the `.env.frontend` and `.env.backend` from the project google drive to their respective directories in your local branch.

### Backend

1. `cd backend`
2. Run `npm install` to install all dependencies
3. If running the database locally, make sure to [start mongod](https://www.mongodb.com/docs/manual/tutorial/manage-mongodb-processes/#start-mongod-processes)
4. `npm run start` to start the backend

If this works properly you should see a message in the terminal saying `> Listening on port 4000`

### Frontend

1. `cd frontend`
2. Run `npm install` to install all dependencies
3. Run `npm run dev` to start development server
4. Server is started on port 3000. Follow this [url](http://localhost:3000) and you should see the development page.

## Linting
Run these commands in the `backend` or `frontend` directories for linting and formating. Be sure to run these commands before pushing to github.

- `npm run lint-fix` - fixes all auto-fixable lint errors and reformats code
- `npm run lint-check` - check all lint errors or code style issues without modifying any files
