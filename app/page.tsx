import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Braces, CircleCheck, CodeXml, Database, FileCode2, GitPullRequest, Layers3, Scale, SearchCode, Terminal } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Footer, GitHubLink, PrimaryLink } from "@/components/site-shell";
import { examples } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const capabilities = [
  { icon: Database, title: "Types from your schema", copy: "Generate Java models, inputs, filters and ordering from schema.tuprel.", href: "/docs/code-generation/", action: "Explore code generation" },
  { icon: CodeXml, title: "Explicit queries", copy: "Compose typed filters and projections. Choose the relations to load and where transactions start.", href: "/docs/queries/", action: "Explore queries" },
  { icon: SearchCode, title: "SQL you can inspect", copy: "Render a SELECT before it runs. The SQL text and bound values are available separately.", href: "/docs/queries/#inspect-sql", action: "See SQL preview" },
  { icon: Layers3, title: "Your application’s DataSource", copy: "Use your own JDBC connection pool and keep its lifecycle in the application.", href: "/docs/java-client/", action: "Use the Java client" },
];
const steps = [
  ["Model", "Describe models and relationships in schema.tuprel."],
  ["Generate", "Validate the schema and generate the Java sources."],
  ["Connect", "Construct the generated client with a JDBC DataSource."],
  ["Query", "Use the typed client against matching PostgreSQL tables."],
];
const resources = [
  { icon: BookOpen, title: "Quickstart", copy: "Generate your first client offline.", href: "/docs/quickstart/" },
  { icon: CodeXml, title: "Query guide", copy: "Filter, order and page through rows.", href: "/docs/queries/" },
  { icon: Layers3, title: "Migrations", copy: "Draft, review and apply changes.", href: "/docs/migrations/" },
  { icon: FileCode2, title: "Examples", copy: "Run the product catalog playground.", href: "/examples/" },
  { icon: Braces, title: "Java API", copy: "Find generated and runtime contracts.", href: "/docs/java-api/" },
];

export default function Home() {
  const heroQuery = examples.query
    .replace("new TuprelClient(PostgresqlDatabase", "new TuprelClient(\n        PostgresqlDatabase")
    .replace("price().asc(), ProductOrder.id()", "price().asc(),\n                ProductOrder.id()");
  return <>
    <main id="content">
      <section className="container hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">TYPE-SAFE POSTGRESQL FOR JAVA</p>
          <h1 id="hero-title">Define the schema.<br /><em>Own the query.</em></h1>
          <p className="lead">Generate a typed Java client from your schema, compose explicit queries, and inspect the SQL before it runs.</p>
          <div className="actions"><PrimaryLink href="/docs/quickstart/">Get started</PrimaryLink><Link href="/docs/" className="button secondary"><BookOpen size={17} />Documentation</Link></div>
        </div>
        <div className="hero-code"><CodeBlock code={heroQuery} filename="Product catalog · Java" language="java" lines caption="Generated client  /  JDBC DataSource" /></div>
      </section>
      <div className="container trust-strip" aria-label="Compatibility and status">
        <div><CodeXml /><span><strong>Java 21</strong><small>Generated, typed client</small></span></div>
        <div><Database /><span><strong>PostgreSQL</strong><small>JDBC and bound values</small></span></div>
        <div><Scale /><span><strong>Apache 2.0</strong><small>Open source</small></span></div>
        <div><GitPullRequest /><span><strong>Development Preview</strong><small>Available from source</small></span></div>
      </div>
      <section className="container section" id="capabilities">
        <p className="eyebrow">CORE CAPABILITIES</p>
        <h2>A data layer you can reason about.</h2>
        <p className="section-lead">The schema defines the shape of your Java API. Your application decides when to query, load relations and commit writes.</p>
        <div className="capabilities">{capabilities.map(({ icon: Icon, title, copy, href, action }) =>
          <Link className="feature-card" key={title} href={href}><span className="tile-icon"><Icon size={22} /></span>
            <h3>{title}</h3><p>{copy}</p><span className="text-link">{action}<ArrowRight size={15} /></span></Link>)}</div>
      </section>
      <section className="workflow-band" id="workflow">
        <div className="container section split">
          <div><p className="eyebrow">THE WORKFLOW</p><h2>From schema file<br />to working Java.</h2>
            <ol className="workflow-steps">{steps.map(([title, copy], i) => <li key={title}><span>{i + 1}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol>
            <Link className="button secondary" href="/docs/quickstart/">Read the quickstart<ArrowRight size={17} /></Link>
          </div>
          <CodeBlock code={examples.workflow} filename="Tuprel CLI · Offline workflow" language="bash" caption="Run with the source-built launcher on your PATH" />
        </div>
      </section>
      <section className="container section split migration-section" id="migrations">
        <div className="migration-code"><CodeBlock code={examples.migration} filename="Tuprel CLI · Migration review" language="bash" caption="Review SQL, risks and the approval digest" /></div>
        <div><p className="eyebrow">SCHEMA CHANGES</p><h2>Review database changes<br />before they run.</h2>
          <p className="section-lead">Preview existing migration files against the target schema. Deployment requires the digest of the reviewed plan.</p>
          <ul className="check-list"><li><CircleCheck />Inspect pending SQL and reported risks.</li><li><CircleCheck />Approve the reviewed plan for that target.</li><li><CircleCheck />Apply supported changes with migration history.</li></ul>
          <Link className="button secondary" href="/docs/migrations/">Explore migrations<ArrowRight size={17} /></Link>
        </div>
      </section>
      <section className="container section integration-section" id="integrations">
        <p className="eyebrow">INTEGRATIONS</p><h2>Work with your Java stack.</h2>
        <p className="section-lead">Start with the Java client and a JDBC DataSource. Follow the integration roadmap for distribution and framework support.</p>
        <div className="integration-grid">
          {[
            ["Java", "Available from source", "Typed client with an application-owned JDBC DataSource.", "/docs/java-client/"],
            ["Gradle", "Composite build", "The playground builds directly from the checkout. The plugin is planned.", "/docs/first-project/"],
            ["Maven", "Validated in staging", "Temporary repository fixtures verify library POMs and dependency scopes.", "/docs/roadmap/"],
            ["Spring Boot", "Planned", "The starter is tracked in the integrations roadmap.", "/docs/roadmap/"],
          ].map(([title, status, copy, href]) => <Link key={title} className="integration-item" href={href}><span className="pill">{status}</span><h3>{title}<ArrowRight size={15} /></h3><p>{copy}</p></Link>)}
        </div>
      </section>
      <section className="container section resource-section">
        <div className="section-heading"><div><p className="eyebrow">DOCUMENTATION & RESOURCES</p><h2>Go from reading to running.</h2><p className="section-lead">Guides and references drawn from the Tuprel source repository.</p></div><Link href="/docs/" className="text-link">All documentation<ArrowRight size={16} /></Link></div>
        <div className="resource-grid">{resources.map(({ icon: Icon, title, copy, href }) => <Link key={title} className="resource-card" href={href}><span className="tile-icon"><Icon size={19} /></span><h3>{title}</h3><p>{copy}</p><ArrowRight size={16} /></Link>)}</div>
      </section>
      <section className="final-cta">
        <div className="container"><div><p className="eyebrow"><Terminal size={16} /> BUILD FROM SOURCE</p><h2>Generate your first Java client.</h2><p>Start offline with Java 21 and the source-built CLI.</p></div><div className="actions"><PrimaryLink href="/docs/quickstart/">Get started</PrimaryLink><GitHubLink /></div></div>
      </section>
    </main>
    <Footer />
  </>;
}
