#!/usr/bin/env bash
# 下载并准备后端本地便携版 JDK 8 与 Maven 3.9.9
# 适用于 Windows Git Bash / MSYS2，无需管理员权限

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$PROJECT_ROOT/tools"
mkdir -p "$TOOLS_DIR"

# 代理地址，与 git 代理保持一致；如果直连失败会自动尝试代理
PROXY_URL="http://127.0.0.1:7890"

JDK_VERSION="1.8.0_452"
JDK_DIR="$TOOLS_DIR/jdk$JDK_VERSION"
JDK_ZIP="$TOOLS_DIR/jdk8.zip"
JDK_DOWNLOAD_URL="https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u452-b09/OpenJDK8U-jdk_x64_windows_hotspot_8u452b09.zip"

MAVEN_VERSION="3.9.9"
MAVEN_DIR="$TOOLS_DIR/apache-maven-$MAVEN_VERSION"
MAVEN_ZIP="$TOOLS_DIR/maven.zip"
MAVEN_DOWNLOAD_URL="https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"

download_with_fallback() {
  local url="$1"
  local output="$2"
  echo "下载: $url"

  if command -v curl >/dev/null 2>&1; then
    if curl -L --fail --max-time 120 -o "$output" "$url" 2>/dev/null; then
      return 0
    fi
    echo "直连失败，尝试代理 $PROXY_URL ..."
    if curl -L --fail --max-time 120 -x "$PROXY_URL" -o "$output" "$url" 2>/dev/null; then
      return 0
    fi
  fi

  if command -v wget >/dev/null 2>&1; then
    echo "尝试 wget ..."
    if wget --timeout=120 -O "$output" "$url" 2>/dev/null; then
      return 0
    fi
    if wget --timeout=120 -e use_proxy=yes -e http_proxy="$PROXY_URL" -O "$output" "$url" 2>/dev/null; then
      return 0
    fi
  fi

  return 1
}

extract_zip() {
  local zip="$1"
  local target_dir="$2"
  if command -v unzip >/dev/null 2>&1; then
    unzip -q -o "$zip" -d "$target_dir"
  else
    echo "使用 PowerShell 解压 ..."
    powershell -Command "Expand-Archive -Path '$zip' -DestinationPath '$target_dir' -Force"
  fi
}

# ===== JDK =====
if [ -x "$JDK_DIR/bin/java.exe" ]; then
  echo "JDK 已存在: $JDK_DIR"
else
  echo "准备下载 JDK 8 ($JDK_VERSION) ..."
  if ! download_with_fallback "$JDK_DOWNLOAD_URL" "$JDK_ZIP"; then
    echo "错误：无法自动下载 JDK。请手动下载并解压到: $JDK_DIR"
    echo "推荐地址: $JDK_DOWNLOAD_URL"
    exit 1
  fi

  echo "解压 JDK ..."
  extract_zip "$JDK_ZIP" "$TOOLS_DIR"
  EXTRACTED_JDK_DIR="$TOOLS_DIR/jdk8u452-b09"
  if [ ! -d "$EXTRACTED_JDK_DIR" ]; then
    echo "错误：解压后未找到预期目录 $EXTRACTED_JDK_DIR"
    exit 1
  fi
  mv "$EXTRACTED_JDK_DIR" "$JDK_DIR"
  rm -f "$JDK_ZIP"
  echo "JDK 准备完成: $JDK_DIR"
fi

# ===== Maven =====
if [ -x "$MAVEN_DIR/bin/mvn.cmd" ]; then
  echo "Maven 已存在: $MAVEN_DIR"
else
  echo "准备下载 Maven $MAVEN_VERSION ..."
  if ! download_with_fallback "$MAVEN_DOWNLOAD_URL" "$MAVEN_ZIP"; then
    echo "错误：无法自动下载 Maven。请手动下载并解压到: $MAVEN_DIR"
    echo "推荐地址: $MAVEN_DOWNLOAD_URL"
    exit 1
  fi

  echo "解压 Maven ..."
  extract_zip "$MAVEN_ZIP" "$TOOLS_DIR"
  rm -f "$MAVEN_ZIP"
  echo "Maven 准备完成: $MAVEN_DIR"
fi

echo ""
echo "本地工具链准备完成："
echo "  JDK_HOME=$JDK_DIR"
echo "  MAVEN_HOME=$MAVEN_DIR"
echo ""
echo "现在可以运行: cd backend && ./start-backend.sh"
