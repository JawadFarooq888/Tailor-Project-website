import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-5xl text-gold">404</p>
      <p className="mt-2 text-ink/80">Page not found.</p>
      <Link to="/" className="mt-6 inline-block text-burgundy hover:underline">
        Back to home
      </Link>
    </div>
  );
}
