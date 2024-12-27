#!/bin/bash

sudo docker-compose down -f docker-compose-demo.yml -v
sudo docker-compose build -f docker-compose-demo.yml --no-cache
sudo docker-compose up -f docker-compose-demo.yml