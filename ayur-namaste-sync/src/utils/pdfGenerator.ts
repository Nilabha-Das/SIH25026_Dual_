import jsPDF from 'jspdf';

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

export const generateMedicalRecordsPDF = (patient: User, records: ApprovedRecord[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text('AYUSH EMR - Medical Records Summary', pageWidth / 2, 25, { align: 'center' });
    
    // Patient Information Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information', 20, 45);
    
    // Patient details box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 50, pageWidth - 40, 35);
    
    doc.setFontSize(12);
    doc.text(`Name: ${patient.name}`, 25, 60);
    doc.text(`ABHA ID: ${patient.abhaId}`, 25, 70);
    doc.text(`Email: ${patient.email}`, 25, 80);
    if (patient.phone) {
      doc.text(`Phone: ${patient.phone}`, 120, 60);
    }
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 120, 70);
    doc.text(`Total Records: ${records.length}`, 120, 80);
    
    let yPosition = 100;
    
    if (records.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('No approved medical records found.', pageWidth / 2, yPosition + 20, { align: 'center' });
    } else {
      // Medical Records Section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Approved Medical Records', 20, yPosition);
      yPosition += 15;
      
      records.forEach((record, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Record header
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text(`Record ${index + 1}: ${record.namasteTerm}`, 25, yPosition + 10);
        yPosition += 20;
        
        // Record details using simple text layout
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const details = [
          `Date of Record: ${new Date(record.date).toLocaleDateString()}`,
          `NAMASTE Code: ${record.namasteCode}`,
          `NAMASTE Term: ${record.namasteTerm}`,
          `ICD-11 Code: ${record.icdCode}`,
          `ICD-11 Term: ${record.icdTerm}`,
          `Treating Doctor: ${record.doctorName}`,
          `Doctor Email: ${record.doctorEmail}`,
        ];
        
        if (record.curatorName) {
          details.push(`Approved by Curator: ${record.curatorName}`);
        }
        
        if (record.approvedAt) {
          details.push(`Approval Date: ${new Date(record.approvedAt).toLocaleDateString()}`);
        }
        
        // Draw simple table-like structure
        doc.setDrawColor(200, 200, 200);
        const startY = yPosition;
        const rowHeight = 8;
        const tableWidth = pageWidth - 40;
        
        details.forEach((detail, detailIndex) => {
          const currentY = startY + (detailIndex * rowHeight);
          
          // Alternate row colors
          if (detailIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, currentY - 2, tableWidth, rowHeight, 'F');
          }
          
          doc.text(detail, 25, currentY + 4);
        });
        
        yPosition += details.length * rowHeight + 10;
        
        // Prescription section
        if (record.prescription) {
          // Check if prescription fits on current page
          const prescriptionLines = doc.splitTextToSize(record.prescription, pageWidth - 60);
          const prescriptionHeight = prescriptionLines.length * 5 + 20;
          
          if (yPosition + prescriptionHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(40, 116, 166);
          doc.text('Prescription & Treatment:', 25, yPosition);
          yPosition += 8;
          
          // Prescription box
          doc.setDrawColor(40, 116, 166);
          doc.setFillColor(245, 248, 255);
          doc.rect(25, yPosition - 3, pageWidth - 50, prescriptionHeight - 10, 'FD');
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(prescriptionLines, 30, yPosition + 5);
          yPosition += prescriptionHeight;
        }
        
        // Curator notes section
        if (record.curatorNotes) {
          const notesLines = doc.splitTextToSize(record.curatorNotes, pageWidth - 60);
          const notesHeight = notesLines.length * 5 + 20;
          
          if (yPosition + notesHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(34, 139, 34);
          doc.text('Curator Review Notes:', 25, yPosition);
          yPosition += 8;
          
          doc.setDrawColor(34, 139, 34);
          doc.setFillColor(240, 255, 240);
          doc.rect(25, yPosition - 3, pageWidth - 50, notesHeight - 10, 'FD');
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(notesLines, 30, yPosition + 5);
          yPosition += notesHeight;
        }
        
        // Add spacing between records
        yPosition += 15;
      });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('AYUSH EMR System - Confidential Medical Document', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    // Generate filename
    const filename = `${patient.name.replace(/\s+/g, '_')}_Medical_Records_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the PDF
    doc.save(filename);
    
    return filename;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};