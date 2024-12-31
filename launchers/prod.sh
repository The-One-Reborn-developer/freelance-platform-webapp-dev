#!/bin/bash

cd "$(dirname "$0")/.."

# Bring down the existing prod environment
sudo docker-compose -p prod -f dockerfiles/docker-compose-prod.yml down -v

# Build the prod images
sudo docker-compose -p prod -f dockerfiles/docker-compose-prod.yml build

# Bring up the prod environment
sudo docker-compose -p prod -f dockerfiles/docker-compose-prod.yml up
