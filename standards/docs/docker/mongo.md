# Docker

## `docker-compose.yml`

```yml
services:
  mongo:
    image: mongo:latest
    container_name: gannar-admin
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${DB_ADMIN_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${DB_PWD}
      MONGO_INITDB_DATABASE: ${DB_NAME}
      DEV1_USERNAME: ${DB_DEV1_USER}
      DEV2_USERNAME: ${DB_DEV2_USER}
    ports:
      - ${DB_LOCAL_PORT}:${DB_PORT}
    volumes:
      - ./init.db:/docker-entrypoint-initdb.d
      - ./data:/data/db
      - ./logs:/var/log/mongodb
```

## Environment Variables

Mongo docker uses special environment variables to initialize the container:

- `MONGO_INITDB_ROOT_USERNAME` - `root` user in the admin database; has root permissions on all databases
- `MONGO_INITDB_ROOT_PASSWORD` - password for `root` user
- `MONGO_INITDB_DATABASE` - custom database to create

The rest of the environment variables are declared depending on your needs - e.g.: the following are environment variables used to declare other users:

- `DEV1_USERNAME`
- `DEV2_USERNAME`

In any case, the values for the container's environment variables are taken from a `.env` file declared in the same folder as the `docker-compose.yml` file:

```bash
COMPOSE_PROJECT_NAME="gannar-back-admin"
DB_ADMIN_USER="admin"
DB_PWD="pass"
DB_NAME="gannar-admin"
DB_DEV1_USER="dev1"
DB_DEV2_USER="dev2"
DB_LOCAL_PORT="27017"
DB_PORT="27017"
```

## Volumes

- `./init.db:/docker-entrypoint-initdb.d`

  Scripts in the local `./init.db` folder are mapped to the container's `./init.db:/docker-entrypoint-initdb.d` and executed on initialization in alphabetical order. e.g.:

  ```js
  db.createUser({
    user: process.env.DEV1_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
      {
        role: "readWrite",
        db: process.env.MONGO_INITDB_DATABASE,
      },
    ],
  });

  db.createUser({
    user: process.env.DEV2_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
      {
        role: "readWrite",
        db: process.env.MONGO_INITDB_DATABASE,
      },
    ],
  });
  ```

  The script above creates extra users on initialization with only `read/write` permissions on the project's database; you can read environment variables from the same `.env` file.

- `./data:/data/db`

  Maps mongo's database files to the local `./data` folder. This is where data is persisted between container tear-down / build. If you want a clean database with only the result from your initialization scripts, remove this `./data` folder before your next container build.
