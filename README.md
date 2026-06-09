# BookMatch

A cozy reading discovery app that matches you with books based on your reader type. Take a short quiz, unlock personalized recommendations, save books to your collection, and complete a 10-book reading quest with reviews and XP.

**Live site:** [https://bookmatch2you.vercel.app/](https://bookmatch2you.vercel.app/)

## Features

- **Reader quiz** — discover your reader type and get personalized book picks
- **Live book matching** — recommendations from Google Books, Open Library, and Hardcover
- **Explore & search** — search by title, author, and genre filters
- **My Collection** — save books, look up prices, write reviews
- **Reading Quest** — read 10 books, write reviews, earn badges and XP
- **Auth** — sign up / sign in with Firebase + NextAuth

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [NextAuth v5](https://authjs.dev/) with Firebase credentials
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- Google Books, Open Library, and Hardcover APIs for book data

## Getting started

### Prerequisites

- Node.js 18+
- A Firebase project (Auth + Firestore enabled)
- Optional: Google Books API key, Hardcover API token

### Install

```bash
git clone https://github.com/waengs/bookmatch2.git
cd bookmatch2
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Session secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes | App URL (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase web app config |
| `FIREBASE_PROJECT_ID` | Yes | Firebase Admin service account |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase Admin service account |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase Admin private key |
| `GOOGLE_BOOKS_API_KEY` | No | Higher Google Books rate limits |
| `HARDCOVER_API_TOKEN` | No | Hardcover search enrichment |

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push this repo to GitHub
2. Import or connect the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in **Project Settings → Environment Variables**
4. Set `AUTH_URL` to your production URL (e.g. `https://your-app.vercel.app`)
5. Add your Vercel domain to **Firebase → Authentication → Authorized domains**
6. Deploy — Vercel builds on every push to `main`

To redeploy manually: **Deployments → ⋯ → Redeploy**.

## Project structure

```
app/           Next.js routes and API handlers
components/    UI components
context/       React context (auth, books, collection, quest, XP)
lib/           Book APIs, Firebase, quiz logic, gamification
public/        Static assets (logo, header image)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

## License

Private project.
