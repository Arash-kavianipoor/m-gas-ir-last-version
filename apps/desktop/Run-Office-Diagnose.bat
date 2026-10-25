@echo off
chcp 65001 >nul
title M-Gas Inventory - Windows 11 Diagnostics & Runner
color 0B

echo ======================================================================
echo   سیستم انبارداری ام گاز - سامانه عیب‌یابی و اجرای نسخه دفتر مرکزی (ویندوز 11)
echo   M-Gas Inventory System (Office Management - Windows 11 Diagnostic Console)
echo ======================================================================
echo.
echo [1] بررسی مسیر جاری برنامه:
echo %~dp0
echo.

cd /d "%~dp0"

set LOG_FILE=%~dp0Office-Execution-Log.txt

echo [2] ثبت لاگ لحظه‌ای اجرا در فایل:
echo %LOG_FILE%
echo.

echo ====================================================================== >> "%LOG_FILE%"
echo [DIAGNOSTIC_SESSION_START] %DATE% %TIME% >> "%LOG_FILE%"
echo OS: %OS% | Computer: %COMPUTERNAME% | User: %USERNAME% >> "%LOG_FILE%"
echo App Path: %~dp0 >> "%LOG_FILE%"
echo Command: Office.exe --enable-logging --v=1 >> "%LOG_FILE%"
echo ====================================================================== >> "%LOG_FILE%"

echo [3] در حال اجرای نرم‌افزار Office.exe با فعال‌سازی ثبت لاگ کنسول کرومیوم...
echo لطفاً چند لحظه صبر نمایید...
echo.

if not exist "%~dp0Office.exe" (
    echo [خطای بحرانی] فایل اجرایی Office.exe در این پوشه یافت نشد!
    echo [CRITICAL_ERROR] Office.exe not found in %~dp0 >> "%LOG_FILE%"
    goto finish_error
)

"%~dp0Office.exe" --enable-logging --v=1 >> "%LOG_FILE%" 2>&1
set EXIT_CODE=%ERRORLEVEL%

echo ====================================================================== >> "%LOG_FILE%"
echo [DIAGNOSTIC_SESSION_END] Exit Code: %EXIT_CODE% at %TIME% >> "%LOG_FILE%"
echo ====================================================================== >> "%LOG_FILE%"

echo.
echo ======================================================================
echo فرآیند اجرا خاتمه یافت. کد خروجی (Exit Code): %EXIT_CODE%
echo لاگ کامل اجرا با موفقیت در فایل متنی زیر ذخیره شد:
echo %LOG_FILE%
echo ======================================================================
echo.

if %EXIT_CODE% EQU 0 (
    echo برنامه بدون خطا اجرا و به درستی بسته شد.
    goto finish_normal
)

:finish_error
echo.
echo [نکات عیب‌یابی ویندوز 11 در صورت بسته شدن ناگهانی]:
echo 1. آیا فایل Office.exe توسط آنتی‌ویروس یا Windows Defender SmartScreen مسدود شده است؟
echo    -> روی فایل کلیک راست کرده، Properties را بزنید و در پایین گزینه Unblock را تیک بزنید.
echo 2. اطمینان حاصل کنید که پکیج Visual C++ Redistributable 2015-2022 روی سیستم نصب باشد.
echo 3. برای مشاهده خطای دقیق، فایل متنی Office-Execution-Log.txt در همین پوشه را باز کنید.
echo.

:finish_normal
echo جهت بستن این پنجره، یکی از کلیدهای کیبورد را فشار دهید...
pause >nul
