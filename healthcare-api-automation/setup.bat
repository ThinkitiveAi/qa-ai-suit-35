@echo off
echo.
echo ====================================
echo Healthcare API Automation Framework
echo ====================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Installing Playwright browsers...
call npm run install:playwright

echo.
echo Setup completed successfully!
echo.
echo To run tests:
echo   npm test                    - Run all tests
echo   npm run test:headed         - Run with browser visible
echo   npm run test:debug          - Debug mode
echo.
echo Framework is ready to use!

pause