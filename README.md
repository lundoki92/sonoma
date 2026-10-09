# Sonoma 🎵

Sonoma is a collaborative playlist application built with React, Express, and PostgreSQL.

## Prerequisites

Make sure you have the following tools installed:

* [Node.js](https://nodejs.org/) (LTS version recommended)
* npm (included with Node.js)
* [Docker Engine](https://docs.docker.com/engine/install/) and Docker Compose
* Git

## Project Structure

```text
sonoma/
├── frontend/                  # React application
├── backend/
│   ├── db/
│   │   └── migration_up.sql   # Database schema
│   ├── server/
│   │   └── index.js           # Express entry point
│   ├── db.js                  # PostgreSQL connection pool
│   ├── docker-compose.yml     # PostgreSQL container configuration
│   ├── .env                   # Local environment variables
│   └── package.json
└── README.md
```

Adjust the paths if your project structure differs.

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

Replace `<repository-url>` with the repository URL and `<project-directory>` with the cloned directory name.

## 2. Configure Environment Variables

Navigate to the backend directory:

```bash
cd backend
```

Create a `.env` file based on the following example:

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5433
DB_USER=sonoma_user
DB_PASSWORD=your_local_password
DB_DATABASE=sonoma

# Express server
PORT=3000
```

Choose your own local database username and password.

Make sure these values match the variables referenced in `docker-compose.yml`.

**Security:** Never commit your `.env` file or real credentials. Add `.env` to `.gitignore` and provide a `.env.example` file with placeholder values for other contributors.

## 3. Install Backend Dependencies

From the `backend/` directory:

```bash
npm install
```

## 4. Start PostgreSQL

Make sure you are in the `backend/` directory, where `docker-compose.yml` and `.env` are located.

Start the PostgreSQL container:

```bash
docker compose up -d
```

On Linux, if your user does not have permission to access Docker, use:

```bash
sudo docker compose up -d
```

Check the container status:

```bash
sudo docker compose ps
```

View the PostgreSQL logs if needed:

```bash
sudo docker compose logs postgres
```

PostgreSQL should be accessible on port `5433` on your local machine.

## 5. Initialize the Database

The database schema is defined in `db/migration_up.sql`.

From the `backend/` directory, run:

```bash
sudo docker compose exec -T postgres psql -U sonoma_user -d sonoma < db/migration_up.sql
```

Replace `sonoma_user` with the value of `DB_USER` in your `.env` file.

This migration creates the following tables:

* **`users`** — stores user accounts, usernames, email addresses, and password fields.
* **`playlists`** — stores playlists, creation timestamps, hosts, and streaming services.

The `playlists.host_id` column references `users.id`.

To verify that the tables were created:

```bash
sudo docker compose exec postgres psql -U sonoma_user -d sonoma -c '\dt'
```

If the tables already exist, the migration may have been executed previously. Inspect the schema before running it again.

## 6. Seed the Database with Sample Data

The `db/seed.sql` file contains sample data for local development and testing.

After initializing the database schema, run the following command from the `backend/` directory:

```bash
sudo docker compose exec -T postgres \
  psql -U sonoma_user -d sonoma < db/seed.sql
```

Replace `sonoma_user` with the value of `DB_USER` in your `.env` file.

The seed file inserts sample users and playlists into the database. These records can be used to test the application's features without manually creating data.

### Verify the Sample Data

To list all users:

```bash
sudo docker compose exec postgres \
  psql -U sonoma_user -d sonoma \
  -c "SELECT id, username, email FROM users;"
```

To list playlists and their hosts:

```bash
sudo docker compose exec postgres \
  psql -U sonoma_user -d sonoma \
  -c "SELECT playlists.name, users.username, playlists.streaming_service
      FROM playlists
      JOIN users ON playlists.host_id = users.id;"
```

**Important:** The seed script is not executed automatically when the Docker container starts. Run it manually after initializing the database.

The current seed script is intended for a fresh database. Running it multiple times may cause duplicate username or email errors because these fields must be unique.

Use sample data only for local development and testing. Never use real user passwords or sensitive personal information in seed files.

## 7. Start the Backend

From the `backend/` directory, start the development server:

```bash
npm run dev
```

The development script uses Nodemon to restart the server when files change.

To start the server without Nodemon, use:

```bash
npm start
```

The backend reads the PostgreSQL connection settings from `.env`.

## 8. Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

These commands assume the frontend uses a development server such as Vite. Check `frontend/package.json` if the project uses different scripts.

Open the local URL displayed in the terminal.

Make sure the frontend is configured to send API requests to the local Express server.

## Useful Commands

Run these commands from the `backend/` directory.

### Stop PostgreSQL

```bash
sudo docker compose down
```

This stops and removes the containers but preserves the named database volume.

### Restart PostgreSQL

```bash
sudo docker compose restart postgres
```

### Follow PostgreSQL Logs

```bash
sudo docker compose logs -f postgres
```

### Connect to PostgreSQL

```bash
sudo docker compose exec postgres psql -U sonoma_user -d sonoma
```

Inside the PostgreSQL shell:

* `\dt` lists the tables.
* `\d users` displays the structure of the `users` table.
* `\d playlists` displays the structure of the `playlists` table.
* `\q` exits the shell.

## Troubleshooting

### Docker Permission Denied

If Docker reports a permission error on Linux, try prefixing Docker commands with `sudo`.

### Environment Variables Are Missing

Make sure `.env` is located next to `docker-compose.yml` and run Docker Compose from the `backend/` directory.

### PostgreSQL Is Not Running

Check the container status and logs:

```bash
sudo docker compose ps -a
sudo docker compose logs postgres
```

### The Backend Cannot Connect to PostgreSQL

If Express runs directly on your machine, check that:

* `DB_HOST` is set to `localhost`.
* `DB_PORT` is set to `5433`.
* The username, password, and database name match your PostgreSQL configuration.
* The PostgreSQL container is running.

If Express runs inside Docker, use the PostgreSQL service name as the host and the internal PostgreSQL port (`5432`).

### Database Tables Already Exist

The migration creates tables that may already exist. Check the schema with `\dt` before running the migration again.

## Notes for Contributors

* Never commit `.env` files or real credentials.
* Keep database migrations in version control.
* Coordinate schema changes with the rest of the team.
* Hash passwords before storing them in the database.
* Avoid deleting Docker volumes unless you intend to remove the stored database data.

Happy coding! 🎶
