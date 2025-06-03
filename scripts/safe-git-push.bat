@echo off
setlocal enabledelayedexpansion

REM Safe Git Push Script - Windows Batch Version
REM This script safely pushes changes while protecting MCP server functionality

echo 🚀 SAFE GIT PUSH - 510 CHANGES
echo ===============================

REM Configuration
set SAFETY_BRANCH=pre-push-safety-backup
set STAGING_BRANCH=staging-510-changes
set MAIN_BRANCH=main

REM Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not in a git repository!
    exit /b 1
)

echo.
echo 🔍 PHASE 1: PRE-PUSH SAFETY CHECKS
echo ==================================

REM Check uncommitted changes
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set UNCOMMITTED_CHANGES=%%i
echo Uncommitted changes: %UNCOMMITTED_CHANGES%

if %UNCOMMITTED_CHANGES% equ 0 (
    echo ⚠️  No uncommitted changes found.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Exiting.
        exit /b 0
    )
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo Current branch: %CURRENT_BRANCH%

echo.
echo 📦 PHASE 2: CREATE SAFETY BACKUP
echo ================================

echo Creating MCP configuration backup...
if exist scripts\create-backup.sh (
    call npm run safety:backup
    if %errorlevel% neq 0 (
        echo ❌ Backup failed!
        exit /b 1
    )
    echo ✅ Backup completed
) else (
    echo ❌ Backup script not found!
    exit /b 1
)

echo.
echo 🔍 PHASE 3: TEST CURRENT MCP STATE
echo ==================================

echo Testing all MCP servers...
if exist scripts\test-mcp-servers.sh (
    call npm run safety:test
    set TEST_RESULT=!errorlevel!
    
    if !TEST_RESULT! equ 0 (
        echo ✅ All MCP servers healthy
    ) else if !TEST_RESULT! equ 1 (
        echo ⚠️  Minor issues detected
        set /p CONTINUE="Continue despite minor issues? (y/n): "
        if /i not "!CONTINUE!"=="y" (
            echo Fix issues and try again.
            exit /b 1
        )
    ) else (
        echo ❌ Critical MCP server issues detected
        echo Fix critical issues before proceeding.
        exit /b 1
    )
) else (
    echo ⚠️  Test script not found, skipping MCP tests
)

echo.
echo 🔄 PHASE 4: CREATE SAFETY BRANCHES
echo ==================================

echo Creating safety backup branch...
git checkout -b %SAFETY_BRANCH% 2>nul || git checkout %SAFETY_BRANCH%
git add .
git commit -m "Safety backup before 510 changes push - %date% %time%" 2>nul || echo Nothing to commit
git push origin %SAFETY_BRANCH% --force
if %errorlevel% neq 0 (
    echo ❌ Failed to push safety branch
    exit /b 1
)
echo ✅ Safety branch created

echo Creating staging branch...
git checkout %CURRENT_BRANCH%
git checkout -b %STAGING_BRANCH% 2>nul || git checkout %STAGING_BRANCH%
git add .
git commit -m "Staging: 510 changes for safety testing - %date% %time%" 2>nul || echo Nothing to commit
git push origin %STAGING_BRANCH% --force
if %errorlevel% neq 0 (
    echo ❌ Failed to push staging branch
    exit /b 1
)
echo ✅ Staging branch created

echo.
echo 🚀 PHASE 5: MERGE TO MAIN
echo =========================

echo Ready to merge staging branch to main and push.
set /p PROCEED="Proceed with final push? (y/n): "
if /i not "%PROCEED%"=="y" (
    echo Push cancelled. Staging branch is ready when you are.
    echo Manual commands:
    echo   git checkout %MAIN_BRANCH%
    echo   git merge %STAGING_BRANCH%
    echo   git push origin %MAIN_BRANCH%
    exit /b 0
)

echo Merging staging to main...
git checkout %MAIN_BRANCH%
git merge %STAGING_BRANCH%
if %errorlevel% neq 0 (
    echo ❌ Merge failed
    exit /b 1
)

echo Pushing to main branch...
git push origin %MAIN_BRANCH%
if %errorlevel% neq 0 (
    echo ❌ Push failed
    exit /b 1
)

REM Create deployment tag
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DATE_TAG=%%c%%a%%b
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do set TIME_TAG=%%a%%b%%c
set DEPLOY_TAG=deploy-%DATE_TAG%_%TIME_TAG%

echo Creating deployment tag...
git tag -a %DEPLOY_TAG% -m "Safe deployment of 510 changes"
git push origin %DEPLOY_TAG%
if %errorlevel% neq 0 (
    echo ❌ Tag push failed
    exit /b 1
)

echo.
echo ✅ PHASE 6: POST-PUSH VERIFICATION
echo ==================================

echo Waiting for deployment to settle...
timeout /t 5 /nobreak >nul

echo.
echo ⚠️  IMPORTANT: Please manually verify the following:
echo   1. Restart Roo Code
echo   2. Restart Claude Desktop
echo   3. Test MCP server connectivity in Roo
echo   4. Test your website functionality

set /p RUN_TEST="Run post-push MCP server test now? (y/n): "
if /i "%RUN_TEST%"=="y" (
    echo Testing MCP servers after push...
    call npm run safety:test
    if !errorlevel! equ 0 (
        echo ✅ Post-push tests passed
    ) else (
        echo ⚠️  Post-push tests showed issues
        echo Monitor closely and run emergency restore if needed.
    )
)

echo.
echo 🎉 DEPLOYMENT COMPLETE
echo =====================

echo ✅ Successfully deployed 510 changes!
echo.
echo 📋 Deployment Summary:
echo   🏷️  Deployment Tag: %DEPLOY_TAG%
echo   🌿 Safety Branch: %SAFETY_BRANCH%
echo   🧪 Staging Branch: %STAGING_BRANCH%
echo   📦 Backups: ./backups/
echo.
echo 🚨 Emergency Commands:
echo   Restore MCP configs: npm run safety:restore
echo   Rollback git: git reset --hard %SAFETY_BRANCH%
echo.
echo 🔍 Monitor your website and MCP servers for the next 30 minutes.
echo If any issues arise, use the emergency restore script immediately.
echo.
echo 🎊 Congratulations! Your 510 changes are safely deployed.

endlocal