#!/bin/bash

sudo docker-compose -f down docker-compose-demo.yml -v
sudo docker-compose -f build docker-compose-demo.yml --no-cache
sudo docker-compose -f up docker-compose-demo.yml