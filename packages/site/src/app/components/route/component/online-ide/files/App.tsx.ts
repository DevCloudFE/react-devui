export default `import type { DConfigContextData } from "@react-devui/ui/hooks/d-config";

import { useMemo } from "react";

import { DRoot } from "@react-devui/ui";

import Demo from "./Demo";
import "./styles.scss";

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      layout: { scrollEl: "main", resizeEl: "article" }
    }),
    []
  );

  return (
    <DRoot dContext={rootContext}>
      <main>
        <article>
          <Demo />
        </article>
      </main>
    </DRoot>
  );
}
`;
