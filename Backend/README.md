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

```
Backend/
├── config/
│   └── passport.js         # Passport.js configuration for authentication
├── middleware/
│   ├── auditLogger.js      # Middleware for logging audit trails
│   ├── auth.js             # Authentication middleware (e.g., JWT verification)
│   └── validateRole.js     # Role-based access control middleware
├── models/
│   ├── AuditLog.js         # Schema for audit logs
│   ├── icd.js              # Schema for ICD-11 codes
│   ├── mapping.js          # Schema for NAMASTE-ICD11 mappings
│   ├── namaste.js          # Schema for NAMASTE codes
│   ├── tm2.js              # Schema for TM2 codes
│   └── User.js             # User schema for authentication and roles
├── routes/
│   ├── route.audit.js      # Routes for accessing audit logs
│   ├── route.auth.js       # Authentication routes (e.g., login, logout)
│   ├── route.curator.js    # Routes for curator-specific actions
│   ├── route.fhir.js       # FHIR-compliant endpoints
│   ├── route.icd.js        # Routes for ICD-11 data
│   ├── route.mapping.js    # Routes for managing mappings
│   ├── route.namaste.js    # Routes for NAMASTE data
│   ├── route.oauth.js      # OAuth specific routes
│   ├── route.otp.js        # OTP generation and verification routes
│   ├── route.patient.js    # Routes for patient-related data
│   ├── route.search.js     # Search endpoints
│   └── route.tm2.js        # Routes for TM2 data
├── services/
│   ├── otpService.js       # Service for handling OTP logic
│   └── terminology/
│       ├── confidenceEnhancer.js # Logic to enhance mapping confidence
│       ├── fhirConceptMap.js   # Service for creating FHIR ConceptMaps
│       ├── namasteIngestion.js # Service for ingesting NAMASTE data
│       ├── terminologyService.js # Core terminology service
│       └── whoIcd11Api.js      # Client for WHO ICD-11 API
├── utils/
│   └── semanticMatching.js # Utility for semantic matching algorithms
├── .env.example            # Example environment variables
├── db.js                   # MongoDB connection setup
├── index.js                # Main server entry point
├── package.json            # Project dependencies and scripts
└── README.md               # This documentation file
```

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
```env
MONGODB_URI=mongodb://localhost:27017/namaste_icd
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
WHO_API_KEY=your_who_api_key
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Testing

Run tests:
```bash
npm test
```

## API Documentation

Visit `/api-docs` when the server is running to view the Swagger documentation.
