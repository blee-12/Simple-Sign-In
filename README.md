# Simple Sign In

Simple Sign In is a web app designed to streamline event attendance management.

## Usage

### Docker Compose (Recommended)

Fill in required variables in `example.env`.
Then, rename the file to `.env` for it to be used.

Make sure Docker and Docker Compose are both installed.
In the project directory, run the project with:

```bash
docker compose up -d
```

To seed the database, while the app is running, run:

```bash
docker compose exec server npm run seed
```

To stop the app:

```bash
docker compose down
```

The app can be accessed at the URL in the `CLIENT_URL` variable. By default it is http://127.0.0.1:5173.

### Node.js

Use Node.js v24.12 LTS or greater.

Note that MongoDB must be set up separately.
Make sure to configure the `MONGODB_URI` environment variable, as the
default is meant for use with Docker Compose.

The steps to run the client and server are the same:
1. `cd` into the appropriate directory
2. Copy the `.env` file into the directory
3. Run `npm install` to install dependencies
4. Run `npm run seed` in the **server** directory to populate the DB
4. Run `npm start` to run the program

The app can be accessed at the URL in the `CLIENT_URL` variable. By default it is http://127.0.0.1:5173.

### Deploy to AWS

**A public test instance is available at https://simplesignin.ddns.net/.**


## Testing features
If you would like to test some of the app features locally with node, run the server with a seeded database, and connect to a client with one of the 3 accounts (passwords are all Testpass123! & usernames are: blee12@stevens.edu, pvanguru@stevens.edu, bwoods@stevens.edu). Log into one of them and you should be able to see an active event on your dashboard. Log in as the owner on a another (2nd) client in a **separate window** and view the event to display the join code. The first client should be able to use this 4-digit code to join the event!
