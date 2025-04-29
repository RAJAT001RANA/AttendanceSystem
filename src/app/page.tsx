import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users to the login page by default
  redirect('/login');
  // You can return null or an empty fragment, as the redirect will happen server-side.
  return null;
}
