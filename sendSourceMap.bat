@echo off
set PROJECT_ID=%1

:: inject sentry設定
powershell sentry-cli sourcemaps inject --org jumbo-igaming --project golden-horse-treasure ./build/%PROJECT_ID%/assets/main
powershell sentry-cli sourcemaps inject --org jumbo-igaming --project golden-horse-treasure ./build/%PROJECT_ID%/cocos-js

:: 上傳source-map
powershell sentry-cli sourcemaps upload --org jumbo-igaming --project golden-horse-treasure ./build/%PROJECT_ID%/assets/main
powershell sentry-cli sourcemaps upload --org jumbo-igaming --project golden-horse-treasure ./build/%PROJECT_ID%/cocos-js

:: 移除source-map和sourceMappingURL註解
set folderPath=./build/%PROJECT_ID%
if exist "%folderPath%" (
    echo Deleting .map files and removing sourceMappingURL comments...
    :: 刪除 .map 文件
    for /r "%folderPath%" %%i in (*.map) do (
        del "%%i"
        echo Deleted: %%i
    )
    :: 移除 JS 文件中的 sourceMappingURL 註解
    for /r "%folderPath%" %%i in (*.js) do (
        powershell -Command "(Get-Content '%%i' -Encoding UTF8) -replace '//# sourceMappingURL=.*', '' | Set-Content '%%i' -Encoding UTF8"
        echo Removed sourceMappingURL from: %%i
    )
    echo Process complete.
) else (
    echo Folder not found: %folderPath%
)