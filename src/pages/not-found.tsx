import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 text-2xl text-foreground">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be out of date, or the page was renamed.
        </p>
        <Link href="/">
          <span className="mt-6 inline-block text-sm text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground cursor-pointer transition-colors">
            Back to dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
