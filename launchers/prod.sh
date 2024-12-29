#!/bin/bash

cd "$(dirname "$0")/.."
sudo docker-compose -f dockerfiles/docker-compose-prod.yml down -v
sudo docker-compose -f dockerfiles/docker-compose-prod.yml build --no-cache
sudo docker-compose -f dockerfiles/docker-compose-prod.yml up
