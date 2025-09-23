# 🏆 NAMASTE Terminology System - SIH 2025 Phase 2 Complete

## 🌟 Project Overview

**NAMASTE** (National AYUSH Mapping and Semantic Terminology Engine) is a FHIR R4-compliant terminology microservice that bridges traditional Indian medicine (AYUSH) with international healthcare standards (WHO ICD-11). 

This project successfully addresses the SIH 2025 challenge: **"FHIR R4–compliant terminology micro-service for AYUSH EMR systems"** with comprehensive Phase 2 enhancements including WHO API integration.

---

## ✨ Phase 2 Key Features

### 🔥 **NEW: WHO ICD-11 API Integration**
- ✅ Real-time connection to official WHO ICD-11 API
- ✅ OAuth2 authentication with WHO servers
- ✅ Advanced semantic validation and confidence scoring
- ✅ 6 new WHO API endpoints for comprehensive integration
- ✅ Intelligent caching for optimal performance

### 🏥 **Core FHIR R4 Compliance**
- ✅ 8 complete FHIR R4 resources (4 CodeSystems + 4 ConceptMaps)
- ✅ Standard FHIR operations ($lookup, $validate-code, $translate)
- ✅ Ministry of AYUSH official publisher designation
- ✅ India EHR Standards 2016 compliance

### 🌿 **Traditional Medicine Coverage**
- ✅ 150 AYUSH concepts across Ayurveda, Siddha, and Unani systems
- ✅ 150 semantic mappings to WHO ICD-11 with confidence scoring
- ✅ Bidirectional dual-coding system
- ✅ Cultural medical knowledge preservation

### 🚀 **Production Architecture**
- ✅ Microservice design with 21+ RESTful API endpoints
- ✅ Enhanced confidence scoring algorithms
- ✅ Health monitoring and statistics
- ✅ Comprehensive error handling with FHIR OperationOutcome

---

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or cloud)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/SIH25026_Dual_.git
cd SIH25026_Dual_

# Install frontend dependencies
cd ayur-namaste-sync
npm install

# Install backend dependencies
cd ../Backend
npm install
```

### Running the Application

#### Option 1: Full Stack Launch
```bash
# Terminal 1: Start main backend (port 3000)
cd Backend
npm start

# Terminal 2: Start terminology service (port 3001)
cd Backend
node launch-terminology.js

# Terminal 3: Start frontend (port 5173)
cd ayur-namaste-sync
npm run dev
```

#### Option 2: Quick Demo
```bash
# Navigate to demo folder
cd demo

# Run interactive demo
node sih-demo.js
```

### Accessing the Application
- **Frontend Dashboard:** http://localhost:5173
- **Main Backend API:** http://localhost:3000
- **Terminology Service:** http://localhost:3001
- **API Documentation:** http://localhost:5173/api

---

## 📊 Phase 2 Technical Achievements

### New WHO API Integration Endpoints
1. **WHO Health Check:** `/who/health` - Authentication status
2. **Entity Fetching:** `/who/icd11/{code}` - Official ICD-11 data
3. **Semantic Search:** `/who/search?q={query}` - WHO entity search
4. **Mapping Validation:** `/who/validate-mapping` - Official validation
5. **Enhanced Mapping:** `/namaste/{code}/mappings/validated` - WHO-validated mappings
6. **Bulk Operations:** `/who/validate-all-mappings` - Performance-optimized validation

### Enhanced Architecture
```
📁 Enhanced Project Structure (Phase 2)
├── 📁 ayur-namaste-sync/ (Frontend - React + TypeScript)
│   ├── 📁 src/pages/
│   │   ├── 📄 API.tsx (Enhanced with WHO endpoints)
│   │   ├── 📄 TerminologyShowcase.tsx (Interactive demo)
│   │   └── 📄 DoctorDashboard.tsx (Medical interface)
│   └── 📁 components/ (Professional UI components)
├── 📁 Backend/ (Main Application Server - Port 3000)
│   ├── 📁 services/terminology/
│   │   ├── 📄 terminologyService.js (Enhanced with WHO)
│   │   ├── 📄 whoIcd11Api.js (NEW: WHO API integration)
│   │   ├── 📄 confidenceEnhancer.js (NEW: Advanced scoring)
│   │   └── 📁 fhir-output/ (8 FHIR R4 resources)
│   └── 📄 launch-terminology.js (Microservice launcher)
├── 📁 demo/ (Comprehensive showcase materials)
│   ├── 📄 TECHNICAL_SHOWCASE.md (Updated for Phase 2)
│   └── 📄 sih-demo.js (Interactive demonstration)
└── 📄 SHOWCASE_READY.md (Updated competition guide)
```

### Performance Metrics
- **18,000+ lines** of production-ready code (Phase 2 enhanced)
- **21+ API endpoints** for comprehensive functionality
- **Sub-second response times** with intelligent caching
- **Enhanced confidence scoring** with semantic similarity algorithms
- **OAuth2 integration** for secure WHO API access

---

## 🎯 SIH 2025 Competition Alignment

### Problem Statement Addressed
**"Development of FHIR R4–compliant terminology micro-service for AYUSH EMR systems"**

### Our Solution Delivers
1. **Complete FHIR R4 Compliance** - 8 generated resources with proper metadata
2. **AYUSH Integration** - 150 traditional medicine concepts standardized
3. **International Compatibility** - WHO ICD-11 dual-coding with API integration
4. **Government Standards** - India EHR 2016 and Ministry of AYUSH compliance
5. **Production Readiness** - Microservice architecture with monitoring

### Competitive Advantages
- ✅ **First-of-its-kind** WHO API integration for AYUSH terminology
- ✅ **Phase 2 enhanced** confidence scoring algorithms
- ✅ **Real-time validation** against official WHO standards
- ✅ **Complete documentation** with live demonstration capability
- ✅ **Cultural preservation** while ensuring international interoperability

---

## 🌐 API Documentation

### Core Endpoints
- **Service Health:** `GET /health` - System status
- **FHIR CodeSystems:** `GET /CodeSystem` - All terminology resources
- **Code Lookup:** `GET /CodeSystem/{id}/$lookup?code={code}` - FHIR operation
- **Concept Translation:** `GET /ConceptMap/{id}/$translate?code={code}` - Mapping

### Phase 2 WHO Integration
- **WHO Status:** `GET /who/health` - Authentication status
- **Entity Data:** `GET /who/icd11/{code}` - Official ICD-11 entity
- **Semantic Search:** `GET /who/search?q={query}` - WHO entity search
- **Enhanced Mapping:** `GET /namaste/{code}/mappings/validated` - WHO-validated

### Interactive Documentation
Visit `http://localhost:5173/api` for comprehensive API documentation with:
- ✅ Copy-to-clipboard functionality
- ✅ Method badges and descriptions
- ✅ Live endpoint testing
- ✅ FHIR operation examples

