import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Footer, PrimaryLink } from "@/components/site-shell";
import { examples } from "@/lib/content";

export const metadata: Metadata = {
  title: "Examples",
  description: "Explore the runnable Tuprel playground, a generated Java client and SQL preview.",
  alternates: { canonical: "/examples/" },
};

export default function Examples() {
  return <><main id="content" className="container section examples-page">
    <p className="eyebrow">EXAMPLES / PRODUCT CATALOG</p><h1>From schema to query.</h1>
    <p className="lead">The Tuprel playground is a standalone Gradle consumer with products, orders and customers. Its Java client is generated from the source checkout.</p>
    <div className="actions"><PrimaryLink href="/docs/first-project/">Run the playground</PrimaryLink><Link className="button secondary" href="/docs/installation/">Build the CLI</Link></div>
    <section className="split example-feature"><div><p className="eyebrow">01 / SCHEMA</p><h2>Define a product model.</h2><p className="section-lead">The stock and price fields drive typed filters and ordering. The version field supports optimistic locking.</p><Link className="text-link" href="/docs/schema/">Read the schema guide<ArrowRight size={15} /></Link></div>
      <CodeBlock code={examples.schema} filename="schema.tuprel · excerpt" language="tuprel" /></section>
    <section className="split example-feature"><div><p className="eyebrow">02 / GENERATED JAVA</p><h2>Find in-stock products.</h2><p className="section-lead">Filter by stock and name, then order by price with ID as a tie-breaker.</p><Link className="text-link" href="/docs/queries/">Read the query guide<ArrowRight size={15} /></Link></div>
      <CodeBlock code={examples.query} filename="Product catalog · Java" language="java" /></section>
    <section className="split example-feature"><div><p className="eyebrow">03 / SQL PREVIEW</p><h2>Inspect the generated SELECT.</h2><p className="section-lead">Preview renders the root query without executing it. Read the SQL text separately from its parameter values.</p><Link className="text-link" href="/docs/queries/#inspect-sql">Read about SQL preview<ArrowRight size={15} /></Link></div>
      <CodeBlock code={examples.preview} filename="SQL preview · Java" language="java" /></section>
  </main><Footer /></>;
}
