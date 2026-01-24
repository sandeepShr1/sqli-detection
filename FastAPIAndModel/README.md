Please follow the following steps to run this server.

1. Run requirements.txt "pip install --no-cache-dir -r requirements.txt".
2. Change "http://127.0.0.1:5000/detect" to "http://FastAndModel:5000/detect" in sqlDetectionMiddleware function of BE.
3. Run "uvicorn main:app --reload --port 5000" in terminal
