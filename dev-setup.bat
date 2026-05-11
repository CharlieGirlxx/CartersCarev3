@echo off
REM ============================================================================
REM CartersCarev3 Development Setup Script (Windows)
REM
REM This script automates common development tasks for Windows environments.
REM
REM Usage:
REM   dev-setup.bat [command]
REM
REM Commands:
REM   setup       - Full setup (prerequisites, dependencies, env vars)
REM   dev         - Start development servers
REM   dev:web     - Start only CartersCare (Vite) dev server
REM   dev:api     - Start only API server
REM   build       - Build all packages
REM   typecheck   - Run TypeScript type checking
REM   clean       - Remove dependencies and build artifacts
REM   help        - Display help message
REM ============================================================================

setlocal enabledelayedexpansion

REM Color codes for output (Windows 10+)
set "INFO=[32m"
set "WARNING=[33m"
set "ERROR=[31m"
set "RESET=[0m"

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"

REM ============================================================================
REM Helper Functions
REM ============================================================================

:print_info
    echo %INFO%[INFO] %~1%RESET%
    exit /b 0

:print_success
    echo %INFO%[SUCCESS] %~1%RESET%
    exit /b 0

:print_warning
    echo %WARNING%[WARNING] %~1%RESET%
    exit /b 0

:print_error
    echo %ERROR%[ERROR] %~1%RESET%
    exit /b 0

REM ============================================================================
REM Prerequisite Checks
REM ============================================================================

:check_prerequisites
    setlocal
    echo Checking prerequisites...
    
    set "missing_tools=0"
    
    REM Check Node.js
    node --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Node.js not found. Install from https://nodejs.org/
        set "missing_tools=1"
    ) else (
        for /f "tokens=*" %%i in ('node --version') do set "node_version=%%i"
        echo [SUCCESS] Node.js !node_version! found
    )
    
    REM Check pnpm
    pnpm --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] pnpm not found. Install with: npm install -g pnpm
        set "missing_tools=1"
    ) else (
        for /f "tokens=*" %%i in ('pnpm --version') do set "pnpm_version=%%i"
        echo [SUCCESS] pnpm !pnpm_version! found
    )
    
    REM Check Git
    git --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Git not found. Install from https://git-scm.com/
        set "missing_tools=1"
    ) else (
        for /f "tokens=*" %%i in ('git --version') do set "git_version=%%i"
        echo [SUCCESS] !git_version! found
    )
    
    if !missing_tools! equ 1 (
        echo.
        echo [ERROR] Please install missing prerequisites and try again.
        exit /b 1
    )
    
    echo.
    echo [SUCCESS] All prerequisites are installed
    exit /b 0

REM ============================================================================
REM Environment Setup
REM ============================================================================

:setup_environment_variables
    setlocal
    set "env_file=%PROJECT_ROOT%.env.local"
    
    echo Setting up environment variables...
    
    if exist "!env_file!" (
        echo [WARNING] Environment file already exists
        set /p overwrite="Do you want to overwrite it? (y/n): "
        if /i not "!overwrite!"=="y" (
            echo Skipping environment setup
            exit /b 0
        )
    )
    
    (
        echo # Development Environment Variables
        echo # Copy sensitive values from your team's secure storage
        echo # DO NOT commit this file to version control
        echo.
        echo # API Configuration
        echo API_URL=http://localhost:3001
        echo NODE_ENV=development
        echo.
        echo # Database Configuration (if needed^)
        echo # DATABASE_URL=your_database_url_here
        echo.
        echo # Authentication (if needed^)
        echo # AUTH_TOKEN=your_auth_token_here
        echo.
        echo # Third-party Services (if needed^)
        echo # STRIPE_KEY=your_stripe_key_here
    ) > "!env_file!"
    
    echo [SUCCESS] Environment file created at !env_file!
    echo [WARNING] Remember to fill in required environment variables
    exit /b 0

REM ============================================================================
REM Dependency Management
REM ============================================================================

:install_dependencies
    setlocal
    echo Installing dependencies with pnpm...
    cd /d "%PROJECT_ROOT%"
    
    call pnpm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
    
    echo [SUCCESS] Dependencies installed successfully
    exit /b 0

:clean_dependencies
    setlocal
    echo [WARNING] This will remove all dependencies and build artifacts
    set /p confirm="Are you sure? (y/n): "
    
    if /i not "!confirm!"=="y" (
        echo Cancelled
        exit /b 0
    )
    
    echo Cleaning...
    cd /d "%PROJECT_ROOT%"
    
    REM Remove node_modules
    for /d /r . %%d in (node_modules) do @if exist "%%d" rmdir /s /q "%%d"
    
    REM Remove build artifacts
    for /d /r artifacts %%d in (dist .next) do @if exist "%%d" rmdir /s /q "%%d"
    
    echo [SUCCESS] Clean completed
    exit /b 0

