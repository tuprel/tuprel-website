import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Box, Braces, CodeXml, Database, FileCode2, FileText, GitBranch, Home, Info, Layers3, List, Rocket, Tag, Terminal } from "lucide-react";
import type { Element } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { type DocPage, docHref, docs, examples, groups, sourceCommit } from "@/lib/content";
import { CodeBlock } from "./code-block";
import { PrimaryLink, repository } from "./site-shell";
import { SearchTrigger } from "./site-controls";

const overviewHeadings = [
  { id: "what-is-tuprel", label: "What is Tuprel?", depth: 2 },
  { id: "core-capabilities", label: "Core capabilities", depth: 2 },
  { id: "get-started", label: "Get started in 3 steps", depth: 2 },
  { id: "compatibility", label: "Works with your stack", depth: 2 },
];

const icons: Record<string, typeof BookOpen> = {
  overview: Home, quickstart: Rocket, installation: Box, "first-project": FileCode2,
  schema: Layers3, "code-generation": Braces, "java-client": CodeXml, queries: Database,
  relations: GitBranch, transactions: Braces, migrations: Layers3, cli: Terminal,
  "java-api": CodeXml, configuration: FileText, diagnostics: Info, architecture: Layers3,
  roadmap: GitBranch, changelog: Tag,
};

function DocsNavigation({ current }: { current: string }) {
  return <nav aria-label="Documentation">
    {groups.map(({ label, pages }) => <div key={label}>
      <p className="nav-group">{label}</p>
      <ul>{pages.map(({ slug, title }) => {
        const Icon = icons[slug] ?? FileText;
        return <li key={slug}><Link href={docHref(slug)} aria-current={current === slug ? "page" : undefined}><Icon size={14} aria-hidden="true" />{title}</Link></li>;
      })}</ul>
    </div>)}
  </nav>;
}

function DocOverview() {
  return <>
    <section className="doc-hero" id="what-is-tuprel">
      <div><p className="eyebrow">DOCUMENTATION</p><h1>Tuprel <em>Documentation</em></h1>
        <p className="lead">Define a schema, generate a typed Java client and query PostgreSQL with your application’s JDBC DataSource.</p>
        <div className="actions"><PrimaryLink href="/docs/quickstart/">Get started</PrimaryLink><Link className="button secondary" href="/docs/installation/">Installation</Link></div>
      </div>
      <CodeBlock code={examples.quickstart} language="bash" filename="Tuprel CLI · Quickstart" caption="Source-built launcher on PATH" />
    </section>
    <section className="doc-pillars" id="core-capabilities" aria-labelledby="capabilities-heading">
      <h2 className="sr-only" id="capabilities-heading">Core capabilities</h2>
      {[
        { icon: Layers3, title: "Schema-first", text: "Define models, types and constraints." },
        { icon: CodeXml, title: "Typed Java", text: "Generate the client from your schema." },
        { icon: Database, title: "PostgreSQL", text: "Run queries with bound values." },
        { icon: Terminal, title: "CLI workflows", text: "Validate, generate and review changes." },
      ].map(({ icon: Icon, title, text }) => <div key={title}><Icon size={21} /><h3>{title}</h3><p>{text}</p></div>)}
    </section>
    <section className="doc-overview-section" id="get-started">
      <h2>Get started in 3 steps</h2><p>Build the launcher, define a schema and generate the Java sources.</p>
      <div className="doc-steps">{[
        ["Build the launcher", "Use JDK 21 and the repository’s Gradle wrapper.", ":tuprel-cli:installDist", "/docs/installation/"],
        ["Define your schema", "Start with the CLI template and validate the models.", "tuprel/schema.tuprel", "/docs/schema/"],
        ["Generate the client", "Generate Java sources in the consumer project.", "tuprel generate", "/docs/code-generation/"],
      ].map(([title, text, command, href], i) => <Link key={title} href={href}><h3><span className="step-number">{i + 1}</span>{title}</h3><p>{text}</p><code>{command}</code></Link>)}</div>
    </section>
    <aside className="doc-note" id="compatibility"><Info size={21} /><div><h2>Works with your stack</h2><p>Java 21, PostgreSQL and a JDBC DataSource you configure. The <Link href="/docs/first-project/">Gradle playground</Link> builds and runs from source.</p></div></aside>
  </>;
}

