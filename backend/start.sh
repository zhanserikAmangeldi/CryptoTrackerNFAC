#!/bin/sh
set -e

for i in $(seq 1 30); do
  nc -z $DB_HOST $DB_PORT && break
  sleep 1
done

./migrate up

exec ./main