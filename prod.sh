#!/bin/bash

sudo docker-compose -f docker-compose-prod.yml down -v
sudo docker-compose -f docker-compose-prod.yml build --no-cache
sudo docker-compose -f docker-compose-prod.yml up