REM ============================================================================
REM Build Operations
REM ============================================================================

:build_project
    setlocal
    echo Building project...
    cd /d "%PROJECT_ROOT%"
    
    call pnpm run build
    if errorlevel 1 (
        echo [ERROR] Build failed
        exit /b 1
    )
    
    echo [SUCCESS] Build completed successfully
    exit /b 0

:typecheck_project
    setlocal
    echo Running TypeScript type checking...
    cd /d "%PROJECT_ROOT%"
    
    call pnpm run typecheck
    if errorlevel 1 (
        echo [ERROR] Type checking failed
        exit /b 1
    )
    
    echo [SUCCESS] Type checking passed
    exit /b 0

REM ============================================================================
REM Development Servers
REM ============================================================================

:start_dev_servers
    setlocal
    echo Starting development servers...
    echo.
    echo [INFO] Servers will start in separate windows
    echo.
    
    cd /d "%PROJECT_ROOT%"
    
    if not exist ".dev-logs" mkdir ".dev-logs"
    
    echo [INFO] Starting API Server on http://localhost:3001
    start "API Server" cmd /k "pnpm --filter @workspace/api-server run dev"
    
    timeout /t 2 /nobreak
    
    echo [INFO] Starting CartersCare (Vite) on http://localhost:5173
    start "CartersCare Dev Server" cmd /k "pnpm --filter @workspace/carterscare run dev"
    
    echo.
    echo [SUCCESS] Development servers started!
    echo.
    echo Applications available at:
    echo   - Web App (CartersCare):  http://localhost:5173
    echo   - API Server:              http://localhost:3001
    echo.
    echo Close server windows to stop development
    exit /b 0

:start_web_dev
    setlocal
    echo Starting CartersCare development server...
    cd /d "%PROJECT_ROOT%"
    call pnpm --filter @workspace/carterscare run dev
    exit /b 0

:start_api_dev
    setlocal
    echo Starting API Server development server...
    cd /d "%PROJECT_ROOT%"
    call pnpm --filter @workspace/api-server run dev
    exit /b 0

REM ============================================================================
REM Full Setup
REM ============================================================================

:full_setup
    setlocal
    echo.
    echo Running full development setup...
    echo.
    
    call :check_prerequisites
    if errorlevel 1 exit /b 1
    echo.
    
    call :install_dependencies
    if errorlevel 1 exit /b 1
    echo.
    
    call :setup_environment_variables
    echo.
    
    echo [SUCCESS] Setup completed successfully!
    echo.
    echo Next steps:
    echo   1. Review and update .env.local with your configuration
    echo   2. Run "dev-setup.bat dev" to start development servers
    echo   3. Access the application at http://localhost:5173
    echo.
    exit /b 0

REM ============================================================================
REM Help
REM ============================================================================

:show_help
    cls
    echo.
    echo ========================================
    echo  CartersCarev3 Development Setup Script
    echo ========================================
    echo.
    echo USAGE:
    echo   dev-setup.bat [command]
    echo.
    echo COMMANDS:
    echo   setup       - Full setup (prerequisites, dependencies, env vars^)
    echo   dev         - Start all development servers
    echo   dev:web     - Start only CartersCare development server
    echo   dev:api     - Start only API Server
    echo   build       - Build all packages for production
    echo   typecheck   - Run TypeScript type checking
    echo   clean       - Remove dependencies and build artifacts
    echo   help        - Display this help message
    echo.
    echo EXAMPLES:
    echo   dev-setup.bat setup          # First-time setup
    echo   dev-setup.bat dev            # Start development
    echo   dev-setup.bat build          # Build for production
    echo.
    echo DEVELOPMENT SERVERS:
    echo   - Web App (Vite):   http://localhost:5173
    echo   - API Server:       http://localhost:3001
    echo.
    echo TROUBLESHOOTING:
    echo   - Ensure Node.js and pnpm are installed
    echo   - Use pnpm instead of npm or yarn
    echo   - Close server windows to stop development
    echo.
    exit /b 0

REM ============================================================================
REM Main Command Handler
REM ============================================================================

set "command=%1"
if "%command%"=="" set "command=help"

if /i "%command%"=="setup" (
    call :full_setup
) else if /i "%command%"=="dev" (
    call :start_dev_servers
) else if /i "%command%"=="dev:web" (
    call :start_web_dev
) else if /i "%command%"=="dev:api" (
    call :start_api_dev
) else if /i "%command%"=="build" (
    call :build_project
) else if /i "%command%"=="typecheck" (
    call :typecheck_project
) else if /i "%command%"=="clean" (
    call :clean_dependencies
) else if /i "%command%"=="help" (
    call :show_help
) else (
    echo [ERROR] Unknown command: %command%
    echo.
    call :show_help
    exit /b 1
)

endlocal
