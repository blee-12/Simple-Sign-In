# Simple Sign In

Simple Sign In is a web app designed to streamline event attendance management.

## Features

- Create and manage events

## Usage

### Docker Compose (Recommended)

Fill in required variables in `example.env`.
Then, rename the file to `.env` for it to be used.

Make sure Docker and Docker Compose are both installed.
In the project directory, run the project with:

```bash
docker compose up
```

### Node.js

Use Node.js v24.12 LTS or greater.

Note that MongoDB must be set up separately.
Make sure to configure the `MONGODB_URI` environment variable, as the
default is meant for use with Docker Compose.

The steps to run the client and server are the same:
1. `cd` into the appropriate directory
2. Copy the `.env` file into the directory
3. Run `npm install` to install dependencies
4. Run `npm start` to run the program

### Deploy to AWS

**A public test instance is available at https://simplesignin.ddns.net/.**
