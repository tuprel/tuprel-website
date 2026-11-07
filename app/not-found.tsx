import { Footer, PrimaryLink } from "@/components/site-shell";

export default function NotFound() {
  return <><main id="content" className="container section not-found">
    <p className="eyebrow">404 / TUPREL</p><h1>Page not found</h1>
    <p className="section-lead">Find guides, references and examples in the documentation.</p>
    <PrimaryLink href="/docs/">Browse documentation</PrimaryLink>
  </main><Footer /></>;
}
