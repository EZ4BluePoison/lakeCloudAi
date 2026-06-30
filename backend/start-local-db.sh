#!/usr/bin/env bash
# 启动本地便携版 PostgreSQL 14 与 Redis 5.0（无 Docker / 无管理员权限）

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
PG_DIR="$PROJECT_ROOT/runtime/pgsql"
PG_DATA="$PROJECT_ROOT/runtime/pgdata"
PG_LOG_DIR="$PROJECT_ROOT/runtime/logs"
PG_LOG="$PG_LOG_DIR/postgres.log"
REDIS_DIR="$PROJECT_ROOT/runtime/redis"

check_port() {
  local port="$1"
  if command -v netstat >/dev/null 2>&1; then
    netstat -an | grep -q ":$port .* LISTENING"
  else
    # 使用 PowerShell 作为备选
    powershell -Command "(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) -ne \$null" 2>/dev/null | grep -q "True"
  fi
}

mkdir -p "$PG_LOG_DIR"

# ===== PostgreSQL =====
if check_port 5433; then
  echo "PostgreSQL 已经在 5433 端口运行"
else
  if [ ! -d "$PG_DATA" ]; then
    echo "初始化 PostgreSQL 数据目录: $PG_DATA"
    "$PG_DIR/bin/initdb.exe" -U postgres -D "$PG_DATA" --locale=zh_CN.UTF-8 --encoding=UTF8
  fi

  echo "启动 PostgreSQL ..."
  "$PG_DIR/bin/pg_ctl.exe" start -D "$PG_DATA" -l "$PG_LOG" -o "-p 5433"

  echo "等待 PostgreSQL 就绪 ..."
  for i in $(seq 1 30); do
    if "$PG_DIR/bin/pg_isready.exe" -h localhost -p 5433 -U postgres >/dev/null 2>&1; then
      echo "PostgreSQL 已就绪"
      break
    fi
    sleep 1
  done
fi

# 如果 lakecloud_ai 数据库不存在则创建
if ! "$PG_DIR/bin/psql.exe" -h localhost -p 5433 -U postgres -d lakecloud_ai -c "SELECT 1" >/dev/null 2>&1; then
  echo "创建数据库 lakecloud_ai ..."
  "$PG_DIR/bin/psql.exe" -h localhost -p 5433 -U postgres -c "CREATE DATABASE lakecloud_ai;"
fi

# 初始化表结构（幂等，可重复执行）
echo "初始化/更新表结构 ..."
PGPASSWORD=postgres "$PG_DIR/bin/psql.exe" \
  -h localhost -p 5433 -U postgres -d lakecloud_ai \
  -f "$PROJECT_ROOT/src/main/resources/db/init.sql" \
  >/dev/null 2>&1 || true

# ===== Redis =====
if check_port 6380; then
  echo "Redis 已经在 6380 端口运行"
else
  echo "启动 Redis ..."
  cd "$REDIS_DIR"
  ./redis-server.exe redis.windows.conf &
  echo "Redis 已启动（端口 6380）"
fi

echo ""
echo "本地数据库就绪："
echo "  PostgreSQL: localhost:5433 (database: lakecloud_ai, user: postgres, password: postgres)"
echo "  Redis:      localhost:6380"
