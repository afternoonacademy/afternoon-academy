"use client";

import { Button } from "@repo/ui/Button";

export function InteractiveSection() {
  return (
    <div>
      <Button title="Click Me" onPress={() => console.log("Web Button clicked")} />
    </div>
  );
}
