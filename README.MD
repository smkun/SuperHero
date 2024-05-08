# Superhero App

## Overview

This web application is built with Node.js, utilizing Express and Mongoose for backend operations. It includes features such as user authentication, superhero management, and superhero battles. The views are rendered using EJS, and it connects to a MongoDB database for storing data.

## Functional Components

### 1. Core Setup and Middleware
- **Express and Mongoose**: Used for server setup, handling requests, responses, and database operations.
- **Session Management**: Utilizes `express-session` for managing user sessions.
- **Passport.js**: Integrated for user authentication using strategies like local username and password.
- **Method Override**: Allows PUT and DELETE operations from forms by overriding POST methods.
- **Static Files**: Serves images and CSS from the public directory.

### 2. Routers
- **Superhero Router**: Handles CRUD operations for superheroes.
- **Authentication Router**: Manages user registration, login, and logout.
- **Fight Router**: Facilitates superhero battles and determines winners based on stats.

### 3. User Authentication
- Features user registration, login, and logout.
- Passwords are hashed using bcrypt for security.
- Authentication middleware restricts access to certain routes to authenticated users only.

### 4. Superhero Management
- Allows users to create, view, edit, and delete superheroes.
- Superhero operations are restricted to authenticated users.

### 5. Battle System
- Enables users to select superheroes for battles.
- Compares superheroes on predefined criteria to determine a winner.
- Displays battle results and relevant superhero details.

### 6. Views and Templates
- Uses EJS for dynamic content rendering.
- Organized views to support user activities like registration, login, and superhero management.

### 7. Database Connection
- Connects to MongoDB with credentials stored in environment variables.
- Manages database connectivity issues and logs events.

### 8. Environment Configuration
- Utilizes `dotenv` for managing environment variables to secure sensitive data.

## Deployment

The app runs on port 3005, providing console messages that indicate server and database statuses. This README offers a detailed guide to understanding and managing the app.
