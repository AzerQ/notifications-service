@echo off
setlocal enabledelayedexpansion

chcp 65001

set "TARGET_JS_FILENAME=extension.js"
set "TARGET_CSS_FILENAME=extension.css"
set "ASSETS_DIR=%~dp0dist\assets"

:: Устанавливаем рабочую директорию (относительно расположения bat-файла)
cd /d "%ASSETS_DIR%"

:: Удаляем старые extension-файлы если они существуют
if exist "%TARGET_JS_FILENAME%" del /f /q "%TARGET_JS_FILENAME%" >nul 2>&1
if exist "%TARGET_CSS_FILENAME%" del /f /q "%TARGET_CSS_FILENAME%" >nul 2>&1

:: Счетчики для отладки
set js_count=0
set css_count=0

:: Обрабатываем JS файлы
for %%f in (index-*.js) do (
    set /a js_count+=1
    if !js_count! equ 1 (
        ren "%%f" "%TARGET_JS_FILENAME%"
    ) else (
        echo [!] Найдено несколько JS файлов! Обработан только первый.
    )
)

:: Обрабатываем CSS файлы
for %%f in (index-*.css) do (
    set /a css_count+=1
    if !css_count! equ 1 (
        ren "%%f" "%TARGET_CSS_FILENAME%"
    ) else (
        echo [!] Найдено несколько CSS файлов! Обработан только первый.
    )
)

:: Проверка результата
if !js_count! equ 0 echo [!] JS файлы не найдены
if !css_count! equ 0 echo [!] CSS файлы не найдены

echo.
echo === ОПЕРАЦИЯ ЗАВЕРШЕНА ===
echo JS файлов обработано: !js_count!
echo CSS файлов обработано: !css_count!

endlocal