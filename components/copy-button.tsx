"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  async function copy() {
    clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
    timeout.current = setTimeout(() => setStatus(""), 2500);
  }

  return <button className="copy-button" type="button" aria-label={status ? status + ". Copy code" : "Copy code"} onClick={copy}>
    {status === "Copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
    <span aria-live="polite">{status}</span>
  </button>;
}
