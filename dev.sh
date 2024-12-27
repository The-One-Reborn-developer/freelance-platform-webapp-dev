#!/bin/bash

sudo docker-compose -f down docker-compose-dev.yml -v
sudo docker-compose -f build docker-compose-dev.yml --no-cache
sudo docker-compose -f up docker-compose-dev.yml