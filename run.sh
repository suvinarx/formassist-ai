#!/bin/bash
#cd frontend
#npm install react-router-dom

echo "Starting FormAssist AI..."

cd "$(dirname "$0")"

echo "Stopping old backend/frontend servers..."
kill -9 $(lsof -ti :8000) 2>/dev/null
kill -9 $(lsof -ti :5173) 2>/dev/null

echo "Starting FastAPI backend..."
cd backend

if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

python -m pip install -r requirements.txt
python -m pip install python-multipart

python -m uvicorn main:app --reload &
BACKEND_PID=$!

cd ../frontend

echo "Starting React frontend..."

if [ ! -d "node_modules" ]; then
  npm install
fi

npm install firebase

npm run dev &
FRONTEND_PID=$!

echo ""
echo "FormAssist AI is running!"
echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press CTRL+C to stop both servers."

trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait