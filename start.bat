@echo off
echo ========================================
echo B2B采购平台交互系统启动器
echo ========================================
echo.
echo 请选择要打开的测试页面：
echo.
echo [1] 主启动页面 (推荐)
echo [2] 主系统原型
echo [3] 业务流演示系统  
echo [4] 按钮交互测试
echo [5] 查看测试说明
echo [6] 查看设计文档
echo [7] 打开所有页面
echo [8] 重置业务数据
echo [9] 退出
echo.
set /p choice="请输入选择 (1-9): "

if "%choice%"=="1" (
    start index.html
) else if "%choice%"=="2" (
    start chinamarket-business-system-prototype.html
) else if "%choice%"=="3" (
    start demo-business-flow.html
) else if "%choice%"=="4" (
    start button-test.html
) else if "%choice%"=="5" (
    start 测试说明.md
) else if "%choice%"=="6" (
    start docs/B2B平台交互流程设计.md
) else if "%choice%"=="7" (
    start index.html
    timeout /t 2 /nobreak >nul
    start chinamarket-business-system-prototype.html
    timeout /t 2 /nobreak >nul
    start demo-business-flow.html
    echo 所有页面已打开！
) else if "%choice%"=="8" (
    echo.
    echo 警告：这将清除所有业务数据！
    set /p confirm="确认要重置吗？(y/N): "
    if /i "%confirm%"=="y" (
        echo 正在重置业务数据...
        echo 请打开浏览器控制台执行：
        echo localStorage.removeItem('b2b_business_data')
        echo.
        echo 对于演示系统，请点击页面上的"重置流程"按钮
        pause
    )
) else if "%choice%"=="9" (
    exit
) else (
    echo 无效的选择！
    pause
)

echo.
echo 页面将在浏览器中打开...
echo 如果浏览器没有自动打开，请手动打开对应的HTML文件
echo.
pause