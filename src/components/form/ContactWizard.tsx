import { useState, useMemo, type FormEvent } from 'react';

type FormData = {
  projectType: string;
  goal: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialData: FormData = {
  projectType: '',
  goal: '',
  budget: '',
  name: '',
  email: '',
  phone: '',
  message: '',
};

const PROJECT_TYPES = [
  { value: 'nuovo-sito', label: 'Un nuovo sito internet' },
  { value: 'restyling', label: 'Restyling di un sito esistente' },
  { value: 'seo', label: 'SEO e visibilità' },
  { value: 'social', label: 'Gestione social' },
  { value: 'altro', label: 'Altro / non sono sicuro' },
];

const GOALS = [
  { value: 'piu-clienti', label: 'Trovare più clienti' },
  { value: 'immagine', label: 'Migliorare la mia immagine online' },
  { value: 'vendite', label: 'Vendere online' },
  { value: 'presenza', label: 'Avere finalmente un sito' },
];

const BUDGETS = [
  { value: 'entro-1000', label: 'Fino a 1.000 €' },
  { value: '1000-3000', label: '1.000 – 3.000 €' },
  { value: '3000-plus', label: 'Oltre 3.000 €' },
  { value: 'da-definire', label: 'Da definire insieme' },
];

function OptionGrid({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string }[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all ${
            value === opt.value
              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
              : 'border-ink-200 text-ink-700 hover:border-brand-300 hover:bg-brand-50/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ContactWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const steps = useMemo(
    () => [
      {
        key: 'projectType',
        question: 'Di cosa hai bisogno?',
        render: () => (
          <OptionGrid
            options={PROJECT_TYPES}
            value={data.projectType}
            onSelect={(v) => {
              setData((d) => ({ ...d, projectType: v }));
              setStep((s) => s + 1);
            }}
          />
        ),
      },
      {
        key: 'goal',
        question: 'Qual è il tuo obiettivo principale?',
        render: () => (
          <OptionGrid
            options={GOALS}
            value={data.goal}
            onSelect={(v) => {
              setData((d) => ({ ...d, goal: v }));
              setStep((s) => s + 1);
            }}
          />
        ),
      },
      {
        key: 'budget',
        question: 'Che budget indicativo hai in mente?',
        render: () => (
          <OptionGrid
            options={BUDGETS}
            value={data.budget}
            onSelect={(v) => {
              setData((d) => ({ ...d, budget: v }));
              setStep((s) => s + 1);
            }}
          />
        ),
      },
      {
        key: 'contact',
        question: 'Come possiamo ricontattarti?',
        render: () => (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
                Nome e cognome *
              </label>
              <input
                id="name"
                required
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="mario@esempio.it"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
                Telefono (opzionale)
              </label>
              <input
                id="phone"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="+39 ..."
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-700">
                Vuoi aggiungere altro? (opzionale)
              </label>
              <textarea
                id="message"
                value={data.message}
                onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="Raccontaci qualcosa in più sul tuo progetto..."
              />
            </div>
          </div>
        ),
      },
    ],
    [data]
  );

  const isLastStep = step === steps.length - 1;
  const progress = Math.round(((step + 1) / steps.length) * 100);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.name || !data.email) return;

    setStatus('submitting');
    try {
      const body = new URLSearchParams({
        'form-name': 'richiesta-preventivo',
        ...data,
      });
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error('Errore invio');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50 p-10 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))' }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-900">Richiesta inviata!</h3>
        <p className="mt-2 text-ink-600">Grazie {data.name.split(' ')[0]}, ti ricontatteremo entro 24 ore lavorative.</p>
      </div>
    );
  }

  return (
    <form
      name="richiesta-preventivo"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-10"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Campi nascosti richiesti da Netlify Forms per il rilevamento in fase di build */}
      <input type="hidden" name="form-name" value="richiesta-preventivo" />
      <p className="hidden">
        <label>
          Non compilare questo campo: <input name="bot-field" />
        </label>
      </p>

      <div className="mb-8 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))' }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-400">
          {step + 1} / {steps.length}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{steps[step].question}</h3>

      <div className="mt-6">{steps[step].render()}</div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`text-sm font-medium text-ink-500 hover:text-ink-800 ${step === 0 ? 'invisible' : ''}`}
        >
          ← Indietro
        </button>

        {isLastStep && (
          <button type="submit" disabled={status === 'submitting'} className="btn-primary disabled:opacity-60">
            {status === 'submitting' ? 'Invio in corso…' : 'Invia richiesta'}
          </button>
        )}
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-red-600">
          Si è verificato un errore nell'invio. Riprova oppure scrivici a info@manvitech.it.
        </p>
      )}
    </form>
  );
}
