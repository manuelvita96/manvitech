import { useState, useMemo, useRef, type FormEvent } from 'react';

type FormData = {
  name: string;
  serviceType: string;
  serviceDetail: string;
  serviceUrl: string;
  targetAudience: string;
  email: string;
  phone: string;
  contactTime: string;
  privacyConsent: boolean;
};

const initialData: FormData = {
  name: '',
  serviceType: '',
  serviceDetail: '',
  serviceUrl: '',
  targetAudience: '',
  email: '',
  phone: '',
  contactTime: '',
  privacyConsent: false,
};

const SERVICE_TYPES = [
  { value: 'nuovo-sito', label: 'Un nuovo sito internet' },
  { value: 'consulenza-sito-esistente', label: 'Consulenza sul mio sito attuale' },
  { value: 'seo', label: 'SEO e visibilità su Google' },
  { value: 'social', label: 'Gestione dei social' },
  { value: 'design', label: "Design e immagine del brand" },
  { value: 'manutenzione', label: 'Manutenzione e assistenza' },
  { value: 'altro', label: 'Non sono sicuro/a' },
];

const TARGET_AUDIENCE = [
  { value: 'privati', label: 'Privati e famiglie' },
  { value: 'aziende', label: 'Altre aziende (B2B)' },
  { value: 'turisti', label: 'Turisti e visitatori' },
  { value: 'misto', label: 'Un po’ di tutto' },
];

const CONTACT_TIME = [
  { value: 'mattina', label: 'Mattina' },
  { value: 'pomeriggio', label: 'Pomeriggio' },
  { value: 'sera', label: 'Sera' },
  { value: 'quando-capita', label: 'Quando capita' },
];

// Domanda "su misura" in base al servizio scelto: cambia sia le opzioni che,
// in un caso, aggiunge un campo di testo (link del sito) per farci un'idea
// più precisa prima ancora di parlare direttamente col cliente.
const BRANCH_QUESTIONS: Record<
  string,
  { question: string; hint?: string; options: { value: string; label: string }[]; withUrl?: boolean } | null
