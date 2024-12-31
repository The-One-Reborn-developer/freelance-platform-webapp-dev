#!/bin/bash

cd "$(dirname "$0")/.."

# Bring down the existing dev environment
sudo docker-compose -p dev -f dockerfiles/docker-compose-dev.yml down -v

# Build the dev images
sudo docker-compose -p dev -f dockerfiles/docker-compose-dev.yml build

# Bring up the dev environment
sudo docker-compose -p dev -f dockerfiles/docker-compose-dev.yml up
