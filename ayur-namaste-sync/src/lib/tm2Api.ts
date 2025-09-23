import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface TM2Code {
  tm2Code: string;
  tm2Title: string;
  traditionalSystem: 'Ayurveda' | 'Unani' | 'Siddha';
  therapeuticArea: string;
  patternType?: string;
  synonyms?: string[];
  icdMappings?: Array<{
    icdCode: string;
    icdTitle: string;
    confidence: number;
  }>;
}

export interface ThreeLayerMapping {
  namasteCode: string;
  namasteTitle: string;
  tm2Code: string;
  tm2Title: string;
  tm2Confidence: number;
  icdCode: string;
  icdTitle: string;
  icdConfidence: number;
  overallConfidence: number;
  traditionalSystem: 'Ayurveda' | 'Unani' | 'Siddha';
  curatorApproved?: boolean;
}

export interface TM2SearchResult {
  code: string;
  display: string;
  system: string;
  synonyms?: string;
  tm2Mappings: Array<{
    tm2Code: string;
    tm2Title: string;
    tm2Confidence: number;
    traditionalSystem: string;
    icdCode: string;
    icdTitle: string;
    icdConfidence: number;
    overallConfidence: number;
  }>;
}

// Get all TM2 codes with pagination
export const getTM2Codes = async (page = 1, limit = 10, system?: string): Promise<{
  data: TM2Code[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (system) {
      params.append('system', system);
    }

    const response = await axios.get(`${API_BASE_URL}/api/tm2?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TM2 codes:', error);
    throw error;
  }
};

// Search TM2 codes
export const searchTM2Codes = async (term: string, limit = 10): Promise<TM2Code[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tm2/search`, {
      params: { term, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching TM2 codes:', error);
    throw error;
  }
};

// Get specific TM2 code
export const getTM2Code = async (tm2Code: string): Promise<TM2Code> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tm2/${tm2Code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TM2 code:', error);
    throw error;
  }
};

// Get TM2 statistics
export const getTM2Statistics = async (): Promise<{
  total: number;
  bySystem: {
    Ayurveda: number;
    Unani: number;
    Siddha: number;
  };
  byTherapeuticArea: Record<string, number>;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tm2/stats/overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TM2 statistics:', error);
    throw error;
  }
};

// Get three-layer mappings for a NAMASTE code
export const getThreeLayerMappings = async (namasteCode: string): Promise<ThreeLayerMapping[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/mapping/namaste/${namasteCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching three-layer mappings:', error);
    throw error;
  }
};

// Search with three-layer results
export const searchWithThreeLayer = async (term: string, limit = 10): Promise<TM2SearchResult[]> => {
  try {
    // First get NAMASTE codes matching the search
    const namasteResponse = await axios.get(`${API_BASE_URL}/api/namaste`, {
      params: { term, limit }
    });

    const results: TM2SearchResult[] = [];

    // For each NAMASTE code, get three-layer mappings
    for (const namaste of namasteResponse.data) {
      try {
        const mappingsResponse = await axios.get(`${API_BASE_URL}/api/mapping/namaste/${namaste.code}`);
        
        if (mappingsResponse.data.length > 0) {
          const tm2Mappings = mappingsResponse.data.map((mapping: ThreeLayerMapping) => ({
            tm2Code: mapping.tm2Code,
            tm2Title: mapping.tm2Title,
            tm2Confidence: mapping.tm2Confidence,
            traditionalSystem: mapping.traditionalSystem,
            icdCode: mapping.icdCode,
            icdTitle: mapping.icdTitle,
            icdConfidence: mapping.icdConfidence,
            overallConfidence: mapping.overallConfidence,
          }));

          results.push({
            code: namaste.code,
            display: namaste.display,
            system: namaste.system,
            synonyms: namaste.synonyms,
            tm2Mappings,
          });
        }
      } catch (mappingError) {
        console.warn(`No three-layer mappings found for ${namaste.code}:`, mappingError);
        // Still add the NAMASTE code with empty mappings
        results.push({
          code: namaste.code,
          display: namaste.display,
          system: namaste.system,
          synonyms: namaste.synonyms,
          tm2Mappings: [],
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching with three-layer:', error);
    throw error;
  }
};

// Get hierarchical TM2 structure
export const getTM2Hierarchy = async (parentCode?: string): Promise<TM2Code[]> => {
  try {
    const url = parentCode 
      ? `${API_BASE_URL}/api/tm2/${parentCode}/children`
      : `${API_BASE_URL}/api/tm2/hierarchy`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching TM2 hierarchy:', error);
    throw error;
  }
};