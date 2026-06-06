<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:database-setup -->
# Database (PostgreSQL 17)

PostgreSQL runs locally (extracted from `.deb` files — no Docker or system package needed).

## Start PostgreSQL
```bash
scripts/start-db.sh
```

## Stop PostgreSQL
```bash
/tmp/postgres-install/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/pgdata stop
```

## Verify status
```bash
/tmp/postgres-install/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/pgdata status
```

## Database credentials (in .env.local)
- Host: `127.0.0.1:5432`
- User: `postgres`
- Password: `postgres`
- Database: `ecommers`
- DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:5432/ecommers?schema=public`

## Prisma commands
```bash
npx prisma validate          # Validate schema
npx prisma generate          # Generate client
npx prisma migrate dev       # Apply migrations
npx prisma studio            # Open DB browser
```

## Run the app
```bash
npm run dev
```
<!-- END:database-setup -->
