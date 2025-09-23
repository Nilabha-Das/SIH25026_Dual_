// utils/semanticMatching.js - Advanced Semantic Matching for Three-Layer Architecture
const natural = require('natural');

// Levenshtein distance for string similarity
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const cleanStr1 = str1.toLowerCase().trim();
  const cleanStr2 = str2.toLowerCase().trim();
  
  if (cleanStr1 === cleanStr2) return 1.0;
  
  const distance = natural.LevenshteinDistance(cleanStr1, cleanStr2);
  const maxLength = Math.max(cleanStr1.length, cleanStr2.length);
  
  return Math.max(0, (maxLength - distance) / maxLength);
};

// Enhanced semantic similarity with medical term processing
const calculateSemanticSimilarity = (term1, term2, synonyms1 = [], synonyms2 = []) => {
  if (!term1 || !term2) return 0;
  
  // Medical abbreviation and pattern matching
  const medicalTerms = {
    'diabetes': ['prameha', 'madhumeha', 'diabetic', 'hyperglycemia'],
    'fever': ['jwara', 'pyrexia', 'febrile', 'hyperthermia'],
    'pain': ['vedana', 'ruja', 'shula', 'ache', 'aching'],
    'asthma': ['shwasa', 'tamaka', 'breathing', 'dyspnea'],
    'gastric': ['amlapitta', 'acid', 'stomach', 'gastritis'],
    'paralysis': ['pakshaghata', 'ardita', 'hemiplegia', 'weakness'],
    'skin': ['kushtha', 'dermal', 'cutaneous', 'rash'],
    'joint': ['sandhigata', 'arthritis', 'articular', 'knee'],
    'heart': ['hridaya', 'cardiac', 'cardiovascular', 'chest']
  };
  
  // Preprocess terms for better matching
  const preprocessTerm = (term) => {
    const cleaned = term.toLowerCase().trim()
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/\s+/g, ' '); // Normalize spaces
    
    // Check for medical synonyms
    for (const [key, synonyms] of Object.entries(medicalTerms)) {
      if (cleaned.includes(key) || synonyms.some(syn => cleaned.includes(syn))) {
        return [cleaned, key, ...synonyms];
      }
    }
    return [cleaned];
  };
  
  const terms1 = [...preprocessTerm(term1), ...synonyms1.map(s => s.toLowerCase().trim())];
  const terms2 = [...preprocessTerm(term2), ...synonyms2.map(s => s.toLowerCase().trim())];
  
  let maxSimilarity = 0;
  
  // Cross-match all term combinations
  for (const t1 of terms1) {
    for (const t2 of terms2) {
      const similarity = calculateStringSimilarity(t1, t2);
      maxSimilarity = Math.max(maxSimilarity, similarity);
      
      // Boost score for partial word matches in medical context
      if (similarity > 0.4) {
        const words1 = t1.split(' ');
        const words2 = t2.split(' ');
        for (const w1 of words1) {
          for (const w2 of words2) {
            if (w1.length > 3 && w2.length > 3) {
              const wordSim = calculateStringSimilarity(w1, w2);
              if (wordSim > 0.7) {
                maxSimilarity = Math.max(maxSimilarity, similarity + 0.2); // 20% bonus for strong word match
              }
            }
          }
        }
      }
    }
  }
  
  // Apply confidence boost for reasonable matches
  if (maxSimilarity > 0.3) {
    maxSimilarity = Math.min(1.0, maxSimilarity * 1.3); // 30% boost for decent matches
  }
  
  return maxSimilarity;
};

// Enhanced traditional system alignment bonus
const getTraditionalSystemBonus = (namasteSystem, tm2System) => {
  if (!namasteSystem || !tm2System) return 0.1; // Small bonus even without system match
  
  const systemMap = {
    'Ayurveda': ['Ayurveda', 'Ayurvedic', 'Sanskrit', 'Vedic'],
    'Unani': ['Unani', 'Yunani', 'Greek', 'Arabic'],
    'Siddha': ['Siddha', 'Tamil'],
    'TCM': ['TCM', 'Chinese', 'Traditional Chinese'],
    'Homeopathy': ['Homeopathy', 'Homeopathic'],
    'Mixed': ['Mixed', 'Combined', 'Integrated']
  };
  
  for (const [system, variants] of Object.entries(systemMap)) {
    if (variants.some(v => namasteSystem.toLowerCase().includes(v.toLowerCase())) &&
        variants.some(v => tm2System.toLowerCase().includes(v.toLowerCase()))) {
      return 0.3; // 30% bonus for matching traditional system (increased)
    }
  }
  
  // Partial system match bonus
  const namasteWords = namasteSystem.toLowerCase().split(/[\s,]+/);
  const tm2Words = tm2System.toLowerCase().split(/[\s,]+/);
  
  for (const nWord of namasteWords) {
    for (const tWord of tm2Words) {
      if (nWord === tWord && nWord.length > 3) {
        return 0.15; // 15% bonus for partial system match
      }
    }
  }
  
  return 0.05; // Small baseline bonus
};

