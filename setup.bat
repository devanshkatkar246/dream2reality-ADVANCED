@echo off
echo Installing dependencies...
npm install
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please add your OPENAI_API_KEY to the .env file.
) else (
    echo .env file already exists.
)
echo.
echo To start the project, run:
echo npm run dev
echo.
pause
