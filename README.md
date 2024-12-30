# Servis Plus

A TG WebApp for customers to post bids and performers to respond.

[Dev](https://t.me/servis_plus_dev_bot) | [Demo](https://t.me/servis_plus_demo_bot) | [Prod](https://t.me/app_servis_plus_bot)

## Features

### Services

* Creating and searching bids by city
* Save chat history between customer and performer
* Show chat history between customer and performer to other customers and performers when needed

### Delivery

* Creating and searching bids by city
* Save chat history between customer and courier
* Show chat history between customer and courier to other customers and couriers when needed

### Chat

* Send text messages and receive them in real time
* Send images and receive them in real time

## Dependencies

* [node.js](https://nodejs.org/en/)
* [express](https://expressjs.com/)
* [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
* [aiogram](https://github.com/aiogram/aiogram)
* [python-dotenv](https://github.com/theskumar/python-dotenv)
* [nginx](https://nginx.org/en/)
* [certbot](https://certbot.eff.org/)
* [python3-certbot-nginx](https://github.com/certbot/certbot/tree/main/certbot-nginx)
* [docker](https://www.docker.com/)
* [docker-compose](https://docs.docker.com/compose/)

## Setup

Node.js:

```bash
# download and install Node.js (you may need to restart the terminal)
nvm install 22

# verifies the right Node.js version is in the environment
node -v # should print "v22.12.0"

# verifies the right npm version is in the environment
npm -v # should print "10.9.0"
```

Application:

```bash
# install dependencies
npm install

# create virtual environment
python3 -m venv .venv

# activate virtual environment
source .venv/bin/activate
```

## Running

```bash
sudo bash launchers/{choose environment}.sh
```
