const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to MongoDB");

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("📂 Available collections:", collections.map(c => c.name));

        // Check namaste_collection
        const namasteCollection = collections.find(c => c.name === 'namaste_collection');
        if (namasteCollection) {
            const count = await mongoose.connection.db.collection('namaste_collection').countDocuments();
            console.log(`📊 namaste_collection: ${count} documents`);
        } else {
            console.log('⚠️ namaste_collection not found');
        }

        // Check icd_collection
        const icdCollection = collections.find(c => c.name === 'icd_collection');
        if (icdCollection) {
            const count = await mongoose.connection.db.collection('icd_collection').countDocuments();
            console.log(`📊 icd_collection: ${count} documents`);
        } else {
            console.log('⚠️ icd_collection not found');
        }

        // Check mapping_collection
        const mappingCollection = collections.find(c => c.name === 'mapping_collection');
        if (mappingCollection) {
            const count = await mongoose.connection.db.collection('mapping_collection').countDocuments();
            console.log(`📊 mapping_collection: ${count} documents`);
        } else {
            console.log('⚠️ mapping_collection not found');
        }

    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

// Connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = connectDB;
