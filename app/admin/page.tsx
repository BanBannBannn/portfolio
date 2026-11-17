import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { adminEnabled, isAdmin, weakPassword } from '../../lib/admin-auth';
import { DEFAULTS, envConfig, FIELDS, getConfig, getOverrides, type ConfigKey } from '../../lib/chat/config';
import { hasStore } from '../../lib/chat/store';
import { getSpend, PRICES, readDashboard, type DayRow, type Outcome, type Trace } from '../../lib/chat/telemetry';
import { clearTraceList, login, logout, resetSettings, saveSettings } from './actions';
import './admin.css';

export const metadata: Metadata = {
  title: 'Chat admin',
  robots: { index: false, follow: false },
};

type Search = Promise<Record<string, string | string[] | undefined>>;

const OUTCOMES: Outcome[] = ['answered', 'refused', 'error', 'aborted', 'rate_limited', 'rejected', 'paused', 'mail_sent', 'mail_failed'];
const TZ = 'Asia/Ho_Chi_Minh';

const usd = (n: number, digits = 4) => `$${n.toFixed(digits)}`;
const int = (n: number | undefined) => (n ?? 0).toLocaleString('en-US');
const ms = (n: number | undefined) => (n === undefined ? '–' : n < 1000 ? `${Math.round(n)} ms` : `${(n / 1000).toFixed(1)} s`);
const pct = (n: number) => `${Math.round(n * 100)}%`;

