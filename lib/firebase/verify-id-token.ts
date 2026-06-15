export interface VerifiedFirebaseUser {
  uid: string;
  email: string | null;
  name: string | null;
}

/** Verify a Firebase ID token without firebase-admin (avoids jwks-rsa/jose on Vercel). */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = (await res.json().catch(() => ({}))) as {
    users?: Array<{ localId?: string; email?: string; displayName?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Token verification failed (${res.status})`);
  }

  const user = data.users?.[0];
  if (!user?.localId) {
    throw new Error('Invalid token response');
  }

  return {
    uid: user.localId,
    email: user.email ?? null,
    name: user.displayName ?? null,
  };
}
