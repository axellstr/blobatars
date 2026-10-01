import { useMemo, useState } from "react";
import { Blobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";
import { BRAND_COLORS, ONYX, WHITE } from "./brand";
import { configCode } from "./config";
import { EXPRESSION_NAMES, exprOf, type ExpressionName } from "./expressions";
import {
  EYE_TRAITS, baseOptions, brandSettings, initialTraits, optionsFor,
  type Settings, type Shape, type TraitKey,
} from "./settings";

const SAMPLE_NAMES = [
  "axel.s", "mira.k", "jonas.p", "leah.t", "omar.d", "sofia.r",
  "ada@lovelace.dev", "grace", "linus", "radia", "guido", "yukihiro",
];

type Props = { settings: Settings; update: (patch: Partial<Settings>) => void };

export function Playground({ settings: s, update }: Props) {
  const [name, setName] = useState("axel.s");
  const [gaze, setGaze] = useState(true);
  const [copied, setCopied] = useState(false);
  const { ref } = useGaze({ travel: gaze ? 3 : 0, lookAt: "pointer" });

  const brand = s.colorMode === "brand";
  const hasBackdrop = s.shape !== "default" && s.shape !== "none";
  const lockedEyes = EYE_TRAITS.filter((t) => s.traits[t.key].on).length + (s.lockEyeColor ? 1 : 0);

  const setTrait = (key: TraitKey, patch: Partial<{ on: boolean; v: number }>) =>
    update({ traits: { ...s.traits, [key]: { ...s.traits[key], ...patch } } });

  const toggleBrandColor = (hex: string) => {
    const on = s.brandColors.includes(hex);
    if (on && s.brandColors.length === 1) return; // keep at least one
    update({
      brandColors: on
        ? s.brandColors.filter((c) => c !== hex)
        : BRAND_COLORS.map((c) => c.hex).filter((c) => c === hex || s.brandColors.includes(c)),
    });
  };

  const code = useMemo(() => configCode(baseOptions(s), s.expr, brandSettings(s)), [s]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the code is still selectable below.
    }
  };

  return (
    <main>
      <header>
        <h1>Blobatar Playground</h1>
        <p>Type a name and change the options. Every face is generated from the string, so the same name always gives the same face. Anything you lock applies to every name.</p>
      </header>

      <section className="hero">
        <Blobatar ref={ref} name={name} size={220} animate="always" title={name} {...optionsFor(name, s)} />

        <div className="controls">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>

          <label>
            Expression
            <select value={s.expr} onChange={(e) => update({ expr: e.target.value as ExpressionName | "none" })}>
              <option value="none">none</option>
              {EXPRESSION_NAMES.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>

          <label>
            Backdrop shape
            <select value={s.shape} onChange={(e) => update({ shape: e.target.value as Shape })}>
              {(["circle", "squircle", "square", "none", "default"] as const).map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>

          <div className="segmented small">
            <button className={brand ? "on" : ""} onClick={() => update({ colorMode: "brand" })}>Brand colours</button>
            <button className={!brand ? "on" : ""} onClick={() => update({ colorMode: "free" })}>Free hue</button>
          </div>

          {brand ? (
            <>
              <div className="field">
                <span>Body colours <small>(each name picks one of the selected)</small></span>
                <div className="swatches">
                  {BRAND_COLORS.map((c) => (
                    <button key={c.hex} title={`${c.name} ${c.hex}`}
                      className={`swatch ${s.brandColors.includes(c.hex) ? "on" : ""}`}
                      style={{ background: c.hex }} onClick={() => toggleBrandColor(c.hex)} />
                  ))}
                </div>
              </div>
              <div className="field">
                <span>Backdrop colour</span>
                <div className="swatches">
                  {[{ name: "White", hex: WHITE }, { name: "Onyx", hex: ONYX }].map((c) => (
                    <button key={c.hex} title={`${c.name} ${c.hex}`} disabled={!hasBackdrop}
                      className={`swatch ${s.backdrop === c.hex ? "on" : ""}`}
                      style={{ background: c.hex }} onClick={() => update({ backdrop: c.hex })} />
                  ))}
                  {!hasBackdrop && <small>Pick a backdrop shape first</small>}
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="row">
                <input type="checkbox" checked={s.lockHue} onChange={(e) => update({ lockHue: e.target.checked })} />
                Lock hue
                <input type="range" min={0} max={359} value={s.hue} disabled={!s.lockHue}
                  onChange={(e) => update({ hue: +e.target.value })} />
                <span className="num">{s.hue}°</span>
              </label>
              <label className="row">
                <input type="checkbox" checked={s.lockTone} onChange={(e) => update({ lockTone: e.target.checked })} />
                Lock tone
                <input type="range" min={0} max={0.999} step={0.001} value={s.tone} disabled={!s.lockTone}
                  onChange={(e) => update({ tone: +e.target.value })} />
                <span className="num">{s.tone.toFixed(2)}</span>
              </label>
            </>
          )}

          <label className="row">
            <input type="checkbox" checked={gaze} onChange={(e) => setGaze(e.target.checked)} />
            Eyes follow the cursor (preview only)
          </label>
        </div>
      </section>

      <details className="panel">
        <summary>
          <h2>Eyes <small>{lockedEyes ? `${lockedEyes} locked` : "all automatic"}</small></h2>
        </summary>
        <div className="panel-head">
          <p className="hint">Moving a slider locks that trait for every name. Unticked traits still vary per name.</p>
          <button onClick={() => update({ traits: initialTraits(), lockEyeColor: false })}>Reset eyes</button>
        </div>
        <div className="traits">
          {EYE_TRAITS.map((t) => {
            const st = s.traits[t.key];
            return (
              <div key={t.key} className={`trait ${st.on ? "on" : ""}`}>
                <label className="row">
                  <input type="checkbox" checked={st.on} onChange={(e) => setTrait(t.key, { on: e.target.checked })} />
                  {t.label} <code>{t.key}</code>
                </label>
                <div className="row">
                  <span className="end">{t.low}</span>
                  <input type="range" min={0} max={1} step={0.01} value={st.v}
                    onChange={(e) => setTrait(t.key, { on: true, v: +e.target.value })} />
                  <span className="end">{t.high}</span>
                  <span className="num">{st.on ? st.v.toFixed(2) : "auto"}</span>
                </div>
              </div>
            );
          })}
          <div className={`trait ${s.lockEyeColor ? "on" : ""}`}>
            <label className="row">
              <input type="checkbox" checked={s.lockEyeColor} onChange={(e) => update({ lockEyeColor: e.target.checked })} />
              Eye colour <code>palette.eye</code>
            </label>
            <div className="row">
              <input type="color" value={s.eyeColor}
                onChange={(e) => update({ eyeColor: e.target.value, lockEyeColor: true })} />
              <span className="end">
                {s.lockEyeColor ? s.eyeColor : brand ? "auto (Onyx or White, whichever reads better)" : "auto"}
              </span>
            </div>
            {s.lockEyeColor && <p className="warn">Turns off the automatic contrast check. Make sure the eyes stay visible on every name below.</p>}
          </div>
        </div>
      </details>

      <h2>Your style on other names <small>(click one to use it)</small></h2>
      <section className="grid">
        {SAMPLE_NAMES.map((n) => (
          <figure key={n} onClick={() => setName(n)} className={n === name ? "active" : ""}>
            <Blobatar name={n} size={64} animate="hover" {...optionsFor(n, s)} />
            <figcaption>{n}</figcaption>
          </figure>
        ))}
      </section>

      <h2>Expressions <small>(hover to animate, click to select)</small></h2>
      <section className="grid">
        {EXPRESSION_NAMES.map((n) => (
          <figure key={n} onClick={() => update({ expr: n })} className={n === s.expr ? "active" : ""}>
            <Blobatar name={name} size={88} animate="hover" {...optionsFor(name, s, false)} expression={exprOf(n)} />
            <figcaption>{n}</figcaption>
          </figure>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Your config <small>(paste into <code>avatar.config.ts</code>)</small></h2>
          <button onClick={copy}>{copied ? "Copied ✓" : "Copy config"}</button>
        </div>
        <pre>{code}</pre>
      </section>
    </main>
  );
}
