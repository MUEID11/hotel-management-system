import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_60%)]" />
      <p className="relative font-serif text-7xl font-bold text-amber-400 sm:text-9xl">404</p>
      <h1 className="relative mt-4 font-serif text-2xl font-semibold text-white sm:text-3xl">
        This page checked out already
      </h1>
      <p className="relative mt-3 max-w-md text-sm text-slate-400">
        The page you are looking for does not exist or has been moved. Head back to the front desk.
      </p>
      <div className="relative mt-8">
        <Link to="/">
          <Button variant="dark" size="lg">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}