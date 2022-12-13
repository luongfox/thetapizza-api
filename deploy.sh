#!/bin/sh

git pull origin main -f
docker-compose exec -T app npm install
docker-compose stop
docker-compose start