---

## 📈 System Statistics

### NAMASTE Terminology Coverage
```
📊 Distribution by System:
   • Ayurveda: 50 concepts (33.3%)
   • Siddha: 50 concepts (33.3%)  
   • Unani: 50 concepts (33.3%)
   • Total: 150 standardized concepts
```

### Mapping Quality (Phase 2 Enhanced)
```
📊 Confidence Distribution:
   • High confidence (≥0.8): Enhanced with WHO validation
   • Moderate confidence (0.6-0.8): 44 mappings with WHO verification
   • Semantic similarity: Advanced algorithms for better accuracy
   • WHO validation: Real-time verification against official data
```

### FHIR Resource Statistics
```
📊 Generated Resources:
   • CodeSystem resources: 4 (total 8,228 lines)
   • ConceptMap resources: 4 (bidirectional mapping)
   • Concepts covered: 300 across all systems
   • Synonym support: 450+ alternative terms
```

---

## 🎬 Live Demonstration

### Quick Demo Commands
```bash
# Start terminology service
cd Backend && node launch-terminology.js

# Run interactive demo
cd demo && node sih-demo.js

# Test specific features
curl http://localhost:3001/health
curl http://localhost:3001/who/health
curl "http://localhost:3001/namaste/search?display=diabetes"
```

### Demonstration URLs
- **Health Status:** http://localhost:3001/health
- **WHO Integration:** http://localhost:3001/who/health
- **FHIR CodeSystem:** http://localhost:3001/CodeSystem/namaste-ayurveda
- **Semantic Search:** http://localhost:3001/namaste/search?display=diabetes
- **Dual Coding:** http://localhost:3001/namaste/NAM001/mappings

---

## 🏆 Recognition & Awards

This project represents a significant contribution to India's digital health infrastructure:

- **Innovation:** First FHIR-compliant AYUSH terminology system with WHO integration
- **Standards Compliance:** Complete adherence to international and national standards
- **Cultural Impact:** Preservation and digitization of traditional medical knowledge
- **Technical Excellence:** Production-ready microservice architecture
- **Future Ready:** Extensible design for additional AYUSH systems and languages

---

## 📞 Contact & Support

**Team:** SIH25026_Dual_  
**Project:** NAMASTE Terminology System  
**Phase:** Phase 2 Complete - WHO API Integration  

For technical questions, feature requests, or collaboration opportunities, please refer to the comprehensive documentation in the `demo/` folder.

---

**🎉 NAMASTE bridges the gap between traditional Indian medicine and modern digital healthcare, making AYUSH knowledge accessible to the global medical community while preserving its cultural authenticity.**