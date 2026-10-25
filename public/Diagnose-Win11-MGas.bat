@echo off
chcp 65001 > nul
echo ========================================================
echo   سامانه انبارداری ام گاز - اسکریپت عیب‌یابی و سلامت سیستم
echo   M-Gas Inventory System - Diagnostics & Health Checker
echo ========================================================
echo.
echo [1/3] بررسی اشغال بودن پورت 3000 توسط سایر برنامه‌ها:
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo [هشدار] پورت 3000 در حال استفاده است.
) else (
    echo [تایید] پورت 3000 کاملاً آزاد است.
)
echo.
echo [2/3] بررسی پوشه نصب در C:\OfficeManagement:
if exist "C:\OfficeManagement" (
    echo [تایید] پوشه C:\OfficeManagement وجود دارد.
    dir /b "C:\OfficeManagement\*.log" 2>nul
) else (
    echo [توجه] پوشه C:\OfficeManagement هنوز ایجاد نشده است.
)
echo.
echo [3/3] آخرین رخدادهای لاگ نصب:
if exist "Office-Installation-Log.txt" (
    type Office-Installation-Log.txt
) else if exist "C:\OfficeManagement\Office-Installation-Log.txt" (
    type "C:\OfficeManagement\Office-Installation-Log.txt"
) else (
    echo لاگ نصب یافت نشد.
)
echo.
echo ========================================================
echo بررسی به پایان رسید. پنجره را ببندید.
echo ========================================================
pause
