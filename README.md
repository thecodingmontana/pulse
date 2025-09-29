# Pulse

Pulse is a powerful, full-stack monitoring and management dashboard for Node.js applications running on PM2. Built with TanStack Start, Drizzle ORM, and PostgreSQL, it provides real-time insights into server health and process performance on your server. Designed for reliability and scalability, Pulse ensures optimal performance for applications like e-commerce platforms with features for monitoring, control, and alerting.

## Features

- **Real-Time Monitoring**: Tracks CPU, RAM, disk, and network usage with live updates and historical trends via Chart visualizations.
- **Process Management**: Monitors PM2 processes with status, resource usage, and controls for starting, stopping, or restarting applications.
- **Logs Access**: Offers instant access to recent and real-time logs (stdout/stderr) for each process via Server-Sent Events (SSE).
- **Metrics Aggregation**: Provides average, maximum, and minimum stats for resources over customizable time ranges (1h, 6h, 24h).
- **Email Alerts**: Sends automated notifications via Nodemailer for critical events, such as high CPU/RAM usage or stopped processes.
- **Data Persistence**: Stores metrics and logs in PostgreSQL with Drizzle ORM for efficient querying and long-term analysis.

## Prerequisites

- **Node.js**: v18+ (check with `node -v`).
- **PM2**: Globally installed (`npm install -g pm2`).
- **PostgreSQL**: Installed and running on your server (or a managed service).
- **SMTP Service**: Configured for email alerts (e.g., Gmail with app password).

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/thecodingmontana/pulse.git
   cd pulse
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgresql://user_name:your_secure_password@localhost:5432/pulsedb
   RESEND_API_KEY=api_key
   ALERT_THRESHOLD_CPU=80
   ALERT_THRESHOLD_RAM=90
   ```

4. **Set Up PostgreSQL**:
   - Install PostgreSQL: `sudo apt-get install postgresql postgresql-contrib`.
   - Create database: `sudo -u postgres createdb pulsedb`.
   - Create user: `sudo -u postgres psql -c "CREATE USER user_name WITH PASSWORD 'your_secure_password'; GRANT ALL PRIVILEGES ON DATABASE pm2_dashboard TO thecodingmontana;"`.
   - Verify: `psql -U user_name -d pulsedb`.

5. **Apply Database Migrations**:

   ```bash
   npx drizzle-kit push:pg
   ```

6. **Start the Application**:
   - Development: `npm run dev` (runs on `http://localhost:3000`).
   - Production: `npm run build && pm2 start npm --name "pulse" -- run start`.

## Usage

- Access the dashboard at `http://<your-server-ip>:3000/dashboard`.
- Monitor real-time resources, view historical charts, and control PM2 processes.
- Select time ranges (1h, 6h, 24h) for aggregated metrics (avg/max/min).
- View logs (recent or real-time) for each process via the "View Logs" button.
- Receive email alerts for critical events (e.g., high CPU or stopped processes).

## Project Structure

- `app/server/db/`: Drizzle ORM schema and client for PostgreSQL.
- `app/server/pm2.server.ts`: Server functions for PM2, resources, logs, and aggregates.
- `app/server/alerts.server.ts`: Nodemailer setup for email alerts.
- `app/routes/dashboard.tsx`: Main dashboard UI with charts and controls.
- `app/routes/api/logs.$processName.ts`: SSE route for real-time logs.
- `nitro.config.ts`: Background tasks for metrics collection and alerts.
- `migrations/`: Drizzle migrations for PostgreSQL schema.

## Troubleshooting

- **DB Connection Issues**: Verify `DATABASE_URL` and PostgreSQL service (`sudo systemctl status postgresql`).
- **PM2 Permissions**: Ensure `thecodingmontana` can access `~/.pm2/logs/` and PM2 socket.
- **Email Alerts**: Check Nodemailer logs for SMTP errors (e.g., invalid app password).
- **Empty Aggregates**: Allow a few minutes for metrics to accumulate in the `metrics` table.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for bugs, features, or improvements.

## License

MIT License