function quantile(xs: number[], q: number) {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

function sum(rows: DayRow[], k: string) {
  return rows.reduce((n, r) => n + (r.t[k] ?? 0), 0);
}

const MESSAGES: Record<string, string> = {
  wrong: 'Wrong password.',
  throttled: 'Too many attempts. Try again in 15 minutes.',
  saved: 'Settings saved. Other server instances pick them up within 15 seconds.',
  reset: 'Overrides cleared: env vars and defaults apply again.',
  cleared: 'Trace list cleared. Daily totals are kept.',
  failed: 'Could not reach the store. Nothing was changed.',
};

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
  // Render per request: ADMIN_PASSWORD and the data are read at runtime, never at build time.
  await connection();
  if (!adminEnabled()) notFound();
  const sp = await searchParams;
  const flash = MESSAGES[String(sp.e ?? sp.s ?? '')];

  if (!(await isAdmin())) {
    return (
      <main className="adm adm-login">
        <h1>Chat admin</h1>
        <form action={login} className="adm-card">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
          <button className="btn" type="submit">Sign in</button>
          {flash && <p className="adm-flash adm-flash--bad" role="alert">{flash}</p>}
        </form>
      </main>
    );
  }

  const [config, overrides, spend, dash] = await Promise.all([getConfig(), getOverrides(true), getSpend(), readDashboard(14)]);
  const env = envConfig();
  const store = hasStore();
  const filter = OUTCOMES.includes(sp.outcome as Outcome) ? (sp.outcome as Outcome) : null;

  const today = dash.days[0];
  const week = dash.days.slice(0, 7);
  const answered = dash.traces.filter(t => t.outcome === 'answered');
  const ttfts = answered.flatMap(t => (t.ttftMs === undefined ? [] : [t.ttftMs]));
  const durations = answered.map(t => t.durationMs);
  const tok = answered.reduce(
    (a, t) => ({
      input: a.input + (t.tokens?.input ?? 0),
      output: a.output + (t.tokens?.output ?? 0),
      cacheRead: a.cacheRead + (t.tokens?.cacheRead ?? 0),
      cacheWrite: a.cacheWrite + (t.tokens?.cacheWrite ?? 0),
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  );
  const promptTokens = tok.input + tok.cacheRead + tok.cacheWrite;
  const weekRequests = sum(week, 'requests');
  const weekCost = sum(week, 'cost_micro') / 1e6;
  const weekAnswered = sum(week, 'answered');
  const shown = (filter ? dash.traces.filter(t => t.outcome === filter) : dash.traces).slice(0, 100);
  const groups = [...new Set(Object.values(FIELDS).map(f => f.group))];

  return (
    <main className="adm">
      <header className="adm-head">
        <div>
          <h1>Chat admin</h1>
          <p className="adm-muted">
            {store ? 'Shared store connected: numbers cover every server instance.' : 'No shared store: numbers are for this server instance only and reset on deploy. See docs/chat-setup.md, section 8.2.'}
          </p>
        </div>
        <form action={logout}><button className="adm-link" type="submit">Sign out</button></form>
      </header>

      {flash && <p className="adm-flash" role="status">{flash}</p>}
      {weakPassword() && <p className="adm-flash adm-flash--bad">ADMIN_PASSWORD is shorter than 12 characters. Use a longer one.</p>}
      {!config.enabled && <p className="adm-flash adm-flash--bad">The chat is turned off.</p>}

      <section className="adm-grid" aria-label="Summary">
        <Stat label="Spent today (UTC)" value={usd(spend.today)} sub={config.dailyBudgetUsd ? `of ${usd(config.dailyBudgetUsd, 2)} daily budget` : 'no daily cap'} meter={config.dailyBudgetUsd ? spend.today / config.dailyBudgetUsd : undefined} />
        <Stat label="Spent this month" value={usd(spend.month)} sub={config.monthlyBudgetUsd ? `of ${usd(config.monthlyBudgetUsd, 2)} monthly budget` : 'no monthly cap'} meter={config.monthlyBudgetUsd ? spend.month / config.monthlyBudgetUsd : undefined} />
        <Stat label="Requests, 7 days" value={int(weekRequests)} sub={`${int(weekAnswered)} answered · ${int(sum(week, 'rate_limited'))} rate-limited · ${int(sum(week, 'error'))} errors`} />
        <Stat label="Cost per answer, 7 days" value={weekAnswered ? usd(weekCost / weekAnswered, 5) : '–'} sub={`${int(today?.t.answered)} answered today`} />
        <Stat label="Time to first word" value={ms(quantile(ttfts, 0.5))} sub={`p95 ${ms(quantile(ttfts, 0.95))} · last ${ttfts.length} answers`} />
        <Stat label="Full answer" value={ms(quantile(durations, 0.5))} sub={`p95 ${ms(quantile(durations, 0.95))}`} />
        <Stat label="Avg tokens per answer" value={answered.length ? `${int(Math.round(promptTokens / answered.length))} in` : '–'} sub={answered.length ? `${int(Math.round(tok.output / answered.length))} out (incl. thinking)` : ''} />
        <Stat label="Prompt cache hits" value={promptTokens ? pct(tok.cacheRead / promptTokens) : '–'} sub={tok.cacheRead ? 'of prompt tokens read from cache' : 'no cache reads yet'} />
      </section>

      <section aria-labelledby="days-h">
        <h2 id="days-h">Last 14 days</h2>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Day (UTC)</th><th>Requests</th><th>Answered</th><th>Rate-limited</th><th>Rejected</th><th>Errors</th>
                <th>Input</th><th>Cache read</th><th>Cache write</th><th>Output</th><th>Avg first word</th><th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {dash.days.map(d => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td>{int(d.t.requests)}</td>
                  <td>{int(d.t.answered)}</td>
                  <td>{int(d.t.rate_limited)}</td>
                  <td>{int(d.t.rejected)}</td>
                  <td>{int((d.t.error ?? 0) + (d.t.refused ?? 0))}</td>
                  <td>{int(d.t.input)}</td>
                  <td>{int(d.t.cache_read)}</td>
                  <td>{int(d.t.cache_write)}</td>
                  <td>{int(d.t.output)}</td>
                  <td>{d.t.ttft_n ? ms(d.t.ttft_ms / d.t.ttft_n) : '–'}</td>
                  <td>{usd((d.t.cost_micro ?? 0) / 1e6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="adm-muted">
          Cost is estimated from token counts at {Object.entries(PRICES).map(([m, p]) => `${m.replace('claude-', '')} $${p.input}/$${p.output}`).join(', ')} per million input/output tokens.
          The exact bill is in the Anthropic Console under Usage and Cost.
        </p>
      </section>

      <section id="traces" aria-labelledby="traces-h">
        <div className="adm-row">
          <h2 id="traces-h">Recent requests</h2>
          <nav className="adm-filters" aria-label="Filter by outcome">
            <a href="/admin#traces" aria-current={!filter ? 'page' : undefined}>All</a>
            {OUTCOMES.map(o => (
              <a key={o} href={`/admin?outcome=${o}#traces`} aria-current={filter === o ? 'page' : undefined}>{o.replace('_', ' ')}</a>
            ))}
          </nav>
        </div>
        {shown.length === 0 ? (
          <p className="adm-muted">Nothing yet.</p>
        ) : (
          <div className="adm-scroll">
            <table className="adm-table adm-traces">
              <thead>
                <tr>
                  <th>Time (ICT)</th><th>Outcome</th><th>Q#</th><th>Model</th><th>Tokens in / cache / out</th>
                  <th>Cost</th><th>First word</th><th>Total</th><th>Visitor</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(t => <TraceRow key={t.id} t={t} />)}
              </tbody>
            </table>
          </div>
        )}
        <form action={clearTraceList}>
          <button className="adm-link" type="submit">Clear the request list</button>
        </form>
      </section>

      <section id="settings" aria-labelledby="settings-h">
        <h2 id="settings-h">Settings</h2>
        <p className="adm-muted">
          Order of precedence: a value saved here, then the env var, then the built-in default.
          {!store && ' Saving needs the shared store; until then, change env vars and redeploy.'}
        </p>
        <form action={saveSettings} className="adm-settings">
          {groups.map(g => (
            <fieldset key={g}>
              <legend>{g}</legend>
              {(Object.keys(FIELDS) as ConfigKey[]).filter(k => FIELDS[k].group === g).map(k => (
                <SettingField key={k} k={k} value={config[k]} env={env[k]} overridden={k in overrides} disabled={!store} />
              ))}
            </fieldset>
          ))}
          <div className="adm-actions">
            <button className="btn" type="submit" disabled={!store}>Save settings</button>
          </div>
        </form>
        {store && Object.keys(overrides).length > 0 && (
          <form action={resetSettings}>
            <button className="adm-link" type="submit">Clear all overrides ({Object.keys(overrides).length})</button>
          </form>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, sub, meter }: { label: string; value: string; sub?: string; meter?: number }) {
  return (
    <div className="adm-card adm-stat">
      <p className="adm-stat-label">{label}</p>
      <p className="adm-stat-value">{value}</p>
      {meter !== undefined && (
        <div className="adm-meter" data-over={meter >= 0.8} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(meter, 1) * 100)} aria-label={label}>
          <span style={{ width: `${Math.min(100, meter * 100)}%` }} />
        </div>
      )}
      {sub && <p className="adm-muted">{sub}</p>}
    </div>
  );
}

function TraceRow({ t }: { t: Trace }) {
  const time = new Date(t.at).toLocaleString('en-GB', { timeZone: TZ, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hasDetails = t.q || t.a || t.requestId || t.reason || t.stopReason || t.tools?.length;
  return (
    <tr>
      <td className="adm-nowrap">{time}</td>
      <td><span className="adm-pill" data-outcome={t.outcome}>{t.outcome.replace('_', ' ')}</span></td>
      <td>{t.question ?? '–'}</td>
      <td className="adm-nowrap">{t.model?.replace('claude-', '') ?? '–'}{t.effort ? ` · ${t.effort}` : ''}</td>
      <td className="adm-nowrap">{t.tokens ? `${int(t.tokens.input)} / ${int(t.tokens.cacheRead + t.tokens.cacheWrite)} / ${int(t.tokens.output)}` : '–'}</td>
      <td>{t.costUsd ? usd(t.costUsd, 5) : '–'}</td>
      <td>{ms(t.ttftMs)}</td>
      <td>{ms(t.durationMs)}</td>
      <td><code title="Hashed device id · hashed IP">{t.device ?? '–'}</code></td>
      <td>
        {hasDetails ? (
          <details>
            <summary>{t.reason ?? t.stopReason ?? 'show'}</summary>
            <dl className="adm-dl">
              {t.reason && <><dt>Reason</dt><dd>{t.reason}</dd></>}
              {t.tools?.length ? <><dt>Tools</dt><dd>{t.tools.join(', ')}</dd></> : null}
              {t.stopReason && <><dt>Stop</dt><dd>{t.stopReason}</dd></>}
              {t.chars !== undefined && <><dt>Question length</dt><dd>{t.chars} chars</dd></>}
              {t.ip && <><dt>IP (hashed)</dt><dd><code>{t.ip}</code></dd></>}
              {t.requestId && <><dt>Request id</dt><dd><code>{t.requestId}</code></dd></>}
              {t.q && <><dt>Question</dt><dd className="adm-text">{t.q}</dd></>}
              {t.a && <><dt>Answer</dt><dd className="adm-text">{t.a}</dd></>}
            </dl>
          </details>
        ) : '–'}
      </td>
    </tr>
  );
}

function SettingField({ k, value, env, overridden, disabled }: { k: ConfigKey; value: unknown; env: unknown; overridden: boolean; disabled: boolean }) {
  const f = FIELDS[k];
  const id = `cfg-${k}`;
  const source = overridden ? 'saved here' : env !== DEFAULTS[k] ? `env ${f.env}` : 'default';
  const hint = [f.help, `Now from: ${source}. Env ${f.env}${env !== DEFAULTS[k] ? ` = ${String(env)}` : ''}, default ${String(DEFAULTS[k])}.`].filter(Boolean).join(' ');
  return (
    <div className="adm-field">
      {f.type === 'boolean' ? (
        <label className="adm-check" htmlFor={id}>
          <input id={id} name={k} type="checkbox" defaultChecked={value === true} disabled={disabled} aria-describedby={`${id}-h`} />
          <span>{f.label}</span>
        </label>
      ) : (
        <>
          <label htmlFor={id}>{f.label}</label>
          {f.type === 'select' ? (
            <select id={id} name={k} defaultValue={String(value)} disabled={disabled} aria-describedby={`${id}-h`}>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input id={id} name={k} type="number" inputMode="decimal" min={f.min} max={f.max} step={'step' in f ? f.step : 1} defaultValue={String(value)} disabled={disabled} aria-describedby={`${id}-h`} required />
          )}
        </>
      )}
      <p className="adm-muted" id={`${id}-h`}>{overridden && <strong>Overridden. </strong>}{hint}</p>
    </div>
  );
}
