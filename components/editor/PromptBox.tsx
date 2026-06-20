"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useDesignStore } from "@/store/useDesignStore";

export function PromptBox() {
  const [prompt, setPrompt] = useState("A premium landing page for an AI design workbench");
  const { generateDesign, isGenerating } = useDesignStore();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void generateDesign(prompt);
      }}
    >
      <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="design-prompt">
        Prompt
      </label>
      <Textarea
        id="design-prompt"
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the UI you want to design"
        rows={5}
        value={prompt}
      />
      <Button className="w-full" disabled={isGenerating} type="submit" variant="primary">
        {isGenerating ? "Generating..." : "Generate design"}
      </Button>
    </form>
  );
}
