# Backend Documentation

## Overview

The backend service provides a RESTful API for the NAMASTE-ICD11 dual-coding system. It's built with Node.js and Express, using MongoDB for data persistence and Redis for caching.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: Passport.js with Google OAuth2.0
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Project Structure

\`\`\`
Backend/
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication middleware
│   └── validateRole.js  # Role validation
├── models/              # MongoDB schemas
│   ├── icd.js          # ICD-11 code schema
│   ├── mapping.js      # NAMASTE-ICD mapping schema
│   ├── namaste.js      # NAMASTE code schema
│   └── User.js         # User model
├── routes/             # API routes
│   ├── route.auth.js   # Authentication routes
│   ├── route.curator.js # Curator specific routes
│   ├── route.fhir.js   # FHIR compliant endpoints
│   ├── route.icd.js    # ICD-11 related routes
│   ├── route.mapping.js # Mapping management
│   ├── route.namaste.js # NAMASTE code endpoints
│   ├── route.patient.js # Patient specific routes
│   └── route.search.js  # Search functionality
├── index.js           # Server entry point
├── db.js             # Database connection
└── package.json      # Dependencies
\`\`\`

## API Endpoints

### Authentication

- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/login` - Local authentication
- `GET /api/auth/logout` - Logout

### FHIR Resources

- `GET /api/fhir/CodeSystem` - List available code systems
- `GET /api/fhir/ValueSet` - Retrieve value sets
- `GET /api/fhir/ConceptMap` - Get concept mappings

### Mapping Management

- `GET /api/mapping/search` - Search mappings
- `POST /api/mapping/create` - Create new mapping
- `PUT /api/mapping/update/:id` - Update mapping

## Environment Setup

Required environment variables:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/namaste_icd
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
WHO_API_KEY=your_who_api_key
\`\`\`

## Development Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

## API Documentation

Visit `/api-docs` when the server is running to view the Swagger documentation.