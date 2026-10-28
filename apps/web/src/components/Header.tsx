import Link from "next/link";
import { siteConfig } from "@/config/site";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 shrink-0 bg-theme-background shadow-sm border-b border-theme-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-2 py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-theme-1">
              {siteConfig.name}
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-theme-3 hover:text-theme-1 px-3 py-2 rounded-md text-sm font-medium text-transition"
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
