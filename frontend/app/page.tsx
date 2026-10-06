import { redirect } from 'next/navigation';

// Rendered on request so the redirect is a real HTTP redirect (not a client-side one).
export const dynamic = 'force-dynamic';

/** "/" has no content of its own — it opens the first page. */
export default function Index() {
  redirect('/home');
}