// Enhanced therapeutic area alignment with broader matching
const getTherapeuticAreaBonus = (namasteTerms, tm2TherapeuticArea) => {
  if (!tm2TherapeuticArea) return 0.05; // Small baseline bonus
  
  const therapeuticKeywords = {
    'General': ['general', 'common', 'basic', 'routine', 'standard'],
    'Metabolic': ['diabetes', 'metabolism', 'prameha', 'madhumeha', 'sugar', 'energy'],
    'Endocrine': ['hormone', 'gland', 'thyroid', 'diabetes', 'metabolic'],
    'Respiratory': ['cough', 'asthma', 'breathing', 'kasa', 'shwasa', 'lung', 'chest'],
    'Digestive': ['digestion', 'stomach', 'gastric', 'agni', 'ajirna', 'intestine', 'bowel'],
    'Neurological': ['mind', 'brain', 'nervous', 'manas', 'unmada', 'mental', 'nerve'],
    'Cardiovascular': ['heart', 'blood', 'circulation', 'hridaya', 'rakta', 'cardiac', 'vascular'],
    'Musculoskeletal': ['joint', 'bone', 'muscle', 'asthi', 'mamsa', 'arthritis', 'skeletal'],
    'Dermatological': ['skin', 'kushtha', 'dermal', 'rash', 'eczema', 'dermatitis'],
    'Reproductive': ['reproductive', 'fertility', 'pregnancy', 'menstrual', 'sexual'],
    'Urinary': ['kidney', 'urine', 'bladder', 'urinary', 'nephro'],
    'Infectious': ['infection', 'viral', 'bacterial', 'fever', 'jwara']
  };
  
  const lowerTerms = namasteTerms.join(' ').toLowerCase();
  const lowerArea = tm2TherapeuticArea.toLowerCase();
  
  // Direct area name match
  if (lowerTerms.includes(lowerArea) || lowerArea.includes('general')) {
    return 0.25; // Strong bonus for direct area match
  }
  
  // Keyword-based matching
  for (const [area, keywords] of Object.entries(therapeuticKeywords)) {
    if (lowerArea.includes(area.toLowerCase())) {
      for (const keyword of keywords) {
        if (lowerTerms.includes(keyword)) {
          return 0.2; // Good bonus for keyword match
        }
      }
    }
  }
  
  // Partial word matching
  const areaWords = lowerArea.split(/[\s,]+/);
  const namasteWords = lowerTerms.split(/[\s,]+/);
  
  for (const aWord of areaWords) {
    for (const nWord of namasteWords) {
      if (aWord.length > 4 && nWord.length > 4 && 
          (aWord.includes(nWord) || nWord.includes(aWord))) {
        return 0.15; // Moderate bonus for partial match
      }
    }
  }
  
  return 0.05; // Small baseline bonus
};

// Enhanced NAMASTE → TM2 confidence calculation
const calculateNamasteTM2Confidence = (namasteData, tm2Data) => {
  const namasteTerms = [
    namasteData.display,
    namasteData.englishName,
    namasteData.name,
    ...(namasteData.synonyms ? namasteData.synonyms.split(';').map(s => s.trim()) : [])
  ].filter(Boolean);
  
  const tm2Terms = [
    tm2Data.tm2Title,
    tm2Data.description,
    ...(tm2Data.synonyms || []),
    ...(tm2Data.keywords || [])
  ].filter(Boolean);
  
  // Enhanced semantic similarity with multiple scoring methods
  let maxSimilarity = 0;
  let totalSimilarityScore = 0;
  let comparisons = 0;
  
  for (const namTerm of namasteTerms) {
    for (const tm2Term of tm2Terms) {
      const similarity = calculateSemanticSimilarity(namTerm, tm2Term);
      maxSimilarity = Math.max(maxSimilarity, similarity);
      totalSimilarityScore += similarity;
      comparisons++;
    }
  }
  
  // Average similarity for consistency check
  const avgSimilarity = comparisons > 0 ? totalSimilarityScore / comparisons : 0;
  
  // Base confidence combines max and average
  let baseConfidence = (maxSimilarity * 0.7) + (avgSimilarity * 0.3);
  
  // Progressive similarity bonuses
  if (maxSimilarity > 0.4) {
    baseConfidence += 0.1; // Bonus for decent similarity
  }
  if (maxSimilarity > 0.6) {
    baseConfidence += 0.1; // Additional bonus for good similarity
  }
  
  // Add bonuses
  const systemBonus = getTraditionalSystemBonus(namasteData.system, tm2Data.traditionalSystem);
  const therapeuticBonus = getTherapeuticAreaBonus(namasteTerms, tm2Data.therapeuticArea);
  
  // Length similarity bonus (similar complexity of terms)
  const avgNamasteLength = namasteTerms.join(' ').length / namasteTerms.length;
  const avgTm2Length = tm2Terms.join(' ').length / tm2Terms.length;
  const lengthSimilarity = 1 - Math.abs(avgNamasteLength - avgTm2Length) / Math.max(avgNamasteLength, avgTm2Length);
  const lengthBonus = lengthSimilarity > 0.7 ? 0.05 : 0;
  
  // Calculate final confidence with generous scaling
  let finalConfidence = baseConfidence + systemBonus + therapeuticBonus + lengthBonus;
  
  // Progressive scaling for higher confidence ranges
  if (finalConfidence > 0.4) {
    finalConfidence = 0.4 + (finalConfidence - 0.4) * 1.4; // 40% amplification above 0.4
  }
  
  return Math.min(1.0, finalConfidence);
};