function renderedDocument(page: DocPage) {
  if (!page.tree) return null;
  return toJsxRuntime(page.tree, {
    Fragment, jsx, jsxs, passNode: true,
    components: {
      a: ({ href, children, id, title }) => href?.startsWith("/")
        ? <Link href={href} id={id} title={title}>{children}</Link>
        : <a href={href} id={id} title={title}>{children}</a>,
      pre: ({ node, children }) => {
        const code = (node as Element | undefined)?.children[0];
        if (code?.type !== "element" || code.tagName !== "code") return <pre>{children}</pre>;
        const classNames = code.properties.className;
        const language = Array.isArray(classNames) ? classNames.find((entry) => typeof entry === "string" && entry.startsWith("language-")) : undefined;
        const value = code.children.map((child) => child.type === "text" ? child.value : "").join("").replace(/\n$/, "");
        return <CodeBlock language={typeof language === "string" ? language.slice(9) : "text"} code={value} />;
      },
      table: ({ children }) => <div className="table-scroll" role="region" aria-label="Documentation table" tabIndex={0}><table>{children}</table></div>,
    },
  });
}

function TocList({ headings }: { headings: DocPage["headings"] }) {
  return <ul>{headings.map(({ id, label, depth }) =>
    <li className={depth === 3 ? "nested" : undefined} key={id}><a href={"#" + encodeURIComponent(id)}>{label}</a></li>
  )}</ul>;
}

export function DocsPage({ page }: { page: DocPage }) {
  const overview = page.slug === "overview";
  const position = docs.indexOf(page);
  const previous = docs[position - 1];
  const next = docs[position + 1];
  const headings = overview ? overviewHeadings : page.headings;
  return <div className="docs-shell">
    <aside className="doc-sidebar">
      <Link className="doc-nav-title" href="/docs/"><BookOpen size={19} />Documentation</Link>
      <p>Guides and references for Tuprel.</p>
      <SearchTrigger sidebar />
      <DocsNavigation current={page.slug} />
    </aside>
    <details key={page.slug} className="doc-mobile"><summary>Browse documentation</summary><DocsNavigation current={page.slug} /></details>
    <main id="content" className="doc-main"><article>
      <nav className="doc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/" aria-label="Home"><Home size={15} /></Link><span aria-hidden="true">/</span>
        {overview ? <span aria-current="page">Documentation</span> : <><Link href="/docs/">Documentation</Link><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></>}
      </nav>
      {overview ? <DocOverview /> : <>
        <p className="eyebrow">{page.group.toUpperCase()}</p>
        <h1>{page.title}</h1><p className="lead">{page.description}</p>
        {!!headings.length && <details className="doc-mobile-toc doc-toc"><summary>On this page</summary><TocList headings={headings} /></details>}
        <div className="doc-document">{renderedDocument(page)}</div>
      </>}
      <nav className="doc-pagination" aria-label="Previous and next documents">
        {previous && <Link href={docHref(previous.slug)}><ArrowLeft size={17} /><span><small>Previous</small>{previous.title}</span></Link>}
        {next && <Link className="next" href={docHref(next.slug)}><span><small>Next</small>{next.title}</span><ArrowRight size={17} /></Link>}
      </nav>
    </article></main>
    <aside className="doc-aside">
      {!!headings.length && <nav className="doc-toc" aria-label="On this page"><p className="aside-title"><List size={17} />On this page</p><TocList headings={headings} /></nav>}
      <div className="aside-cta"><CodeXml size={23} /><h2>Try Tuprel</h2><p>Build the CLI and generate your first client.</p><PrimaryLink href="/docs/quickstart/">Get started</PrimaryLink></div>
      <div className="aside-source"><span className="aside-title"><Tag size={16} />Source revision</span><p>Development Preview · <span className="mono">{sourceCommit.slice(0, 8)}</span></p>
        <a className="text-link" href={page.sourceUrl ?? repository + "/tree/" + sourceCommit}>{page.sourceUrl ? "View original on GitHub" : "Browse source"}<ArrowRight size={14} /></a>
      </div>
      <div className="aside-source aside-links"><span className="aside-title"><BookOpen size={16} />Related resources</span>
        <Link className="text-link" href="/examples/">Examples<ArrowRight size={14} /></Link>
        <Link className="text-link" href="/docs/roadmap/">Roadmap<ArrowRight size={14} /></Link>
        <a className="text-link" href={repository}>GitHub<ArrowRight size={14} /></a>
      </div>
    </aside>
  </div>;
}
