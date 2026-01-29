import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-black text-primary tracking-tight cursor-pointer" data-testid="brand-logo">
            UNTANGLE
          </h1>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 shadow-lg shadow-primary/20" />
      </div>
    </header>
  );
}
