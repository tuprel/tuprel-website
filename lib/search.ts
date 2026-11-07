export type SearchEntry = {
  href: string;
  title: string;
  section?: string;
  summary: string;
  text: string;
};

const normalize = (text: string) => text.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");

export function rankSearch(index: SearchEntry[], query: string): SearchEntry[] {
  const phrase = normalize(query).trim();
  if (!phrase) return index.filter(({ section }) => !section).slice(0, 5);
  const terms = phrase.split(/\s+/);
  return index.flatMap((entry) => {
    const title = normalize(entry.title);
    const section = normalize(entry.section ?? "");
    const body = normalize(entry.summary + " " + entry.text);
    if (!terms.every((term) => title.includes(term) || section.includes(term) || body.includes(term))) return [];
    const score = (title === phrase ? 60 : 0) + (section.includes(phrase) ? 34 : 0)
      + (title.includes(phrase) ? 18 : 0) + terms.reduce((total, term) =>
        total + (section.includes(term) ? 6 : 0) + (title.includes(term) ? 8 : 0) + (body.includes(term) ? 1 : 0), 0);
    return [{ entry, score }];
  }).sort((a, b) => b.score - a.score).slice(0, 10).map(({ entry }) => entry);
}
