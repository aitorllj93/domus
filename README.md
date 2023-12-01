# Domus

![Domus Screenshot](https://raw.githubusercontent.com/aitorllj93/domus/main/docs/assets/screenshots/heimdall-launcher.png)

Domus is a highly opitionated distribution of docker-compose files to deploy a home server with a single command.

## Features

Some of the features included are:

### Administration

- [Portainer](https://www.portainer.io/) for managing the containers.
- [Homarr](https://github.com/ajnart/homarr) for the dashboard/admin panel.
- [Heimdall](https://heimdall.site/) for the home page.

### Productivity

- [Shiori](https://github.com/go-shiori/shiori) for bookmarks.
- [Paperless](paperless-ngx.com) for documents.
- [Mealie](https://mealie.io/) for recipes and meal planning.
- [Home Assistant](https://www.home-assistant.io/) for home automation.

### Entertainment

- [Plex](https://www.plex.tv/) for media streaming.
- [Calibre Web](https://github.com/janeczku/calibre-web) for ebooks and comics.
- [Audiobookshelf](https://www.audiobookshelf.org) for audiobooks and podcasts.

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

## Installing Applications

You can pass the -a flag to the setup command to directly install a set of applications.

```sh
domus -a Books,Audiobooks
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

## Specification

Domus encourages some patterns found in other similar projects such as [CasaOS](https://github.com/IceWhaleTech/CasaOS) to make the setup and integrations as easy as possible.

### Docker Compose

The docker-compose files are located in the `portainer/templates` folder. Each service has its own folder with the `docker-compose.yml` file and optionally a `data` folder for the persistent data.

#### docker-compose.yml

The docker-compose file is a standard docker-compose file with some extra features under the `x-domus` keys.

### Volumes

All the volumes are mounted under the `/DATA` folder in the host machine.

#### Config & Databases

Config and databases are stored in the `/DATA/AppData` folder, with the name of the service as the folder name.

#### Media

Media is stored in the `/DATA/Media` folder, and structured based on the type of media.

- `/DATA/Media/Audiobooks`
- `/DATA/Media/Books`
- `/DATA/Media/Documents`
- `/DATA/Media/Movies`
- `/DATA/Media/Music`
- `/DATA/Media/Podcasts`
- `/DATA/Media/TV Shows`
