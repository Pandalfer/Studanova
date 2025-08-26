@echo off
setlocal enabledelayedexpansion
set total=0

for /r %%f in (*.ts *.tsx *.js *.jsx *.prisma) do (
    echo %%f | findstr /i "\\node_modules\\ \\ .next\\ " >nul
    if errorlevel 1 (
        for /f %%c in ('find /c /v "" "%%f"') do (
            set /a total+=%%c
        )
    )
)

echo Total lines: %total%
endlocal