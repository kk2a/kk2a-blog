import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Header() {
  return (
    <header className="bg-white bg-theme-background shadow-sm border-b border-gray-200 border-theme-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 text-theme-foreground"
            >
              {siteConfig.name}
            </Link>
          </div>
          <nav className="flex items-center space-x-8">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 text-theme-muted-foreground hover:text-gray-900 hover:text-theme-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
