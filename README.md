## STK Technical Test Fullstack Web - Alfiansyah Cahyo Wicaksono

## About Project
This project explores how complex hierarchical data can be organized using a flexible tree structure. Users can create, nest, and reorder items dynamically, while maintaining clear parent–child relationships. The system provides dual views: a data grid for efficient editing and a tree view for better visualization of hierarchy. The goal is to demonstrate that even deeply nested structures remain manageable when CRUD operations, ordering, and relational consistency are handled cohesively end to end.

## Tech Stack
- Frontend: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, custom toast & state hooks
- Backend: NestJS 11, Prisma ORM, PostgreSQL, class-validator, Swagger docs
- Tooling: Docker Compose for orchestration, ESLint + Prettier for linting, Jest for backend tests

## Quick Start
Choose the setup path that fits your workflow.

### Option A: Manual Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/devwithfin/stk-technical-test-alfiansyah.git
   cd stk-technical-test-alfiansyah
   ```
2. **Open it in your editor** - VS Code, WebStorm, or any IDE pointed at the repo folder.
3. **Install dependencies per package**
   ```bash
   cd app
   npm install
   cd ../backend
   npm install
   ```
   Each package maintains its own `node_modules`, so run `npm install` in both `app/` and `backend/`.
4. **Copy `.env-example`** - For every package that ships `.env-example`, duplicate it to `.env` and adjust the values (especially `DATABASE_URL`).
   ```powershell
   Copy-Item .env-example .env -Force
   ```
5. **Create a PostgreSQL connection via your DB client** - DBeaver, TablePlus, etc.
   - Host: `localhost`
   - Port: `5432`
   - Database: `stk`
   - Username/Password: match your local credentials
6. **Run Prisma migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   ```
   Confirm the tables via your DB client.
7. **Start the apps**
   - Backend (NestJS + Swagger):
     ```bash
     cd backend
     npm run start:dev
     ```
   - Frontend (Vite dev server):
     ```bash
     cd app
     npm run dev
     ```
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api
   - Web: http://localhost:5173 (`VITE_API_URL` defaults to `http://localhost:3000`)

### Option B: Docker Setup
1. **Install Docker Desktop (or Docker Engine)** on your machine.
2. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/devwithfin/stk-technical-test-alfiansyah.git
   cd stk-technical-test-alfiansyah
   ```
3. **Build the containers**
   ```bash
   docker compose --build
   ```
4. **Start the stack**
   ```bash
   docker compose up
   ```
   This spins up the frontend, backend, and PostgreSQL services; migrations run automatically via `npx prisma migrate deploy` in the backend container.
5. **Access services**
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api
   - Web: http://localhost:5173
6. **Optional: connect to the Dockerized database** using your DB client with the same settings as manual setup but with `Port: 5433`. Credentials default to `postgres/postgres`, database `stk`.

Once either path is running, the UI will communicate with the API and database immediately.

---

## API Endpoints
```
GET    /api/menus
GET    /api/menus/:id
POST   /api/menus
PUT    /api/menus/:id
DELETE /api/menus/:id
PATCH  /api/menus/:id/move
PATCH  /api/menus/:id/reorder
```
