import React, { useState } from "react";
import CodeSnippet from "./CodeSnippet";

interface FhirBundleEditorProps {
  initialBundle?: string;
  onSave?: (json: string) => void;
}

export default function FhirBundleEditor({ initialBundle, onSave }: FhirBundleEditorProps) {
  const defaultBundle = initialBundle || `{
    "resourceType": "Bundle",
    "type": "collection",
    "timestamp": "2025-09-19T06:55:21.696Z",
    "entry": [
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416436",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM001"
                    },
                    {
                        "url": "display",
                        "valueString": "Diabetes (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416437",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM002"
                    },
                    {
                        "url": "display",
                        "valueString": "Asthma (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416438",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM003"
                    },
                    {
                        "url": "display",
                        "valueString": "Hypertension (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416439",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM004"
                    },
                    {
                        "url": "display",
                        "valueString": "Anemia (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643a",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM005"
                    },
                    {
                        "url": "display",
                        "valueString": "Headache (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643b",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM006"
                    },
                    {
                        "url": "display",
                        "valueString": "Migraine (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643c",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM007"
                    },
                    {
                        "url": "display",
                        "valueString": "Cough (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643d",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM008"
                    },
                    {
                        "url": "display",
                        "valueString": "Cold (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643e",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM009"
                    },
                    {
                        "url": "display",
                        "valueString": "Arthritis (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc41643f",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM010"
                    },
                    {
                        "url": "display",
                        "valueString": "Back Pain (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416440",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM011"
                    },
                    {
                        "url": "display",
                        "valueString": "Obesity (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416441",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM012"
                    },
                    {
                        "url": "display",
                        "valueString": "Jaundice (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416442",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM013"
                    },
                    {
                        "url": "display",
                        "valueString": "Epilepsy (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416443",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM014"
                    },
                    {
                        "url": "display",
                        "valueString": "Skin Rash (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416444",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM015"
                    },
                    {
                        "url": "display",
                        "valueString": "Eczema (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416445",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM016"
                    },
                    {
                        "url": "display",
                        "valueString": "Psoriasis (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416446",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM017"
                    },
                    {
                        "url": "display",
                        "valueString": "Constipation (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416447",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM018"
                    },
                    {
                        "url": "display",
                        "valueString": "Diarrhea (Ayurveda)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416448",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM019"
                    },
                    {
                        "url": "display",
                        "valueString": "Gastritis (Siddha)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857e1bb1df1f0dc416449",
                "code": {
                    "text": "Namaste Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "NAM020"
                    },
                    {
                        "url": "display",
                        "valueString": "Bronchitis (Unani)"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a75",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A00"
                    },
                    {
                        "url": "title",
                        "valueString": "Cholera"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a76",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A11"
                    },
                    {
                        "url": "title",
                        "valueString": "Botulism"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a77",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A31"
                    },
                    {
                        "url": "title",
                        "valueString": "Giardiasis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a78",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A32"
                    },
                    {
                        "url": "title",
                        "valueString": "Cryptosporidiosis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a79",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A33"
                    },
                    {
                        "url": "title",
                        "valueString": "Cystoisosporiasis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7a",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A34"
                    },
                    {
                        "url": "title",
                        "valueString": "Sarcocystosis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7b",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A35"
                    },
                    {
                        "url": "title",
                        "valueString": "Blastocystosis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7c",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A36"
                    },
                    {
                        "url": "title",
                        "valueString": "Amoebiasis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7d",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A62.0"
                    },
                    {
                        "url": "title",
                        "valueString": "Neurosyphilis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7e",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A81"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-ulcerative sexually transmitted chlamydial infection"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a7f",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A81.Y"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-ulcerative sexually transmitted chlamydial infection of other specified site"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a80",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A81.Z"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-ulcerative sexually transmitted chlamydial infection of unspecified site"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a81",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A90"
                    },
                    {
                        "url": "title",
                        "valueString": "Chancroid"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a82",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1A92"
                    },
                    {
                        "url": "title",
                        "valueString": "Trichomoniasis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a83",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B20"
                    },
                    {
                        "url": "title",
                        "valueString": "Leprosy"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a84",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B21.1"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-tuberculous mycobacterial lymphadenitis"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a85",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B21.Y"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-tuberculous mycobacterial infection of other specified site"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a86",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B21.Z"
                    },
                    {
                        "url": "title",
                        "valueString": "Non-tuberculous mycobacterial infection of unspecified site"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a87",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B70.0"
                    },
                    {
                        "url": "title",
                        "valueString": "Erysipelas"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c856babb1df1f0dc414a88",
                "code": {
                    "text": "ICD11 Code"
                },
                "extension": [
                    {
                        "url": "code",
                        "valueString": "1B72"
                    },
                    {
                        "url": "title",
                        "valueString": "Impetigo"
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164cd",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.579
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164ce",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.77
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164cf",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.495
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d0",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.481
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d1",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.634
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d2",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.712
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d3",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.549
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d4",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.495
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d5",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.482
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d6",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.47
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d7",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.627
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d8",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.445
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164d9",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.55
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164da",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.664
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164db",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.522
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164dc",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.775
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164dd",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.684
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164de",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.637
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164df",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.695
                    }
                ]
            }
        },
        {
            "resource": {
                "resourceType": "Basic",
                "id": "68c857ffbb1df1f0dc4164e0",
                "code": {
                    "text": "Mapping"
                },
                "extension": [
                    {
                        "url": "namaste_code"
                    },
                    {
                        "url": "icd_code"
                    },
                    {
                        "url": "confidence",
                        "valueDecimal": 0.691
                    }
                ]
            }
        }
    ]
}`;

  const [bundleText, setBundleText] = useState<string>(defaultBundle);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bundleText);
    alert("FHIR Bundle copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([bundleText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fhir-bundle.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    try {
      JSON.parse(bundleText); // validate
      onSave?.(bundleText);
      alert("Bundle saved (validated JSON).");
      setIsEditing(false);
    } catch (err) {
      alert("Invalid JSON. Please fix errors before saving.");
    }
  };

  return (
    <section className="rounded-2xl bg-gray-900/70 border border-gray-800 p-6 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">FHIR Bundle Editor</h3>
          <p className="text-sm text-gray-400 mt-1">
            Edit the FHIR Bundle JSON here. Copy, download, or validate and save your bundle for upload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing((s) => !s)}
            className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-200 hover:bg-gray-700 transition"
          >
            {isEditing ? "Preview" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md bg-cyan-600 text-white text-sm hover:bg-cyan-500 transition"
          >
            Copy Bundle
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="max-h-96 overflow-y-auto border border-gray-800 rounded-md scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <textarea
              value={bundleText}
              onChange={(e) => setBundleText(e.target.value)}
              rows={16}
              className="w-full h-full p-3 bg-gray-950 text-green-200 font-mono text-sm rounded-md border-none focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              style={{ minHeight: '400px' }}
            />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-800 rounded-md bg-gray-950 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="h-full">
              <CodeSnippet code={bundleText} language="json" showLineNumbers />
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition"
          >
            Validate & Save
          </button>
          <button
            onClick={() => { setBundleText(defaultBundle); alert("Reset to default bundle."); }}
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}
