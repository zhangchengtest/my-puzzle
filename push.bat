@echo off
REM 按你的代理端口改，Clash 常见 7890
set PROXY=http://127.0.0.1:7890

git -c http.proxy=%PROXY% -c https.proxy=%PROXY% push origin main
if errorlevel 1 (
  echo.
  echo Push failed. Check proxy or network.
  pause
  exit /b 1
)
echo.
echo Push done.
pause
