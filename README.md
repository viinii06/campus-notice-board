# 📌 Campus Notice Board

A small full-stack notice board. Students sign up or log in with a phone OTP sent through [Minimoth](https://minimoth.dev). Then they can pin notices to a shared board and remove their own.

- **Frontend:** React and Vite. Three pages: Board, Login and New Notice.
- **Backend:** Node.js and Express, with SQLite through Node's built-in `node:sqlite` module, so there's no database package to install.
- **Data:** three tables: `users`, `sessions` and `notices`.

## API

| Method | Endpoint                | Auth | Purpose                                       |
| ------ | ----------------------- | ---- | --------------------------------------------- |
| POST   | `/api/auth/request-otp` | –    | Send an OTP to `{ phone }`                    |
| POST   | `/api/auth/verify-otp`  | –    | Verify `{ phone, code, name? }` and get a token |
| GET    | `/api/notices`          | –    | List notices                                  |
| POST   | `/api/notices`          | ✔    | Create a notice from `{ title, body, category }` |
| DELETE | `/api/notices/:id`      | ✔    | Delete your own notice                        |

For authenticated requests, send the header `Authorization: Bearer <token>`. A new user's `name` is required the first time they verify, because that's when they register.

## Setup

You need **Node.js 22.13 or later**, plus a Minimoth API key from [app.minimoth.dev](https://app.minimoth.dev).

### 1. Backend

```bash
cd backend
cp .env.example .env      # then set MINIMOTH_API_KEY in .env
npm install
npm run dev               # http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173. The Vite dev server forwards `/api` requests to the backend, so the browser talks to a single origin and you don't need any CORS setup.

## Environment variables

**backend/.env**

| Variable            | Description                                |
| ------------------- | ------------------------------------------ |
| `MINIMOTH_API_KEY`  | Your Minimoth key. This is required.       |
| `MINIMOTH_BASE_URL` | Defaults to `https://api.minimoth.dev`     |
| `PORT`              | API port. Defaults to `4000`.              |
| `DB_FILE`           | SQLite file path. Defaults to `noticeboard.db`. |

**frontend/.env**

| Variable        | Description                                        |
| --------------- | -------------------------------------------------- |
| `VITE_APP_NAME` | The app title shown in the header and browser tab  |
| `API_URL`       | The backend URL the dev proxy forwards `/api` to   |

## Notes

- Enter phone numbers in international format, for example `+919876543210`.
- A sandbox key (`mm_test_...`) doesn't send a real SMS. Check the Minimoth dashboard for the test code.
