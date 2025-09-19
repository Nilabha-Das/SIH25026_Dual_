interface ApprovedRecord {
  id: string;
  patientName: string;
  patientAbhaId: string;
  doctorName: string;
  doctorEmail: string;
  curatorName?: string;
  namasteCode: string;
  namasteTerm: string;
  icdCode: string;
  icdTerm: string;
  prescription: string;
  date: string;
  submittedAt: string;
  approvedAt?: string;
  curatorNotes?: string;
  status: string;
}

interface User {
  id: string;
  _id?: string;
  role: 'patient' | 'doctor' | 'curator';
  abhaId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export const generateTextSummary = (patient: User, records: ApprovedRecord[]) => {
  let summary = '';
  
  // Header
  summary += '='.repeat(60) + '\n';
  summary += 'AYUSH EMR - MEDICAL RECORDS SUMMARY\n';
  summary += '='.repeat(60) + '\n\n';
  
  // Patient Information
  summary += 'PATIENT INFORMATION:\n';
  summary += '-'.repeat(30) + '\n';
  summary += `Name: ${patient.name}\n`;
  summary += `ABHA ID: ${patient.abhaId}\n`;
  summary += `Email: ${patient.email}\n`;
  if (patient.phone) {
    summary += `Phone: ${patient.phone}\n`;
  }
  summary += `Generated on: ${new Date().toLocaleString()}\n`;
  summary += `Total Records: ${records.length}\n\n`;
  
  if (records.length === 0) {
    summary += 'No approved medical records found.\n';
  } else {
    summary += 'APPROVED MEDICAL RECORDS:\n';
    summary += '='.repeat(40) + '\n\n';
    
    records.forEach((record, index) => {
      summary += `RECORD ${index + 1}: ${record.namasteTerm}\n`;
      summary += '-'.repeat(50) + '\n';
      summary += `Date of Record: ${new Date(record.date).toLocaleDateString()}\n`;
      summary += `NAMASTE Code: ${record.namasteCode}\n`;
      summary += `NAMASTE Term: ${record.namasteTerm}\n`;
      summary += `ICD-11 Code: ${record.icdCode}\n`;
      summary += `ICD-11 Term: ${record.icdTerm}\n`;
      summary += `Treating Doctor: ${record.doctorName}\n`;
      summary += `Doctor Email: ${record.doctorEmail}\n`;
      
      if (record.curatorName) {
        summary += `Approved by Curator: ${record.curatorName}\n`;
      }
      
      if (record.approvedAt) {
        summary += `Approval Date: ${new Date(record.approvedAt).toLocaleDateString()}\n`;
      }
      
      if (record.prescription) {
        summary += '\nPRESCRIPTION & TREATMENT:\n';
        summary += record.prescription + '\n';
      }
      
      if (record.curatorNotes) {
        summary += '\nCURATOR REVIEW NOTES:\n';
        summary += record.curatorNotes + '\n';
      }
      
      summary += '\n' + '='.repeat(50) + '\n\n';
    });
  }
  
  summary += '\n' + '='.repeat(60) + '\n';
  summary += 'AYUSH EMR System - Confidential Medical Document\n';
  summary += 'Generated on: ' + new Date().toLocaleString() + '\n';
  summary += '='.repeat(60) + '\n';
  
  return summary;
};

export const downloadTextFile = (patient: User, records: ApprovedRecord[]) => {
  try {
    const summary = generateTextSummary(patient, records);
    const filename = `${patient.name.replace(/\s+/g, '_')}_Medical_Records_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return filename;
  } catch (error) {
    console.error('Text file generation error:', error);
    throw error;
  }
};