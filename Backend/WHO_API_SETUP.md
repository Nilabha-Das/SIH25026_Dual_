# WHO ICD-11 API Integration Setup Guide

## 🌍 Phase 2: WHO ICD-11 API Integration

This guide helps you integrate your NAMASTE terminology system with the official WHO ICD-11 API for enhanced validation and real-world data integration.

## 📋 Prerequisites

- Node.js backend with terminology service running
- Internet connection for API calls
- WHO developer account (free registration)

## 🔐 Step 1: Get WHO API Credentials

1. **Visit WHO ICD-11 Developer Portal**
   - Go to: https://icd.who.int/icdapi
   - Click "Register for API Access"

2. **Create Developer Account**
   - Fill out registration form
   - Provide project details (mention "SIH 2025 AYUSH EMR System")
   - Agree to terms of service

3. **Get API Credentials**
   - After approval, you'll receive:
     - Client ID
     - Client Secret
   - Note: Approval can take 1-2 business days

## ⚙️ Step 2: Configure Environment

Update your `.env` file with your WHO API credentials:

```env
# WHO ICD-11 API Configuration
WHO_ICD11_CLIENT_ID=your_actual_client_id_here
WHO_ICD11_CLIENT_SECRET=your_actual_client_secret_here
```

## 🚀 Step 3: Start Enhanced Service

1. **Install Dependencies** (if not already done):
   ```bash
   cd Backend
   npm install axios
   ```

2. **Start Terminology Service**:
   ```bash
   node launch-terminology.js
   ```

3. **Verify WHO Integration**:
   - Visit: http://localhost:3001/who/health
   - Should show authentication status

## 📊 Step 4: Test WHO API Features

### Health Check
```bash
curl http://localhost:3001/who/health
```

### Search ICD-11
```bash
curl "http://localhost:3001/who/search?q=diabetes"
```

### Get ICD-11 Entity
```bash
curl http://localhost:3001/who/icd11/CA23
```

### Validate Mapping
```bash
curl -X POST http://localhost:3001/who/validate-mapping \
  -H "Content-Type: application/json" \
  -d '{
    "namasteCode": "NAM002",
    "icdCode": "CA23",
    "namasteDisplay": "Asthma (Unani)",
    "icdTitle": "Asthma"
  }'
```

## 🎯 Demo Mode

If you don't have WHO API credentials yet, the service will automatically use **mock data** for demonstration purposes. This allows you to:

- ✅ Show the integration architecture
- ✅ Demonstrate API endpoints
- ✅ Present validation concepts
- ✅ Display real-world integration readiness

## 🏆 Benefits for SIH 2025

1. **Real-world Integration**: Shows connection to international standards
2. **Validation System**: Proves mapping accuracy with official data
3. **Scalability**: Demonstrates enterprise-ready architecture
4. **Interoperability**: Bridges traditional and modern healthcare systems

## 🔧 Troubleshooting

### Authentication Issues
- Check credentials in `.env` file
- Verify WHO API account is approved
- Test with mock mode first

### Rate Limiting
- WHO API has rate limits
- Service includes caching to minimize calls
- Use bulk validation endpoint sparingly

### Network Issues
- Ensure internet connectivity
- Check firewall settings
- Consider proxy configuration if needed

## 📈 Performance Optimization

The service includes several optimizations:

- **Caching**: Results cached for 24 hours (entities) / 6 hours (search)
- **Rate Limiting**: Built-in delays to respect WHO API limits
- **Bulk Operations**: Limited to 50 items for performance
- **Error Handling**: Graceful fallback to mock data

## 🎨 Frontend Integration

The WHO API integration is already showcased in:

- **API Documentation** (`/api` page)
- **Terminology Demo** (`/terminology` page)
- **Interactive validation** features

## 🌟 Next Steps

With WHO API integration complete, you can:

1. **Deploy to production** with real WHO credentials
2. **Add more validation rules** based on WHO data
3. **Implement automated mapping updates**
4. **Scale to handle larger datasets**

## 📞 Support

For WHO API issues:
- WHO Support: https://icd.who.int/contact
- Technical Documentation: https://icd.who.int/docs/icd-api

For implementation help:
- Check service logs for detailed error messages
- Use `/who/health` endpoint for diagnostics
- Test with mock data first before using live API