> = {
  'nuovo-sito': {
    question: 'Che tipo di sito ti serve?',
    options: [
      { value: 'vetrina', label: 'Sito vetrina' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'blog', label: 'Blog / magazine' },
      { value: 'non-so', label: 'Non so ancora' },
    ],
  },
  'consulenza-sito-esistente': {
    question: 'Qual è il problema principale che noti?',
    hint: "Se vuoi, lascia anche il link del tuo sito qui sotto: ci diamo un'occhiata prima di sentirci.",
    withUrl: true,
    options: [
      { value: 'lento', label: 'È lento' },
      { value: 'vecchio', label: 'Ha un design vecchio' },
      { value: 'pochi-clienti', label: 'Non porta clienti' },
      { value: 'non-so', label: 'Non saprei dire' },
    ],
  },
  seo: {
    question: 'Oggi sei visibile su Google?',
    options: [
      { value: 'per-niente', label: 'Non compaio per niente' },
      { value: 'in-fondo', label: 'Compaio, ma in fondo' },
      { value: 'non-so', label: 'Non lo so' },
      { value: 'migliorare', label: 'Sì, ma voglio migliorare' },
    ],
  },
  social: {
    question: 'Quali social ti interessano di più?',
    options: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'non-deciso', label: 'Non ho ancora deciso' },
    ],
  },
  design: {
    question: "A che punto sei con l'immagine del tuo brand?",
    options: [
      { value: 'tutto-pronto', label: 'Ho già tutto pronto' },
      { value: 'solo-logo', label: 'Ho solo il logo' },
      { value: 'da-zero', label: 'Devo partire da zero' },
      { value: 'non-so', label: 'Non sono sicuro/a' },
    ],
  },
  manutenzione: {
    question: 'Su che piattaforma è il tuo sito attuale?',
    options: [
      { value: 'wordpress', label: 'WordPress' },
      { value: 'altra-piattaforma', label: "Un'altra piattaforma" },
      { value: 'artigianale', label: 'Fatto "in casa" da qualcuno' },
      { value: 'non-so', label: 'Non lo so' },
    ],
  },
  altro: null,
};

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
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const firstName = data.name.trim().split(' ')[0];
  const branch = BRANCH_QUESTIONS[data.serviceType] ?? null;

  // Sequenza di step: nome -> servizio -> [domanda su misura, se presente] -> pubblico -> contatti
  const steps = useMemo(() => {
    const list: { key: string; render: () => any }[] = [
      {
        key: 'name',
        render: () => (
          <div>
            <input
              autoFocus
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && data.name.trim()) setStep((s) => s + 1);
              }}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-lg text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="Il tuo nome"
            />
            <button
              type="button"
              disabled={!data.name.trim()}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        ),
      },
      {
        key: 'serviceType',
        render: () => (
          <OptionGrid
            options={SERVICE_TYPES}
            value={data.serviceType}
            onSelect={(v) => {
              setData((d) => ({ ...d, serviceType: v, serviceDetail: '', serviceUrl: '' }));
              setStep((s) => s + 1);
            }}
          />
        ),
      },
    ];

    if (branch) {
      list.push({
        key: 'branch',
        render: () => (
          <div>
            <OptionGrid
              options={branch.options}
              value={data.serviceDetail}
              onSelect={(v) => setData((d) => ({ ...d, serviceDetail: v }))}
            />
            {branch.withUrl && (
              <input
                name="serviceUrl"
                value={data.serviceUrl}
                onChange={(e) => setData((d) => ({ ...d, serviceUrl: e.target.value }))}
                className="mt-4 w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="Link del tuo sito (facoltativo)"
              />
            )}
            <button
              type="button"
              disabled={!data.serviceDetail}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        ),
      });
    }

    list.push({
      key: 'targetAudience',
      render: () => (
        <OptionGrid
          options={TARGET_AUDIENCE}
          value={data.targetAudience}
          onSelect={(v) => {
            setData((d) => ({ ...d, targetAudience: v }));
            setStep((s) => s + 1);
          }}
        />
      ),
    });

    list.push({
      key: 'contact',
      render: () => (
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
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
              Telefono (facoltativo)
            </label>
            <input
              id="phone"
              name="phone"
              value={data.phone}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="+39 ..."
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Quando preferisci essere ricontattato/a?</p>
            <OptionGrid options={CONTACT_TIME} value={data.contactTime} onSelect={(v) => setData((d) => ({ ...d, contactTime: v }))} />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-4 text-sm text-ink-600">
            <input
              type="checkbox"
              required
              checked={data.privacyConsent}
              onChange={(e) => setData((d) => ({ ...d, privacyConsent: e.target.checked }))}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#ed7d31]"
            />
            <span>
              Ho letto l'<a href="/privacy-policy" target="_blank" className="font-medium text-brand-600 hover:underline">informativa privacy</a> e
              acconsento al trattamento dei miei dati per essere ricontattato/a. *
            </span>
          </label>
        </div>
      ),
    });

    return list;
  }, [data, branch]);

  const isLastStep = step === steps.length - 1;
  const progress = Math.round(((step + 1) / steps.length) * 100);

  // Domanda mostrata sopra ogni step, personalizzata quando possibile.
  const stepTitle = (() => {
    const key = steps[step]?.key;
    switch (key) {
      case 'name':
        return 'Come ti chiami?';
      case 'serviceType':
        return `Piacere${firstName ? `, ${firstName}` : ''}! Di cosa hai bisogno?`;
      case 'branch':
        return branch?.question ?? '';
      case 'targetAudience':
        return 'A chi vuoi rivolgerti principalmente?';
      case 'contact':
        return 'Come possiamo ricontattarti?';
      default:
        return '';
    }
  })();

  const stepHint = steps[step]?.key === 'branch' ? branch?.hint : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.email || !data.privacyConsent || !data.contactTime) return;

    setStatus('submitting');
    try {
      // Costruiamo il body direttamente dallo stato del form (aggiornato ad
      // ogni digitazione/selezione): è la fonte più affidabile, perché in un
      // form a più step nel DOM in un dato momento sono montati solo i campi
      // dello step corrente, mentre lo stato conserva sempre tutti i dati
      // raccolti nei passaggi precedenti.
      const payload: Record<string, string> = {
        'form-name': 'richiesta-preventivo',
        name: data.name,
        serviceType: data.serviceType,
        serviceDetail: data.serviceDetail,
        serviceUrl: data.serviceUrl,
        targetAudience: data.targetAudience,
        email: data.email,
        phone: data.phone,
        contactTime: data.contactTime,
        privacyConsent: data.privacyConsent ? 'true' : 'false',
      };
      const body = new URLSearchParams(payload).toString();

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
        <p className="mt-2 text-ink-600">
          Grazie{firstName ? ` ${firstName}` : ''}, ti ricontattiamo {data.contactTime === 'quando-capita' ? 'appena possibile' : `nella fascia "${CONTACT_TIME.find((c) => c.value === data.contactTime)?.label.toLowerCase()}"`} entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
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

      {/* Campi guidati da bottoni: non hanno un <input> visibile, quindi li
          teniamo sincronizzati qui come hidden, sempre presenti nel DOM del
          form reale, così finiscono sempre nella FormData inviata. */}
      <input type="hidden" name="name" value={data.name} />
      <input type="hidden" name="serviceType" value={data.serviceType} />
      <input type="hidden" name="serviceDetail" value={data.serviceDetail} />
      <input type="hidden" name="targetAudience" value={data.targetAudience} />
      <input type="hidden" name="contactTime" value={data.contactTime} />
      <input type="hidden" name="privacyConsent" value={data.privacyConsent ? 'true' : 'false'} />
      {/* serviceUrl ha già un input reale quando il branch lo prevede; qui il
          fallback nascosto copre i casi in cui quello step non viene mostrato. */}
      {!branch?.withUrl && <input type="hidden" name="serviceUrl" value={data.serviceUrl} />}

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

      <h3 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{stepTitle}</h3>
      {stepHint && <p className="mt-1.5 text-sm text-ink-500">{stepHint}</p>}

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
          <button
            type="submit"
            disabled={status === 'submitting' || !data.privacyConsent || !data.contactTime}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
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
