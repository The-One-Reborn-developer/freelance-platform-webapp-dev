#!/bin/bash

sudo docker-compose -f docker-compose-demo.yml down -v
sudo docker-compose -f docker-compose-demo.yml build --no-cache
sudo docker-compose -f docker-compose-demo.yml up
