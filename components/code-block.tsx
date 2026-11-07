import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { common, createLowlight } from "lowlight";
import { CopyButton } from "./copy-button";

const lowlight = createLowlight(common);
const languageAliases: Record<string, string> = { tuprel: "kotlin", sh: "bash", shell: "bash", ps1: "powershell" };

export function CodeBlock({ code, language = "text", filename, lines, caption }: {
  code: string; language?: string; filename?: string; lines?: boolean; caption?: string;
}) {
  const highlight = languageAliases[language] ?? language;
  const content = (value: string) => lowlight.registered(highlight)
    ? toJsxRuntime(lowlight.highlight(highlight, value), { Fragment, jsx, jsxs })
    : value;

  return <figure className="code-window">
    <div className="code-head">
      <span className="window-lights" aria-hidden="true"><i /><i /><i /></span>
      <span>{filename || language}</span>
      <CopyButton code={code} />
    </div>
    <pre tabIndex={0} aria-label={filename ?? language + " code"}><code>{lines
      ? code.split("\n").map((line, index) => <span className="code-line" key={index}><span aria-hidden="true" className="line-number">{index + 1}</span><span className="line-source">{content(line)}</span></span>)
      : content(code)}</code></pre>
    {caption && <figcaption><span className="status-dot" />{caption}</figcaption>}
  </figure>;
}
