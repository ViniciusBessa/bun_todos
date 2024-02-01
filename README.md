# Bun TODO
This is a simple TODO API built using the Express.js framework and executed using Bun.

## Features
Authentication: Users can sign up, log in, and log out securely.
Account Management: Users can update their profile information and change passwords.
Tasks: Users can manage their TODO tasks by creating, reading, updating, and deleting them.

## Getting Started
1. Clone the repository:

```bash
git clone https://github.com/your-username/todo-api.git
```

2. Install dependencies:

```bash
npm install
```
or

```bash
bun install
```

3. Set up environment variables:
Create a .env file in the root directory of the project and define the following environment variables:

JWT_SECRET=your_secret_key
MONGO_URI=your_database_connection_string
Make sure to replace your_secret_key with your secret key for JWT token signing and your_database_connection_string with your MongoDB connection string.

4. Run the application:

```bash
bun run start
```
Access the API at http://localhost:3000.

## API Endpoints

### Auth
POST /api/v1/auth/register: Register a new user.
POST /api/v1/auth/login: Log in an existing user.
GET /api/v1/auth/account: Get the current user's profile.

### Users
GET /api/v1/users/:userId: Get an user's profile.
PUT /api/v1/users/:userId: Update an user's profile.
DELETE /api/v1/users/account: Delete the current user's account.
DELETE /api/v1/users/:userId: Delete an user's account.

### Tasks
GET /api/v1/tasks: Get all tasks.
POST /api/v1/tasks: Create a new task.
GET /api/v1/tasks/:taskId: Get a task by ID.
PUT /api/v1/tasks/:taskId: Update a task by ID.
DELETE /api/v1/tasks/:taskId: Delete a task by ID.

## License
This project is licensed under the MIT License.
