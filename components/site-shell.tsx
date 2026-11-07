import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { HeaderActions } from "./site-controls";

export const repository = "https://github.com/tuprel/tuprel";

export function Wordmark() {
  return <Link className="wordmark" href="/" aria-label="Tuprel home">
    <svg viewBox="0 0 36 36" width="31" height="31" aria-hidden="true">
      <rect width="36" height="36" rx="8" fill="currentColor"/>
      <path d="M7 9h22v6h-8v8h-6v-8H7zm5 17h12v3H12z" fill="var(--logo-cutout)"/>
    </svg>
    <span>TUPREL<span className="wordmark-dot">.</span></span>
  </Link>;
}

export function Header() {
  return <header className="site-header">
    <div className="header-inner">
      <Wordmark />
      <HeaderActions />
    </div>
  </header>;
}

const footer = [
  ["Documentation", ["Quickstart", "/docs/quickstart/"], ["Installation", "/docs/installation/"], ["CLI reference", "/docs/cli/"], ["Java API", "/docs/java-api/"]],
  ["Project", ["Examples", "/examples/"], ["Roadmap", "/docs/roadmap/"], ["Changelog", "/docs/changelog/"], ["Architecture", "/docs/architecture/"]],
  ["Community", ["GitHub", repository], ["Issues", repository + "/issues"], ["Contributing", "/docs/contributing/"], ["Security", "/docs/security/"]],
] as const;

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Wordmark /><p>Typed PostgreSQL access for Java.<br />Schema-first and open source.</p></div>
      {footer.map(([title, ...links]) => <div key={title}>
        <h2>{title}</h2>
        {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
      </div>)}
    </div>
    <div className="container footer-bottom"><span>Open source under Apache 2.0</span><span>Development Preview <span className="status-dot" /></span></div>
  </footer>;
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="button primary" href={href}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}

export function GitHubLink() {
  return <a className="button secondary" href={repository}><Github size={17} aria-hidden="true" />GitHub</a>;
}
