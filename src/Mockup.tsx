import { useState, type ReactNode } from "react";
import { Blobatar } from "@blobatar/react";
import type { Animate } from "blobatar";
import { exprOf, type ExpressionName } from "./expressions";
import { optionsFor, type Settings } from "./settings";

type Motion = "off" | "hover" | "always";

// What the avatar does while a menu item is hovered.
const MENU_MOODS: Record<string, ExpressionName> = {
  Appearance: "love",
  Version: "thinking",
  Portal: "surprised",
  Logout: "sad",
};

const USERS = [
  { name: "axel.s", handle: "@splitsecondconnect.com", company: "Alien & Company", role: "admin" },
  { name: "mira.k", handle: "@splitsecondconnect.com", company: "Northwind Rentals", role: "member" },
  { name: "jonas.p", handle: "@splitsecondconnect.com", company: "Alien & Company", role: "member" },
  { name: "leah.t", handle: "@splitsecondconnect.com", company: "Harbour Fleet", role: "admin" },
  { name: "omar.d", handle: "@splitsecondconnect.com", company: "Bright Ops", role: "member" },
  { name: "sofia.r", handle: "@splitsecondconnect.com", company: "Alien & Company", role: "member" },
];

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export function Mockup({ settings }: { settings: Settings }) {
  const [user, setUser] = useState(USERS[0]);
  const [mode, setMode] = useState<"renter" | "operator">("renter");

  const [motion, setMotion] = useState<Motion>("always");
  const [reactive, setReactive] = useState(true);
  const [mood, setMood] = useState<ExpressionName | null>(null);

  // Off: a static <img>, what the basic Angular component renders.
  // On: inline SVG with motion.css, what the animated Angular component renders.
  const avatar = (seed: string, size: number, anim: Animate | undefined, withMood = false) => {
    const opts = optionsFor(seed, settings);
    if (!anim) return <Blobatar name={seed} size={size} alt="" {...opts} />;
    const expression = withMood && reactive && mood ? exprOf(mood) : opts.expression;
    return <Blobatar name={seed} size={size} animate={anim} {...opts} expression={expression} />;
  };
  const main = motion === "off" ? undefined : motion;
  const list = motion === "off" ? undefined : "hover";

  const menuItem = (label: string, icon: ReactNode) => (
    <a onMouseEnter={() => setMood(MENU_MOODS[label])} onMouseLeave={() => setMood(null)}>
      {icon}
      {label}
    </a>
  );

  return (
    <main className="mockup-page">
      <header>
        <h1>Account mockup</h1>
        <p>The account panel with the current playground style. Avatars here are static images, the same as the Angular app will render. Pick a user below to see other faces.</p>
      </header>

      <div className="mockup-layout">
        <div className="device">
          <div className="acct">
            <div className="acct-top">
              <button className="acct-back" aria-label="Back">
                <Icon><polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" /></Icon>
              </button>
              <h2>Account</h2>
            </div>

            <div className="acct-card">
              {user.role === "admin" && <span className="acct-pill">admin</span>}
              <div className="acct-user">
                <div className="acct-avatar">{avatar(user.name, 64, main, true)}</div>
                <div>
                  <div className="acct-name">{user.name}</div>
                  <div className="acct-sub">{user.handle}</div>
                  <div className="acct-sub">{user.company}</div>
                </div>
              </div>
              <div className="acct-seg">
                <button className={mode === "renter" ? "on" : ""} onClick={() => setMode("renter")}>Renter</button>
                <button className={mode === "operator" ? "on" : ""} onClick={() => setMode("operator")}>Operator</button>
              </div>
            </div>

            <nav className="acct-menu">
              {menuItem("Appearance", (
                <Icon>
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </Icon>
              ))}
              {menuItem("Version", (
                <Icon><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></Icon>
              ))}
              {menuItem("Portal", (
                <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></Icon>
              ))}
            </nav>

            <nav className="acct-menu">
              {menuItem("Logout", (
                <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
              ))}
            </nav>
          </div>
        </div>

        <aside className="mockup-side">
          <h2>Motion</h2>
          <div className="motion-controls">
            <div className="segmented">
              {(["off", "hover", "always"] as const).map((m) => (
                <button key={m} className={motion === m ? "on" : ""} onClick={() => setMotion(m)}>
                  {m === "off" ? "Static" : m === "hover" ? "On hover" : "Always"}
                </button>
              ))}
            </div>
            <label className="row">
              <input type="checkbox" checked={reactive} disabled={motion === "off"}
                onChange={(e) => setReactive(e.target.checked)} />
              Avatar reacts when you hover the menu
            </label>
            <p className="hint">
              {motion === "off"
                ? "Static images: the basic Angular component."
                : "Animated inline SVG: needs the animated Angular component and blobatar/motion.css."}
            </p>
          </div>

          <h2>Switch user</h2>
          <div className="user-list">
            {USERS.map((u) => (
              <button key={u.name} className={`user-row ${u.name === user.name ? "on" : ""}`} onClick={() => setUser(u)}>
                {avatar(u.name, 36, list)}
                <span>
                  <strong>{u.name}</strong>
                  <small>{u.company}</small>
                </span>
              </button>
            ))}
          </div>

          <h2>At common sizes</h2>
          <div className="sizes">
            {[24, 32, 40, 64, 96].map((px) => (
              <figure key={px}>
                {avatar(user.name, px, main)}
                <figcaption>{px}px</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
