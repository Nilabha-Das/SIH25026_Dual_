const express = require('express');
const ConnectMongo = require('./db');
require('dotenv').config();
const cors = require('cors');
const mappingRoutes = require('./routes/route.mapping');
const icdRoutes = require('./routes/route.icd');
const namasteRoutes = require('./routes/route.namaste');
const fhirRoutes = require('./routes/route.fhir');
const authRoutes = require('./routes/route.auth'); // 👈 add this
const searchRoutes = require("./routes/route.search");
const patientRoutes = require("./routes/route.patient");
const curatorRoutes = require("./routes/route.curator");


const app = express();
app.use(cors());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});


// Connect to MongoDB
ConnectMongo();

// Routes
app.use('/api/auth', authRoutes); // 👈 register/login
app.use('/api/mapping', mappingRoutes);
app.use('/api/icd', icdRoutes);
app.use('/api/namaste', namasteRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/curator', curatorRoutes);
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
