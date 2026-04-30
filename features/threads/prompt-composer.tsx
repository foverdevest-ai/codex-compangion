"use client";

import { Send, Copy, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function PromptComposer({ threadId, draft }: { threadId: string; draft: string }) {
  const router = useRouter();
  const draftKey = useMemo(() => `codex-companion:draft:${threadId}`, [threadId]);
  const [value, setValue] = useState(draft);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(draftKey);
    if (savedDraft) {
      setValue(savedDraft);
    }
  }, [draftKey]);

  useEffect(() => {
    window.localStorage.setItem(draftKey, value);
  }, [draftKey, value]);

  function submit() {
    const content = value.trim();
    if (!content || pending) return;
    setNotice(null);
    startTransition(async () => {
      const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!response.ok) {
        setNotice("Prompt was not sent. Check your connection and try again.");
        return;
      }
      setValue("");
      window.localStorage.removeItem(draftKey);
      setNotice("Prompt sent to Codex. Watching this run for updates.");
      router.refresh();
      window.setTimeout(() => router.refresh(), 1500);
    });
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-[76px] z-30 border-t bg-[var(--card)] p-3 backdrop-blur-[var(--glass-blur)] lg:sticky lg:bottom-4 lg:rounded-lg lg:border">
      <div className="mx-auto flex max-w-4xl flex-col gap-2">
        <Textarea
          className="max-h-36 min-h-20 text-base sm:text-sm"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (notice) setNotice(null);
          }}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Send the next precise instruction."
        />
        {notice ? <p className="text-xs font-semibold text-[var(--muted-foreground)]">{notice}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" size="sm" type="button"><Copy className="h-4 w-4" /> Copy last</Button>
            <Button variant="outline" size="sm" type="button"><RotateCcw className="h-4 w-4" /> Reuse</Button>
          </div>
          <Button className="min-h-12 w-full sm:min-h-10 sm:w-auto" onClick={submit} disabled={pending || !value.trim()}><Send className="h-4 w-4" /> {pending ? "Sending..." : "Send"}</Button>
        </div>
      </div>
    </div>
  );
}
