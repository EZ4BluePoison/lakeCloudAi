#!/usr/bin/env bash
# 启动太湖云 AI 后端服务
# 本脚本使用项目本地便携版 JDK 与 Maven，不依赖系统环境变量

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
JDK_HOME="$PROJECT_ROOT/tools/jdk1.8.0_492"
MAVEN_HOME="$PROJECT_ROOT/tools/apache-maven-3.9.9"
JAR_FILE="$PROJECT_ROOT/target/ai-enterprise-1.0.0.jar"

if [ ! -d "$JDK_HOME" ]; then
  echo "错误：本地 JDK 不存在：$JDK_HOME"
  echo "请先运行环境准备脚本或重新下载 JDK 到 backend/tools/"
  exit 1
fi

if [ ! -f "$JAR_FILE" ]; then
  echo "未找到 JAR 文件，正在重新打包..."
  export JAVA_HOME="$JDK_HOME"
  export PATH="$JDK_HOME/bin:$MAVEN_HOME/bin:$PATH"
  cd "$PROJECT_ROOT"
  mvn clean package -DskipTests
fi

echo "启动后端服务..."
export JAVA_HOME="$JDK_HOME"
export PATH="$JDK_HOME/bin:$MAVEN_HOME/bin:$PATH"
cd "$PROJECT_ROOT"
java -jar "$JAR_FILE" --spring.profiles.active=local
