// Mock data for AYUSH EMR system
export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
  role: 'patient' | 'doctor' | 'curator';
  abhaId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  patientAbhaId: string;
  doctorId: string;
  diagnosisName: string;
  mappedIcdCode?: string;
  prescription: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  severity?: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
  onsetDate?: string;
}

export interface NAMASTECode {
  code: string;
  display: string;
  system: string;
  synonyms?: string;
}

export interface ICD11Code {
  code: string;
  title: string;
  parent?: string;
  description?: string;
  module: 'MMS' | 'TM2';
}

export interface NAMASTEICDMapping {
  id: string;
  namasteCode: string;
  icdCode: string;
  confidence: number;
  module: 'MMS' | 'TM2';
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    role: 'patient',
    abhaId: '1234-5678-9999',
    email: 'patient@example.com',
    name: 'Ravi Sharma',
    phone: '+91-9876543210',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    role: 'doctor',
    abhaId: '2345-6789-1111',
    email: 'doctor@example.com',
    name: 'Dr. Priya Mehta',
    phone: '+91-9876543211',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '3',
    role: 'curator',
    abhaId: '3456-7890-2222',
    email: 'curator@example.com',
    name: 'Dr. Arjun Singh',
    phone: '+91-9876543212',
    createdAt: '2024-01-05T09:15:00Z'
  }
];

// Mock NAMASTE Codes
export const mockNAMASTECodes: NAMASTECode[] = [
  {
    code: 'NM001',
    display: 'Amavata',
    system: 'NAMASTE',
    synonyms: 'Rheumatoid arthritis, Joint inflammation'
  },
  {
    code: 'NM002',
    display: 'Sandhivata',
    system: 'NAMASTE',
    synonyms: 'Osteoarthritis, Joint degeneration'
  },
  {
    code: 'NM003',
    display: 'Vatavyadhi',
    system: 'NAMASTE',
    synonyms: 'Neurological disorders, Nervous system disorders'
  },
  {
    code: 'NM004',
    display: 'Madhumeha',
    system: 'NAMASTE',
    synonyms: 'Diabetes mellitus, Sweet urine disease'
  },
  {
    code: 'NM005',
    display: 'Hridayaroga',
    system: 'NAMASTE',
    synonyms: 'Heart disease, Cardiac disorders'
  }
];

// Mock ICD-11 Codes
export const mockICD11Codes: ICD11Code[] = [
  {
    code: 'FA20.0',
    title: 'Rheumatoid arthritis, unspecified',
    description: 'Chronic inflammatory disease of joints',
    module: 'MMS'
  },
  {
    code: 'TM2-FA20',
    title: 'Rheumatoid Arthritis (Ayurveda)',
    description: 'Traditional Medicine classification for Amavata',
    module: 'TM2'
  },
  {
    code: 'FA00.0',
    title: 'Osteoarthritis of knee',
    description: 'Degenerative joint disease',
    module: 'MMS'
  },
  {
    code: 'TM2-FA00',
    title: 'Osteoarthritis (Ayurveda)',
    description: 'Traditional Medicine classification for Sandhivata',
    module: 'TM2'
  },
  {
    code: '5A81',
    title: 'Type 2 diabetes mellitus',
    description: 'Non-insulin dependent diabetes',
    module: 'MMS'
  },
  {
    code: 'TM2-5A81',
    title: 'Diabetes Mellitus (Ayurveda)',
    description: 'Traditional Medicine classification for Madhumeha',
    module: 'TM2'
  }
];

// Mock Mappings
export const mockMappings: NAMASTEICDMapping[] = [
  {
    id: '1',
    namasteCode: 'NM001',
    icdCode: 'FA20.0',
    confidence: 0.85,
    module: 'MMS',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    namasteCode: 'NM001',
    icdCode: 'TM2-FA20',
    confidence: 0.92,
    module: 'TM2',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    namasteCode: 'NM002',
    icdCode: 'FA00.0',
    confidence: 0.78,
    module: 'MMS',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '4',
    namasteCode: 'NM004',
    icdCode: '5A81',
    confidence: 0.88,
    module: 'MMS',
    createdAt: '2024-01-15T10:30:00Z'
  }
];

// Mock Patient Records
export const mockPatientRecords: PatientRecord[] = [
  {
    id: '1',
    patientAbhaId: '1234-5678-9999',
    doctorId: '2',
    diagnosisName: 'Amavata',
    mappedIcdCode: 'FA20.0',
    prescription: 'Dashamoolarishta 20ml twice daily, Yogaraja Guggulu 2 tablets twice daily',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'approved',
    severity: 'Moderate',
    notes: 'Patient reports morning stiffness and joint pain',
    onsetDate: '2024-01-10'
  },
  {
    id: '2',
    patientAbhaId: '1234-5678-9999',
    doctorId: '2',
    diagnosisName: 'Sandhivata',
    mappedIcdCode: 'FA00.0',
    prescription: 'Mahayogaraja Guggulu 2 tablets thrice daily, Castor oil application',
    createdAt: '2024-01-20T14:15:00Z',
    status: 'pending',
    severity: 'Mild',
    notes: 'Knee joint degeneration observed',
    onsetDate: '2024-01-18'
  }
];

// Utility functions
export const getUserByRole = (role: 'patient' | 'doctor' | 'curator'): User | undefined => {
  return mockUsers.find(user => user.role === role);
};

export const getPatientRecords = (patientAbhaId: string): PatientRecord[] => {
  return mockPatientRecords.filter(record => record.patientAbhaId === patientAbhaId);
};

export const getMappingsByNAMASTE = (namasteCode: string): NAMASTEICDMapping[] => {
  return mockMappings.filter(mapping => mapping.namasteCode === namasteCode);
};

export const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
};

export const searchNAMASTECodes = (query: string): NAMASTECode[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockNAMASTECodes.filter(code => 
    code.display.toLowerCase().includes(lowercaseQuery) ||
    code.code.toLowerCase().includes(lowercaseQuery) ||
    (code.synonyms && code.synonyms.toLowerCase().includes(lowercaseQuery))
  );
};