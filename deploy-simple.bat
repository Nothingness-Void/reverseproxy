@echo off
echo ========================================
echo   Cloudflare Workers 工具包 - 快速部署
echo ========================================
echo.

echo 请选择要部署的工具:
echo 1. 反向代理服务
echo 2. 文本存储服务  
echo 3. 工具包入口
echo 4. 全部部署
echo.

set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" (
    echo 正在部署反向代理服务...
    wrangler deploy --config wrangler.toml
    goto end
)

if "%choice%"=="2" (
    echo 正在部署文本存储服务...
    echo 注意：请确保已在 wrangler-text-storage.toml 中配置了 KV namespace ID
    wrangler deploy --config wrangler-text-storage.toml
    goto end
)

if "%choice%"=="3" (
    echo 正在部署工具包入口...
    wrangler deploy --config wrangler-index.toml
    goto end
)

if "%choice%"=="4" (
    echo 正在部署所有工具...
    echo.
    echo [1/3] 部署反向代理服务...
    wrangler deploy --config wrangler.toml
    echo.
    echo [2/3] 部署文本存储服务...
    wrangler deploy --config wrangler-text-storage.toml
    echo.
    echo [3/3] 部署工具包入口...
    wrangler deploy --config wrangler-index.toml
    goto end
)

echo 无效选择，请重新运行脚本。

:end
echo.
echo 部署完成！
pause