#!/usr/bin/env bash
# 启动太湖云 AI 依赖的数据库（PostgreSQL）与缓存（Redis）Docker 容器
# 前提：已安装并启动 Docker Desktop

set -e

echo "启动 PostgreSQL 与 Redis 容器..."

docker run --name lakecloud-postgres --rm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lakecloud_ai \
  -p 5433:5432 \
  -d postgres:15

docker run --name lakecloud-redis --rm \
  -p 6380:6379 \
  -d redis:7-alpine

echo "等待 PostgreSQL 就绪..."
for i in $(seq 1 30); do
  if docker exec lakecloud-postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "PostgreSQL 已就绪"
    break
  fi
  sleep 1
done

echo "初始化数据库..."
docker exec -i lakecloud-postgres psql -U postgres -d lakecloud_ai < ./src/main/resources/db/init.sql

echo "完成。PostgreSQL: localhost:5432, Redis: localhost:6379"
