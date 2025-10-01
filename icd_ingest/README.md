# Data Ingestion Documentation

## Overview

This module handles the ingestion, processing, and mapping of NAMASTE and ICD-11 codes. It includes Python scripts for data processing and semantic mapping generation.

## Components

### Files

- `icd11_full.csv` - Complete ICD-11 code database
- `mock_namaste_codes_150.csv` - NAMASTE code sample data
- `namaste_icd11_semantic_mapping.csv` - Generated mappings
- `Mapping.py` - Mapping generation script
- `mergedicd11.py` - ICD-11 data processing

## Data Processing Pipeline

1. **Data Collection**
   - ICD-11 data from WHO API
   - NAMASTE codes from AYUSH database
   - Manual mappings from domain experts

2. **Data Cleaning**
   - Remove duplicates
   - Standardize formats
   - Handle missing values

3. **Mapping Generation**
   - Semantic analysis
   - Expert validation
   - Quality checks

## Usage

1. **Setup Python Environment**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # Unix
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   \`\`\`

2. **Run Mapping Generator**
   \`\`\`bash
   python Mapping.py
   \`\`\`

3. **Process ICD-11 Data**
   \`\`\`bash
   python mergedicd11.py
   \`\`\`

## Data Formats

### ICD-11 Format
\`\`\`json
{
  "code": "string",
  "title": "string",
  "definition": "string",
  "parent": "string",
  "children": ["string"]
}
\`\`\`

### NAMASTE Format
\`\`\`json
{
  "code": "string",
  "sanskrit_term": "string",
  "english_term": "string",
  "category": "string"
}
\`\`\`

### Mapping Format
\`\`\`json
{
  "namaste_code": "string",
  "icd_code": "string",
  "confidence": "float",
  "validated": "boolean"
}
\`\`\`

## Dependencies

- pandas
- numpy
- scikit-learn
- nltk
- tensorflow

## Data Quality Checks

- Uniqueness validation
- Code format validation
- Relationship consistency
- Mapping validation

## Error Handling

1. **Data Validation Errors**
   - Invalid code format
   - Missing required fields
   - Duplicate entries

2. **Processing Errors**
   - Memory issues
   - Processing timeout
   - File access errors

## Performance Considerations

- Batch processing for large datasets
- Efficient memory management
- Parallel processing where applicable

## Maintenance

1. **Regular Updates**
   - ICD-11 updates from WHO
   - New NAMASTE codes
   - Mapping refinements

2. **Backup Procedures**
   - Daily incremental backups
   - Weekly full backups
   - Version control

## Security

- Data encryption
- Access control
- Audit logging

## Best Practices

1. Always validate input data
2. Maintain data provenance
3. Document changes
4. Regular quality checks
5. Backup before processing