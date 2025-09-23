// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

// Debug environment loading
console.log('Loading .env from:', __dirname + '/.env');
console.log('GOOGLE_CLIENT_ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'Yes' : 'No');

const express = require('express');
const ConnectMongo = require('./db');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); // Import passport configuration

const mappingRoutes = require('./routes/route.mapping');
const icdRoutes = require('./routes/route.icd');
const namasteRoutes = require('./routes/route.namaste');
const fhirRoutes = require('./routes/route.fhir');
const authRoutes = require('./routes/route.auth'); // 👈 add this
const oauthRoutes = require('./routes/route.oauth'); // OAuth routes
const otpRoutes = require('./routes/route.otp'); // OTP routes
const searchRoutes = require("./routes/route.search");
const patientRoutes = require("./routes/route.patient");
const curatorRoutes = require("./routes/route.curator");
const auditRoutes = require("./routes/route.audit");
const tm2Routes = require('./routes/route.tm2'); // TM2 Traditional Medicine Module


const app = express();
app.use(cors());

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


// Connect to MongoDB
ConnectMongo();

// Routes
app.use('/api/auth', authRoutes); // 👈 register/login
app.use('/', oauthRoutes); // OAuth routes (Google, etc.) - mounted at root to match Google OAuth config
app.use('/api/otp', otpRoutes); // OTP verification routes
app.use('/api/mapping', mappingRoutes);
app.use('/api/icd', icdRoutes);
app.use('/api/namaste', namasteRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/curator', curatorRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tm2', tm2Routes); // TM2 Traditional Medicine Module
app.use('/fhir', fhirRoutes);
app.use('/api', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is up and running on port ${process.env.PORT}`);
});
 