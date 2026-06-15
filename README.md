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

| **Category** | **Technology** | **Purpose** |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 | Full-stack web development and building the application interface |
| **Language** | TypeScript | Type-safe development and improved code maintainability |
| **Authentication** | NextAuth v5 + Firebase Credentials | Secure user authentication and session management |
| **Backend / Database** | Firebase (Authentication + Firestore) | User management, data storage, and application backend services |
| **External APIs** | Google Books API, Open Library API, Hardcover API | Fetching book information and improving recommendation data |

## Getting started

### Prerequisites

- Node.js 18+
- A Firebase project (Auth + Firestore enabled)
- Optional: Google Books API key, Hardcover API token

## Project structure

```
app/           Next.js routes and API handlers
components/    UI components
context/       React context (auth, books, collection, quest, XP)
lib/           Book APIs, Firebase, quiz logic, gamification
public/        Static assets (logo, header image)
```

## License

Private project.
