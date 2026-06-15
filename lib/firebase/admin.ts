import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App;
let adminAuth: Auth;
let db: Firestore;

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

function getAdminApp(): App {
  if (app) return app;

  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as Record<string, string>;
      if (parsed.private_key) {
        parsed.private_key = parsePrivateKey(parsed.private_key) ?? parsed.private_key;
      }
      app = initializeApp({ credential: cert(parsed) });
      return app;
    } catch (err) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return app;
  }

  throw new Error(
    'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
  );
}

export function getAdminAuth(): Auth {
  if (!adminAuth) adminAuth = getAuth(getAdminApp());
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!db) db = getFirestore(getAdminApp());
  return db;
}
