#!/bin/bash

cd "$(dirname "$0")/.."
sudo docker-compose -f dockerfiles/docker-compose-dev.yml down -v
sudo docker-compose -f dockerfiles/docker-compose-dev.yml build --no-cache
sudo docker-compose -f dockerfiles/docker-compose-dev.yml up
