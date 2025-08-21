chcp 65001
@echo off
%@Try%
npm install
%@EndTry%
:@Catch
ECHO 乂☆★缺少Node.js★☆乂
ECHO 請先下載並安裝後再來
PAUSE
start "" https://nodejs.org/en/download/
:@EndCatch