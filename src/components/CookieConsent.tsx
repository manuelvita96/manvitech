import { useEffect, useState } from 'react';

type ConsentState = {
  necessary: true; // sempre attivi, non disattivabili
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

const STORAGE_KEY = 'manvitech-cookie-consent';

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

function writeConsent(state: Omit<ConsentState, 'decidedAt'>) {
  const full: ConsentState = { ...state, decidedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  // Evento globale: se in futuro aggiungiamo script di analytics/marketing,
  // si mettono in ascolto di questo evento per attivarsi solo col consenso.
  window.dispatchEvent(new CustomEvent('manvitech:consent-updated', { detail: full }));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setVisible(true);

    const reopen = () => {
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener('manvitech:open-cookie-prefs', reopen);
    return () => window.removeEventListener('manvitech:open-cookie-prefs', reopen);
  }, []);

  function acceptAll() {
    writeConsent({ necessary: true, analytics: true, marketing: true });
    setVisible(false);
  }

  function rejectAll() {
    writeConsent({ necessary: true, analytics: false, marketing: false });
    setVisible(false);
  }

  function saveCustom() {
    writeConsent({ necessary: true, analytics, marketing });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6" role="dialog" aria-live="polite" aria-label="Preferenze cookie">
      <div
        className="mx-auto max-w-3xl rounded-3xl border border-ink-100 bg-white/95 p-6 backdrop-blur-lg sm:p-7"
        style={{ boxShadow: '0 20px 60px -12px rgb(0 0 0 / 0.25)' }}
      >
        {!showDetails ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink-900">Un attimo, prima di continuare</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">
                Usiamo solo i cookie tecnici indispensabili per far funzionare il sito. Nessun cookie di profilazione o pubblicitario, per ora — puoi comunque scegliere tu.{' '}
                <a href="/cookie-policy" className="font-medium text-brand-600 hover:underline">Scopri di più</a>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <button type="button" onClick={() => setShowDetails(true)} className="btn-ghost !px-4 !py-2.5 text-sm">
                Personalizza
              </button>
              <button type="button" onClick={rejectAll} className="btn-ghost !px-4 !py-2.5 text-sm">
                Solo necessari
              </button>
              <button type="button" onClick={acceptAll} className="btn-primary !px-5 !py-2.5 text-sm">
                Accetta tutti
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-base font-semibold text-ink-900">Le tue preferenze sui cookie</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-ink-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Necessari</p>
                  <p class="mt-0.5 text-xs text-ink-500">Indispensabili per il funzionamento del sito. Sempre attivi.</p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-500">
                  Sempre attivi
                </span>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-ink-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Statistiche</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Ci aiuterebbero a capire come viene usato il sito. Al momento non sono attivi su Manvitech.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#ed7d31]"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-ink-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Marketing</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Per eventuali future campagne pubblicitarie personalizzate. Non ancora in uso.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#ed7d31]"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2.5">
              <button type="button" onClick={() => setShowDetails(false)} className="btn-ghost !px-4 !py-2.5 text-sm">
                Indietro
              </button>
              <button type="button" onClick={saveCustom} className="btn-primary !px-5 !py-2.5 text-sm">
                Salva preferenze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
