# User Management and Authentication API

## Overview

This project is a RESTful API for managing users and authentication, built using NestJS, TypeORM, and JWT for authentication. 
The API supports user creation, reading, updating, deleting, and managing user activation and deactivation. 
It includes role-based access control to secure endpoints based on user roles.
This is a good boilerplate for your new project, somehow. :)

## Table of Contents

- [User Management and Authentication API](#user-management-and-authentication-api)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Testing](#testing)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Users](#users)
  - [Entities](#entities)
    - [User](#user)
  - [DTOs](#dtos)
  - [Guards and Decorators](#guards-and-decorators)
    - [JwtAuthGuard](#jwtauthguard)
    - [RolesGuard](#rolesguard)
    - [Roles Decorator](#roles-decorator)
  - [Services](#services)
    - [AuthService](#authservice)
    - [UsersService](#usersservice)
  - [Controllers](#controllers)
    - [AuthController](#authcontroller)
    - [UsersController](#userscontroller)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
  - [Stay in touch with me :)](#stay-in-touch-with-me-)


## Features

- **User Management**: Create, read, update, delete, activate, deactivate & soft delete users.
- **Authentication**: Log in and log out users using JWT.
- **Role-Based Access Control**: Secure endpoints based on user roles (e.g., Admin, Manager, Operator, Patient).
- **Token Blacklisting**: Blacklist tokens upon user logout to prevent reuse, using local cache on RAM.
- **Data Validation**: Validate incoming data using DTOs and class-validator.
- **Testing**: Extensive unit and integration tests using Jest.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (>= v20.14.0)
- npm (>= 10.7.0)
- PostgreSQL (>= 14.12)

## Project Structure

The project structure follows the standard NestJS application structure:

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts
│   ├── interfaces/
│   │   └── token-blacklist.interface.ts
│   ├── services/
│   │   ├── local-token-blacklist.service.ts
│   │   └── redis-token-blacklist.service.ts
│   ├── auth.controller.spec.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.spec.ts
│   ├── auth.service.ts
│   ├── constants.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
├── common/
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── enums/
│   │   └── roles.enum.ts
│   ├── guards/
│   │   └── roles.guard.ts
├── users/
│   ├── dto/
│   │   └── users.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.spec.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.spec.ts
│   ├── users.service.ts
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
test/
├── app.e2e-spec.ts
└── jest-e2e.json
.env
.eslintrc.js
.gitignore
.prettierrc
nest-cli.json
package-lock.json
package.json
README.md
tsconfig.build.json
tsconfig.json
```

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/lucasffa/user-auth-nest
   cd user-auth-nest
   ```

2. Install the dependencies:

   ```
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
# .env
NODE_ENV=development # or production

## jwt
JWT_SECRET=your_hardest_jwt_secret
JWT_EXPIRES_IN=60m

## rate limit
RATE_LIMIT_WINDOW_TIME=60000
RATE_LIMIT_SUPER_USER=3

## db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=anyuser
DATABASE_PASSWORD=your_hardest_password
DATABASE_NAME=db_yourdb

## feature toggles
ENABLE_TOKEN_BLACKLISTING=true

```

## Running the Application

To run the application, use the following command:

```
npm run start:dev
```

This will start the application in development mode. The API will be available at `http://localhost:3000`.

## Testing

The application includes unit and integration tests using Jest. To run the tests, use the following command:

```
npm run test
```

For test coverage:

```
npm run test:cov
```

## API Endpoints

### Authentication

- `POST /auth/login`: Log in a user and receive a JWT token.
- `POST /auth/logout`: Log out a user by blacklisting the token.

### Users

- `POST /users`: Create a new user.
- `GET /users/:uuid`: Retrieve a user by UUID.
- `PUT /users/:uuid`: Update a user by UUID.
- `DELETE /users/:uuid`: Soft delete a user by UUID.
- `POST /users/deactivate/:uuid`: Deactivate a user by UUID.
- `POST /users/activate/:uuid`: Activate a user by UUID.

## Entities

### User

The `User` entity represents a user in the system. It includes fields for the user's UUID, name, email, password, role, and status (active or deleted).

## DTOs

Data Transfer Objects (DTOs) are used for data validation and transfer. They include:

- `CreateUserDto`: For creating a new user.
- `ReadUserDto`: For reading user data.
- `UpdateUserDto`: For updating user data.
- `DeleteUserDto`: For deleting a user.
- `CreateUserResponseDto`: Response data after creating a user.
- `ReadUserResponseDto`: Response data after reading a user.
- `UpdateUserResponseDto`: Response data after updating a user.
- `DeleteUserResponseDto`: Response data after deleting a user.

## Guards and Decorators

### JwtAuthGuard

A guard that implements JWT authentication to protect routes.

### RolesGuard

A guard that implements role-based access control to restrict access to routes based on user roles.

### Roles Decorator

A custom decorator to specify roles allowed to access certain endpoints.

## Services

### AuthService

Handles authentication logic, including login and logout. It verifies user credentials and generates JWT tokens.

### UsersService

Handles user management logic, including creation, reading, updating, deleting, activating, and deactivating users. It interacts with the User repository to perform database operations.

## Controllers

### AuthController

Handles authentication-related endpoints, including login and logout.

### UsersController

Handles user-related endpoints, including creating, reading, updating, deleting, activating, and deactivating users. It uses guards and decorators to enforce authentication and role-based access control.

## Error Handling

The application uses NestJS's built-in exception filters for error handling. Custom exceptions like `NotFoundException`, `ConflictException`, and `InternalServerErrorException` are used to handle specific error scenarios. Ensure to catch errors properly in your service methods and throw appropriate exceptions.

## Logging

The application uses NestJS's built-in logging functionality. Custom log messages are added in services and controllers for debugging and auditing purposes. You can customize the logging level and format in your `main.ts` file or by configuring the logger in the `app.module.ts`.


## Stay in touch with me :)

**Lucas de Almeida**

- [LinkedIn](https://www.linkedin.com/in/lucasffa)
- [GitHub](https://github.com/lucasffa)