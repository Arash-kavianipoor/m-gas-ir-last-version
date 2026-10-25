#!/bin/bash
set -e

echo "================================================================="
echo "M-Gas Inventory: Compiling & Packaging Windows 32-bit & 64-bit Releases"
echo "================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p release-dist
mkdir -p public/downloads

# 1. Clean previous releases completely
echo ">> [1/8] پاک‌سازی کامل نسخه‌های قدیمی ویندوز و پکیج‌های پیشین..."
rm -rf release-dist
mkdir -p release-dist
mkdir -p public/downloads
rm -f public/downloads/*.exe public/downloads/*.zip public/downloads/*.bat
rm -rf dist/downloads/*.exe dist/downloads/*.zip dist/downloads/*.bat 2>/dev/null || true

# 2. Build Web Application Dist
echo ">> [2/8] ساخت آخرین بیلد رابط وب (npm run build)..."
npm run build

# 3. Ensure SQLite databases exist in release-dist
echo ">> [3/8] کپی پایگاه‌های داده محلی (db-anbar1, db-anbar2, db-anbar3)..."
cp public/db-anbar*.db release-dist/
cp public/db-anbar*.db public/downloads/
cp public/db-anbar1 public/downloads/db-anbar1 2>/dev/null || cp public/db-anbar1.db public/downloads/db-anbar1
cp public/db-anbar2 public/downloads/db-anbar2 2>/dev/null || cp public/db-anbar2.db public/downloads/db-anbar2
cp public/db-anbar3 public/downloads/db-anbar3 2>/dev/null || cp public/db-anbar3.db public/downloads/db-anbar3

# 4. Compile 64-bit native Windows server/launcher
echo ">> [4/8] کامپایل نسخه ۶۴ بیتی محلی (x86_64-w64-mingw32-gcc)..."
x86_64-w64-mingw32-gcc -O2 -mwindows scripts/mgas-server.c -o release-dist/MGasServer64.exe -lws2_32 -lwininet -lshell32 -lole32

# 5. Compile 32-bit native Windows server/launcher (Guaranteed Win7 / Legacy x86)
echo ">> [5/8] کامپایل نسخه ۳۲ بیتی محلی (i686-w64-mingw32-gcc)..."
i686-w64-mingw32-gcc -O2 -mwindows scripts/mgas-server.c -o release-dist/MGasServer32.exe -lws2_32 -lwininet -lshell32 -lole32

# 6. Build NSIS Installers
echo ">> [6/8] ساخت نصاب‌های رسمی ویندوز با NSIS..."
makensis scripts/build-office-installer.nsi
makensis scripts/build-warehouse-installer.nsi

# Create duplicate aliases with clear 64bit and 32bit naming
cp release-dist/Office-Windows11-Setup.exe release-dist/MGas-Inventory-Windows-64bit-Setup.exe
cp release-dist/Warehouse-Windows7-Setup.exe release-dist/MGas-Inventory-Windows-32bit-Setup.exe

# 7. Create Portable Zip Packages (No installation required)
echo ">> [7/8] ساخت بسته‌های پرتابل بدون نیاز به نصب (Portable ZIP)..."
PORTABLE_64="release-dist/portable_64"
PORTABLE_32="release-dist/portable_32"
rm -rf "$PORTABLE_64" "$PORTABLE_32"
mkdir -p "$PORTABLE_64/app" "$PORTABLE_32/app"

# Copy web files
cp -r dist/* "$PORTABLE_64/app/"
cp -r dist/* "$PORTABLE_32/app/"
rm -rf "$PORTABLE_64/app/downloads" "$PORTABLE_32/app/downloads"

# Copy executables
cp release-dist/MGasServer64.exe "$PORTABLE_64/MGasInventory.exe"
cp release-dist/MGasServer32.exe "$PORTABLE_32/MGasInventory.exe"

# Copy databases
cp release-dist/db-anbar*.db "$PORTABLE_64/"
cp release-dist/db-anbar*.db "$PORTABLE_32/"
cp release-dist/db-anbar1 "$PORTABLE_64/" 2>/dev/null || cp release-dist/db-anbar1.db "$PORTABLE_64/db-anbar1"
cp release-dist/db-anbar2 "$PORTABLE_64/" 2>/dev/null || cp release-dist/db-anbar2.db "$PORTABLE_64/db-anbar2"
cp release-dist/db-anbar3 "$PORTABLE_64/" 2>/dev/null || cp release-dist/db-anbar3.db "$PORTABLE_64/db-anbar3"
cp release-dist/db-anbar1 "$PORTABLE_32/" 2>/dev/null || cp release-dist/db-anbar1.db "$PORTABLE_32/db-anbar1"
cp release-dist/db-anbar2 "$PORTABLE_32/" 2>/dev/null || cp release-dist/db-anbar2.db "$PORTABLE_32/db-anbar2"
cp release-dist/db-anbar3 "$PORTABLE_32/" 2>/dev/null || cp release-dist/db-anbar3.db "$PORTABLE_32/db-anbar3"

# Copy logs & icons
cp scripts/initial-log-template.txt "$PORTABLE_64/MGas_Execution_Log.txt"
cp scripts/initial-log-template.txt "$PORTABLE_32/MGas_Execution_Log.txt"
cp public/logo.ico "$PORTABLE_64/"
cp public/logo.ico "$PORTABLE_32/"

# Create Run.bat for portable
cat << 'EOF' > "$PORTABLE_64/اجرای_سامانه_ام_گاز.bat"
@echo off
chcp 65001 >nul
title سامانه انبارداری ام گاز (نسخه ۶۴ بیتی پرتابل)
start "" "%~dp0MGasInventory.exe"
EOF

cat << 'EOF' > "$PORTABLE_32/اجرای_سامانه_ام_گاز.bat"
@echo off
chcp 65001 >nul
title سامانه انبارداری ام گاز (نسخه ۳۲ بیتی پرتابل)
start "" "%~dp0MGasInventory.exe"
EOF

# Compress portable folders using 7z / zip
SEVEN_ZIP="$(which 7z 2>/dev/null || which 7za 2>/dev/null || echo "$ROOT_DIR/node_modules/7zip-bin/linux/x64/7za")"
if [ ! -x "$SEVEN_ZIP" ] && [ -x "$ROOT_DIR/node_modules/7zip-bin/linux/x64/7za" ]; then
  chmod +x "$ROOT_DIR/node_modules/7zip-bin/linux/x64/7za" 2>/dev/null || true
  SEVEN_ZIP="$ROOT_DIR/node_modules/7zip-bin/linux/x64/7za"
fi

if [ -x "$SEVEN_ZIP" ]; then
  "$SEVEN_ZIP" a -tzip -mx=9 release-dist/MGas-Inventory-Windows-64bit-Portable.zip ./release-dist/portable_64/* > /dev/null
  "$SEVEN_ZIP" a -tzip -mx=9 release-dist/MGas-Inventory-Windows-32bit-Portable.zip ./release-dist/portable_32/* > /dev/null
else
  (cd release-dist/portable_64 && zip -r -9 ../MGas-Inventory-Windows-64bit-Portable.zip .) > /dev/null
  (cd release-dist/portable_32 && zip -r -9 ../MGas-Inventory-Windows-32bit-Portable.zip .) > /dev/null
fi

rm -rf "$PORTABLE_64" "$PORTABLE_32"

# 8. Deploy to public/downloads/
echo ">> [8/8] انتقال فایل‌های نهایی به public/downloads/..."
cp release-dist/Office-Windows11-Setup.exe public/downloads/
cp release-dist/Warehouse-Windows7-Setup.exe public/downloads/
cp release-dist/MGas-Inventory-Windows-64bit-Setup.exe public/downloads/
cp release-dist/MGas-Inventory-Windows-32bit-Setup.exe public/downloads/
cp release-dist/MGas-Inventory-Windows-64bit-Portable.zip public/downloads/
cp release-dist/MGas-Inventory-Windows-32bit-Portable.zip public/downloads/

# Diagnostic batch and guides
cat << 'EOF' > public/downloads/Run-Office-Diagnose.bat
@echo off
chcp 65001 >nul
echo ================================================================================
echo سامانه مدیریت انبارداری شرکت ام گاز - ابزار عیب‌یابی شبکه و پورت ۳۰۰۰
echo ================================================================================
echo.
echo ۱. بررسی وضعیت پورت ۳۰۰۰ روی سیستم:
netstat -ano | findstr :3000
echo.
echo ۲. بررسی اتصال اینترنت به پایگاه داده ابری anbar.mgas.ir:
ping -n 2 anbar.mgas.ir
echo.
echo در صورت عدم پاسخ، اطمینان حاصل کنید اتصال اینترنت برقرار بوده و دسترسی به anbar.mgas.ir مجاز است.
pause
EOF

cat << 'EOF' > public/downloads/M-Gas-Troubleshooting-Win11.txt
راهنمای جامع راه‌اندازی و عیب‌یابی سیستم انبارداری ام گاز (ویندوز ۱۰ و ۱۱ - ۶۴ بیتی):
================================================================================
۱. نسخه ۶۴ بیتی اختصاصی برای کامپیوترهای دفتر مرکزی و سیستم‌های مدرن طراحی شده است.
۲. ارتباط زنده (Live Stream) با سرور مرکزی anbar.mgas.ir از طریق پورت ۳۰۰۰ و HTTPS برقرار است.
۳. کلیه اسناد و کاردکس‌ها به صورت آنی بین سیستم و دیتابیس ابری همگام‌سازی می‌گردند.
۴. قانون امنیتی مدیر داخلی (خانم کرمی): ویرایش تمامی اسناد حداکثر تا یک ساعت پس از ورود مجاز است.
۵. در صورت برخورد با خطای اشغال پورت ۳۰۰۰، فایل Run-Office-Diagnose.bat را اجرا کنید.
EOF

cat << 'EOF' > public/downloads/M-Gas-Troubleshooting-Win7.txt
راهنمای جامع راه‌اندازی و عیب‌یابی سیستم انبارداری ام گاز (ویندوز ۷ و سیستم‌های ۳۲ بیتی):
================================================================================
۱. نسخه ۳۲ بیتی اختصاصی برای سیستم‌های انبار و ویندوز ۷ طراحی شده و نیازی به ابزارهای جانبی ندارد.
۲. نصاب برنامه تمامی فایل‌ها را در پوشه C:\Users\<User>\AppData\Local\Programs\MGasInventory نصب می‌نماید.
۳. در صورت بروز هرگونه پیام فایروال، گزینه Allow Access را برای پورت ۳۰۰۰ انتخاب نمایید.
۴. ارتباط زنده لایو با دیتابیس مرکزی anbar.mgas.ir به صورت خودکار برقرار بوده و حتی در حالت قطعی اینترنت، تغییرات در پایگاه داده محلی SQLite ذخیره شده و پس از وصل مجدد شبکه منتقل می‌گردند.
EOF

echo "================================================================="
echo "تمام نسخه‌های ۳۲ و ۶۴ بیتی ویندوز با موفقیت ساخته و مستقر گردیدند."
echo "================================================================="
ls -lh public/downloads/
