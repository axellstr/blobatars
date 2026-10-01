import { useEffect, useState } from "react";
import { Playground } from "./Playground";
import { Mockup } from "./Mockup";
import { initialSettings, type Settings } from "./settings";

type Tab = "playground" | "mockup";
const tabFromHash = (): Tab => (location.hash === "#mockup" ? "mockup" : "playground");

export function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <>
      <nav className="tabs">
        <a href="#playground" className={tab === "playground" ? "active" : ""}>Playground</a>
        <a href="#mockup" className={tab === "mockup" ? "active" : ""}>Account mockup</a>
      </nav>
      {tab === "playground"
        ? <Playground settings={settings} update={update} />
        : <Mockup settings={settings} />}
    </>
  );
}
