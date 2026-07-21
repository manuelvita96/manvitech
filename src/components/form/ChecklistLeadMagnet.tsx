import { useState, type FormEvent } from 'react';

export default function ChecklistLeadMagnet() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    try {
      const body = new URLSearchParams({ 'form-name': 'lead-magnet-checklist', email }).toString();
      const res = await fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error('Errore invio');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="font-display text-base font-semibold text-ink-900">Perfetto, eccola qui!</p>
        <a
          href="/downloads/checklist-sito-non-porta-clienti.pdf"
          download
          className="btn-primary mt-4 inline-flex"
        >
          Scarica la checklist (PDF)
        </a>
      </div>
    );
  }

  return (
    <form
      name="lead-magnet-checklist"
      data-netlify="true"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-ink-100 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <input type="hidden" name="form-name" value="lead-magnet-checklist" />
      <p className="font-display text-base font-semibold text-ink-900">
        📋 Checklist gratuita: 10 cose da controllare se il sito non porta clienti
      </p>
      <p className="mt-1.5 text-sm text-ink-500">
        Lasciaci la tua email e te la mandiamo subito — nessuna newsletter, nessuno spam.
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la-tua-email@esempio.it"
          className="flex-1 rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" disabled={status === 'submitting'} className="btn-primary shrink-0 disabled:opacity-60">
          {status === 'submitting' ? 'Un attimo…' : 'Ricevi la checklist'}
        </button>
      </div>
      {status === 'error' && <p className="mt-3 text-sm text-red-600">Qualcosa è andato storto, riprova.</p>}
    </form>
  );
}
