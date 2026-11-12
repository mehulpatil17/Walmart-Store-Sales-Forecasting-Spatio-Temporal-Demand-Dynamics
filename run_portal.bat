@echo off
echo ======================================================================
echo Launching Walmart ML Research Portal with Model (ES 335 - IITGN)
echo ======================================================================
start "XGBoost Model Server" /B "C:\Users\MEHUL\AppData\Local\Python\bin\python.exe" model_server.py
cd portal
set PATH=C:\Program Files\nodejs;%PATH%
npm run start -- -p 3000
pause