// Enhanced TM2 → ICD-11 confidence calculation
const calculateTM2ICDConfidence = (tm2Data, icdData) => {
  const tm2Terms = [
    tm2Data.tm2Title,
    tm2Data.description,
    ...(tm2Data.synonyms || []),
    ...(tm2Data.keywords || [])
  ].filter(Boolean);
  
  const icdTerms = [
    icdData.title,
    icdData.name,
    icdData.display,
    ...(icdData.synonyms || []),
    icdData.description
  ].filter(Boolean);
  
  // Enhanced semantic similarity with multiple scoring
  let maxSimilarity = 0;
  let secondBestSimilarity = 0;
  let totalScore = 0;
  let comparisons = 0;
  
  for (const tm2Term of tm2Terms) {
    for (const icdTerm of icdTerms) {
      const similarity = calculateSemanticSimilarity(tm2Term, icdTerm);
      
      if (similarity > maxSimilarity) {
        secondBestSimilarity = maxSimilarity;
        maxSimilarity = similarity;
      } else if (similarity > secondBestSimilarity) {
        secondBestSimilarity = similarity;
      }
      
      totalScore += similarity;
      comparisons++;
    }
  }
  
  // Base confidence considers multiple similarity measures
  const avgSimilarity = comparisons > 0 ? totalScore / comparisons : 0;
  let baseConfidence = (maxSimilarity * 0.6) + (secondBestSimilarity * 0.2) + (avgSimilarity * 0.2);
  
  // Medical terminology boost
  const medicalBonus = getMedicalTerminologyBonus(tm2Terms, icdTerms);
  
  // Therapeutic consistency bonus
  const therapeuticConsistency = getTherapeuticConsistencyBonus(tm2Data, icdTerms);
  
  // Progressive bonuses for TM2→ICD mapping
  if (maxSimilarity > 0.3) {
    baseConfidence += 0.1; // Basic similarity bonus
  }
  if (maxSimilarity > 0.5) {
    baseConfidence += 0.1; // Good similarity bonus
  }
  
  let finalConfidence = baseConfidence + medicalBonus + therapeuticConsistency;
  
  // Enhanced scaling for ICD mappings (more generous)
  if (finalConfidence > 0.3) {
    finalConfidence = 0.3 + (finalConfidence - 0.3) * 1.5; // 50% amplification above 0.3
  }
  
  return Math.min(1.0, finalConfidence);
};

// Enhanced medical terminology alignment bonus
const getMedicalTerminologyBonus = (tm2Terms, icdTerms) => {
  const medicalMappings = {
    'diabetes': ['diabetes', 'mellitus', 'hyperglycemia', 'diabetic', 'prameha'],
    'hypertension': ['hypertension', 'blood pressure', 'hypertensive', 'high blood'],
    'asthma': ['asthma', 'bronchial', 'respiratory', 'breathing', 'shwasa'],
    'arthritis': ['arthritis', 'joint', 'inflammatory', 'arthritic', 'sandhigata'],
    'depression': ['depression', 'depressive', 'mood', 'mental', 'unmada'],
    'fever': ['fever', 'pyrexia', 'febrile', 'hyperthermia', 'jwara'],
    'pain': ['pain', 'ache', 'painful', 'analges', 'vedana'],
    'infection': ['infection', 'infectious', 'bacterial', 'viral', 'sepsis'],
    'inflammation': ['inflammation', 'inflammatory', 'inflamed', 'swelling'],
    'gastric': ['gastric', 'stomach', 'gastritis', 'dyspepsia', 'amlapitta']
  };
  
  const lowerTM2 = tm2Terms.join(' ').toLowerCase();
  const lowerICD = icdTerms.join(' ').toLowerCase();
  
  let maxBonus = 0;
  
  for (const [concept, variations] of Object.entries(medicalMappings)) {
    const tm2HasConcept = variations.some(variation => lowerTM2.includes(variation));
    const icdHasConcept = variations.some(variation => lowerICD.includes(variation));
    
    if (tm2HasConcept && icdHasConcept) {
      maxBonus = Math.max(maxBonus, 0.25); // 25% bonus for strong medical concept alignment
    }
  }
  
  // Partial medical term matching
  if (maxBonus === 0) {
    for (const [concept, variations] of Object.entries(medicalMappings)) {
      for (const variation of variations) {
        if (variation.length > 4 && (lowerTM2.includes(variation.substring(0, 4)) || 
            lowerICD.includes(variation.substring(0, 4)))) {
          maxBonus = Math.max(maxBonus, 0.1); // 10% bonus for partial match
        }
      }
    }
  }
  
  return maxBonus;
};

// Therapeutic consistency bonus for TM2→ICD mapping
const getTherapeuticConsistencyBonus = (tm2Data, icdTerms) => {
  if (!tm2Data.therapeuticArea) return 0.05;
  
  const therapeuticMapping = {
    'General': ['general', 'unspecified', 'other', 'nos'],
    'Digestive': ['gastro', 'intestinal', 'digestive', 'stomach', 'bowel'],
    'Respiratory': ['respiratory', 'lung', 'bronch', 'pulmonary', 'breathing'],
    'Cardiovascular': ['cardio', 'heart', 'vascular', 'blood', 'circulation'],
    'Neurological': ['neuro', 'brain', 'nerve', 'mental', 'psychiatric'],
    'Musculoskeletal': ['musculo', 'bone', 'joint', 'muscle', 'skeletal'],
    'Dermatological': ['skin', 'dermat', 'cutaneous', 'epidermal'],
    'Endocrine': ['endocrine', 'hormone', 'metabolic', 'gland', 'diabetes']
  };
  
  const area = tm2Data.therapeuticArea;
  const icdText = icdTerms.join(' ').toLowerCase();
  
  if (therapeuticMapping[area]) {
    for (const keyword of therapeuticMapping[area]) {
      if (icdText.includes(keyword)) {
        return 0.15; // 15% bonus for therapeutic consistency
      }
    }
  }
  
  return 0.05; // Small baseline bonus
};

// Enhanced overall three-layer confidence calculation
const calculateOverallConfidence = (namasteTM2Confidence, tm2ICDConfidence) => {
  // Progressive confidence boosting for good matches
  const avgConfidence = (namasteTM2Confidence + tm2ICDConfidence) / 2;
  const weakestLink = Math.min(namasteTM2Confidence, tm2ICDConfidence);
  const strongestLink = Math.max(namasteTM2Confidence, tm2ICDConfidence);
  
  // Base calculation with less penalty for weaker link
  let overallConfidence = (avgConfidence * 0.8) + (weakestLink * 0.2);
  
  // Progressive bonuses for high-quality mappings
  if (avgConfidence > 0.6) {
    overallConfidence += 0.1; // 10% bonus for good average
  }
  
  if (strongestLink > 0.8) {
    overallConfidence += 0.05; // 5% bonus for strong individual layer
  }
  
  if (weakestLink > 0.5) {
    overallConfidence += 0.05; // 5% bonus for decent minimum quality
  }
  
  // Boost confidence for mappings that show consistent quality
  const consistencyBonus = 1 - Math.abs(namasteTM2Confidence - tm2ICDConfidence);
  if (consistencyBonus > 0.8) {
    overallConfidence += 0.05; // 5% bonus for consistent confidence across layers
  }
  
  // Final scaling for high confidence ranges
  if (overallConfidence > 0.5) {
    overallConfidence = 0.5 + (overallConfidence - 0.5) * 1.2; // 20% amplification above 0.5
  }
  
  return Math.min(1.0, overallConfidence);
};

module.exports = {
  calculateStringSimilarity,
  calculateSemanticSimilarity,
  calculateNamasteTM2Confidence,
  calculateTM2ICDConfidence,
  calculateOverallConfidence,
  getTraditionalSystemBonus,
  getTherapeuticAreaBonus,
  getMedicalTerminologyBonus
};