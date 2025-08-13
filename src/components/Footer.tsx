import Link from "next/link";
import { siteConfig } from "@/config/site";
import { GithubIcon, TwitterIcon } from "@/components/icons/SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-theme-background mt-16 border-t border-theme-border text-theme-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-theme-1 mb-4">リンク</h3>
            <ul className="space-y-2">
              {siteConfig.footer.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-theme-3 hover:text-theme-1 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-1 mb-4">
              お問い合わせ
            </h3>
            <p className="text-theme-3">
              ご質問やご意見がございましたら、お気軽にお声がけください。
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div className="flex">
            <a
              href="https://github.com/kk2a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10"
              title="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/Jupsatellite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10"
              title="Twitter"
            >
              <TwitterIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="border-t border-theme-border mt-1 pt-8">
          <p className="text-center text-theme-3">
            {siteConfig.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
