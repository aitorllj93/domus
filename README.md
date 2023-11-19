# Domus

The Docker Cloud Operating System for your home

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
