#!/bin/bash

git pull
sudo docker-compose down -f docker-compose-dev.yml -v
sudo docker-compose build -f docker-compose-dev.yml --no-cache
sudo docker-compose up -f docker-compose-dev.yml