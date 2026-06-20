"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useDesignStore } from "@/store/useDesignStore";

export function RefinementBox() {
  const [instruction, setInstruction] = useState("");
  const { currentSpec, isRefining, refineDesign, selectedNodeId } = useDesignStore();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void refineDesign(instruction, selectedNodeId ?? undefined);
        setInstruction("");
      }}
    >
      <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="refinement-prompt">
        Refinement
      </label>
      <Textarea
        id="refinement-prompt"
        onChange={(event) => setInstruction(event.target.value)}
        placeholder={selectedNodeId ? "Refine the selected item" : "Refine the whole design"}
        rows={3}
        value={instruction}
      />
      <Button className="w-full" disabled={!currentSpec || isRefining} type="submit">
        {isRefining ? "Refining..." : selectedNodeId ? "Refine selected" : "Refine design"}
      </Button>
    </form>
  );
}
