#!/bin/bash

cd "$(dirname "$0")/.."

# Bring down the existing demo environment
sudo docker-compose -p demo -f dockerfiles/docker-compose-demo.yml down -v

# Build the demo images
sudo docker-compose -p demo -f dockerfiles/docker-compose-demo.yml build

# Bring up the demo environment
sudo docker-compose -p demo -f dockerfiles/docker-compose-demo.yml up
