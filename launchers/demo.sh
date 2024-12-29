#!/bin/bash

cd "$(dirname "$0")/.."
sudo docker-compose -f dockerfiles/docker-compose-demo.yml down -v
sudo docker-compose -f dockerfiles/docker-compose-demo.yml build --no-cache
sudo docker-compose -f dockerfiles/docker-compose-demo.yml up
