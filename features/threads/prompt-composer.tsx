"use client";

import { Send, Copy, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function PromptComposer({ threadId, draft }: { threadId: string; draft: string }) {
  const [value, setValue] = useState(draft);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!value.trim()) return;
    startTransition(async () => {
      await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: value })
      });
      setValue("");
      window.location.reload();
    });
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-[76px] z-30 border-t bg-[var(--card)] p-3 backdrop-blur-[var(--glass-blur)] lg:sticky lg:bottom-4 lg:rounded-lg lg:border">
      <div className="mx-auto flex max-w-4xl flex-col gap-2">
        <Textarea className="max-h-36 min-h-20" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Send the next precise instruction." />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" size="sm" type="button"><Copy className="h-4 w-4" /> Copy last</Button>
            <Button variant="outline" size="sm" type="button"><RotateCcw className="h-4 w-4" /> Reuse</Button>
          </div>
          <Button className="w-full sm:w-auto" onClick={submit} disabled={pending || !value.trim()}><Send className="h-4 w-4" /> Send</Button>
        </div>
      </div>
    </div>
  );
}
