@echo off
npm run build && xcopy data dist\data /E /I /H
