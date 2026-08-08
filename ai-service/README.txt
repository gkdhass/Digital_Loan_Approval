AI RISK PREDICTION SERVICE
==========================

SETUP:
1. Install Python 3.8+ if not already installed
2. Create virtual environment:
   python -m venv venv
3. Activate virtual environment:
   Windows: venv\Scripts\activate
   Mac/Linux: source venv/bin/activate
4. Install dependencies:
   pip install -r requirements.txt

RUN LOCALLY:
python app.py

Service runs on: http://localhost:5001

ENDPOINTS:
- GET  /health        - Health check
- POST /predict-risk  - Predict loan risk

EXAMPLE REQUEST:
POST http://localhost:5001/predict-risk
Content-Type: application/json

{
  "monthlyIncome": 50000,
  "employmentType": "salaried",
  "existingEMI": 10000,
  "requestedAmount": 500000,
  "loanDuration": 24,
  "age": 35
}
