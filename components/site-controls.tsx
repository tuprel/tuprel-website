"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Github, Menu, Moon, Search, Sun, X } from "lucide-react";
import { rankSearch, type SearchEntry } from "@/lib/search";

const links = [["Product", "/"], ["Documentation", "/docs/"], ["Examples", "/examples/"], ["Roadmap", "/docs/roadmap/"]] as const;

const searchEvent = "tuprel:open-search";

export function SearchTrigger({ sidebar = false }: { sidebar?: boolean }) {
  return <div className="search-trigger-wrap">
    <button type="button" className="search-trigger" aria-label={sidebar ? "Search docs from sidebar" : "Search documentation"}
      aria-keyshortcuts="Control+K Meta+K" onClick={() => window.dispatchEvent(new Event(searchEvent))}>
      <Search size={17} aria-hidden="true" /><span>{sidebar ? "Search docs" : "Search"}</span>
    </button>
    <kbd aria-hidden="true">⌘/Ctrl K</kbd>
  </div>;
}

export function HeaderActions() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const loading = useRef(false);
  const [index, setIndex] = useState<SearchEntry[]>();
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">();
  const current = (href: string) => href === "/docs/"
    ? pathname.startsWith("/docs") && !pathname.startsWith("/docs/roadmap")
    : pathname === href || (href !== "/" && pathname + "/" === href);

  useEffect(() => {
    function openSearch() {
      searchDialog.current?.showModal();
      searchInput.current?.focus();
    }
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", shortcut);
    window.addEventListener(searchEvent, openSearch);
    return () => {
      window.removeEventListener("keydown", shortcut);
      window.removeEventListener(searchEvent, openSearch);
    };
  }, []);

  async function loadSearch() {
    if (index || loading.current || !searchDialog.current?.open) return;
    loading.current = true;
    setFailed(false);
    try {
      const response = await fetch("/search-index.json");
      if (!response.ok) throw new Error("Search index unavailable");
      setIndex(await response.json());
    } catch {
      setFailed(true);
    } finally {
      loading.current = false;
    }
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("tuprel-theme", next); } catch { /* Theme applies for this visit. */ }
    setTheme(next);
  }

  const results = index && rankSearch(index, query);
  return <>
    <nav className="header-nav" aria-label="Main navigation">
      {links.map(([label, href]) => <Link href={href} key={label} aria-current={current(href) ? "page" : undefined}>{label}</Link>)}
    </nav>
    <div className="header-actions">
      <SearchTrigger />
      <button type="button" className="icon-button theme-toggle" aria-label={theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle color theme"} onClick={toggleTheme}><Moon className="show-light" size={18} aria-hidden="true" /><Sun className="show-dark" size={18} aria-hidden="true" /></button>
      <a className="header-github" href="https://github.com/tuprel/tuprel" aria-label="Tuprel on GitHub"><Github size={20} aria-hidden="true" /></a>
      <Link className="button primary header-cta" href="/docs/quickstart/">Get started<ArrowRight size={15} aria-hidden="true" /></Link>
      <button ref={menuTrigger} type="button" className="icon-button menu-trigger" aria-controls="mobile-navigation" aria-expanded={menu} aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}>{menu ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!menu} onKeyDown={(event) => {
      if (event.key === "Escape") { setMenu(false); menuTrigger.current?.focus(); }
    }}>
      {links.map(([label, href]) => <Link href={href} key={label} onClick={() => setMenu(false)} aria-current={current(href) ? "page" : undefined}>{label}</Link>)}
      <Link href="/docs/quickstart/" onClick={() => setMenu(false)}>Get started</Link>
      <a href="https://github.com/tuprel/tuprel">GitHub</a>
    </nav>
    <dialog ref={searchDialog} className="search-dialog" aria-labelledby="search-label" onFocus={loadSearch}>
      <div className="search-input-row">
        <Search size={20} aria-hidden="true" />
        <label id="search-label" className="sr-only" htmlFor="doc-search">Search documentation</label>
        <input ref={searchInput} id="doc-search" type="search" placeholder="Search documentation…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="button" className="icon-button" aria-label="Close search" onClick={() => searchDialog.current?.close()}><X size={19} /></button>
      </div>
      <div className="search-results">
        {failed && <p role="status">Search is temporarily unavailable. <button type="button" onClick={loadSearch}>Try again</button></p>}
        {!failed && !results && <p role="status">Loading documentation…</p>}
        {results?.length === 0 && <p role="status">No matching documents.</p>}
        {!!results?.length && <><p className="search-caption">{query.trim() ? "Results" : "Start here"}</p><ul>
          {results.map(({ title, section, summary, href }) => <li key={href}>
            <Link href={href} onClick={() => { searchDialog.current?.close(); setMenu(false); }}>
              <span><strong>{section || title}</strong><small>{section ? title + " · " : ""}{summary}</small></span><ArrowRight size={16} aria-hidden="true" />
            </Link>
          </li>)}
        </ul></>}
      </div>
    </dialog>
  </>;
}
