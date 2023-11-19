# Domus

![Domus Screenshot](https://raw.githubusercontent.com/aitorllj93/domus/main/docs/assets/domus-cover.png)

Domus is a highly opitionated distribution of docker-compose files to deploy a home server with a single command.

## Features

Some of the features included are:

### Administration

- [Portainer](https://www.portainer.io/) for managing the containers.
- [Homarr](https://github.com/ajnart/homarr) for the dashboard/admin panel.
- [Heimdall](https://heimdall.site/) for the home page.

### Productivity

- [Mealie](https://mealie.io/) for recipes and meal planning.

### Entertainment

- [Plex](https://www.plex.tv/) for media streaming.
- [Calibre Web](https://github.com/janeczku/calibre-web) for ebooks and comics.

## Pre-requisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js >=18.16.0](https://nodejs.org/en/download/)

## Running Setup

```sh
npx @central-factory/domus
# or
npm i -g @central-factory/domus
domus
```

## Custom Setup

First of all, you need a copy of this repository.

```sh
npx degit aitorllj93/domus my-domus
cd my-domus
npm install
npm link
```

You can modify the templates in `portainer/templates` folder to fit your needs.
You can also customize the default applications to install in `lib/node/constants.js`.

Then, you can run the setup with:

```sh
domus
```
