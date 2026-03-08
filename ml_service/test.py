import requests
import json

BASE_URL = "http://localhost:5001/api/predict"

test_cases = [
    {
        "name": "Healthy Young Adult",
        "data": {
            "age": 25,
            "gender": "Female",
            "blood_pressure_systolic": 110,
            "blood_pressure_diastolic": 70,
            "heart_rate": 68,
            "respiratory_rate": 14,
            "temperature": 36.6,
            "oxygen_saturation": 99,
            "blood_sugar": 85,
            "has_hypertension": False,
            "has_diabetes": False,
            "smoking_status": "Never"
        }
    },
    {
        "name": "Middle-aged with risk factors",
        "data": {
            "age": 55,
            "gender": "Male",
            "blood_pressure_systolic": 142,
            "blood_pressure_diastolic": 92,
            "heart_rate": 82,
            "respiratory_rate": 18,
            "temperature": 36.9,
            "oxygen_saturation": 95,
            "blood_sugar": 145,
            "has_hypertension": True,
            "has_diabetes": False,
            "smoking_status": "Former"
        }
    },
    {
        "name": "High Risk Elderly",
        "data": {
            "age": 75,
            "gender": "Male",
            "blood_pressure_systolic": 175,
            "blood_pressure_diastolic": 105,
            "heart_rate": 115,
            "respiratory_rate": 24,
            "temperature": 38.4,
            "oxygen_saturation": 88,
            "blood_sugar": 280,
            "has_hypertension": True,
            "has_diabetes": True,
            "has_heart_disease": True,
            "smoking_status": "Current"
        }
    }
]

for case in test_cases:
    print(f"\n{'='*60}")
    print(f"Testing: {case['name']}")
    print('='*60)
    
    response = requests.post(f"{BASE_URL}/patient-risk", json=case['data'])
    
    if response.ok:
        result = response.json()
        print(f"Risk Level: {result['risk_level'].upper()}")
        print(f"Confidence: {result['confidence_score']}%")
        print(f"\nRecommendations:")
        for rec in result['recommendations']:
            print(f"  • {rec}")
    else:
        print(f"Error: {response.status_code}")