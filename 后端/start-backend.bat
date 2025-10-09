@echo off
echo Starting Diet Hub Backend...
echo.

cd /d "%~dp0"

if not exist "target\hub-1.0.0.jar" (
    echo Building the project...
    call mvn clean package -DskipTests
    if errorlevel 1 (
        echo Build failed!
        pause
        exit /b 1
    )
)

echo Starting the application...
java -jar target\hub-1.0.0.jar

pause
