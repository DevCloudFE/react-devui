export default `import type { DRootProps } from '@react-devui/ui';

import { useMemo } from "react";

import { DRoot } from "@react-devui/ui";

import Demo from "./Demo";
import "./styles.scss";

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      layout: { pageScrollEl: "#app-main", contentResizeEl: "#app-content" }
    }),
    []
  );

  return (
    <DRoot context={rootContext}>
      <main id="app-main">
        <section id="app-content">
          <Demo />
        </section>
      </main>
    </DRoot>
  );
}
`;
