import { useEffect, useRef, useState, type FormEvent } from 'react';

// Chat guidata con "Bit", la mascotte: alterna messaggi automatici (con un
// piccolo indicatore "sta scrivendo...") a risposte dell'utente via bottoni
// o campi di testo. L'ultimo messaggio di Bit contiene il mini-form finale
// (email/telefono/privacy) che invia i dati raccolti durante la
// conversazione via Netlify Forms — stesso meccanismo del wizard in /contatti,
// ma con un form a sé stante ("chiedi-a-bit").

type Phase =
  | 'greeting'
  | 'hasSite'
  | 'siteProblem'
  | 'businessType'
  | 'targetAudience'
  | 'timeline'
  | 'summary'
  | 'done';

type Sender = 'bit' | 'user';
interface ChatMessage {
  id: string;
  from: Sender;
  content: string;
}

interface FormState {
  name: string;
  hasSite: string;
  siteProblem: string;
  siteUrl: string;
  businessType: string;
  targetAudience: string;
  timeline: string;
  email: string;
  phone: string;
  privacyConsent: boolean;
}

const initialData: FormState = {
  name: '',
  hasSite: '',
  siteProblem: '',
  siteUrl: '',
  businessType: '',
  targetAudience: '',
  timeline: '',
  email: '',
  phone: '',
  privacyConsent: false,
};

const HAS_SITE_OPTIONS = [
  { value: 'ha-gia-sito', label: 'Ho già un sito' },
  { value: 'parto-da-zero', label: 'Parto da zero' },
  { value: 'non-sono-sicuro', label: 'Non sono sicuro/a' },
];

const SITE_PROBLEM_OPTIONS = [
  { value: 'lento', label: 'È lento' },
  { value: 'vecchio', label: 'Ha un design vecchio' },
  { value: 'pochi-clienti', label: 'Non porta clienti' },
  { value: 'non-so', label: 'Non saprei dire' },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'negozio-locale', label: 'Negozio o attività locale' },
  { value: 'libero-professionista', label: 'Libero professionista' },
  { value: 'azienda-b2b', label: 'Azienda B2B' },
  { value: 'altro', label: 'Altro' },
];

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'privati', label: 'Privati e famiglie' },
  { value: 'aziende', label: 'Altre aziende (B2B)' },
  { value: 'turisti', label: 'Turisti e visitatori' },
  { value: 'misto', label: 'Un po’ di tutto' },
];

const TIMELINE_OPTIONS = [
  { value: 'subito', label: 'Il prima possibile' },
  { value: '1-2-mesi', label: 'Nei prossimi 1-2 mesi' },
  { value: 'valutando', label: 'Sto solo valutando' },
];

function findLabel(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

// Piccolo avatar di Bit, in stile "pannello browser con volto", coerente con
// l'illustrazione più grande usata nell'hero della pagina.
function BitFace() {
  return (
    <svg viewBox="0 0 100 100" className="h-9 w-9 flex-none" aria-hidden="true">
      <defs>
        <linearGradient id="bit-face-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ED7D31" />
          <stop offset="1" stopColor="#F0396A" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="22" fill="white" />
      <rect x="8" y="8" width="84" height="20" rx="22" fill="url(#bit-face-grad)" />
      <circle cx="24" cy="18" r="3" fill="white" opacity="0.9" />
      <circle cx="34" cy="18" r="3" fill="white" opacity="0.6" />
      <circle cx="30" cy="58" r="6" fill="#171717" />
      <circle cx="70" cy="58" r="6" fill="#171717" />
      <path d="M35 70c6 9 24 9 30 0" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2.5">
      <BitFace />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-ink-50 px-4 py-3.5">
        <span className="bit-dot h-2 w-2 rounded-full bg-ink-300" />
        <span className="bit-dot h-2 w-2 rounded-full bg-ink-300" style={{ animationDelay: '0.15s' }} />
        <span className="bit-dot h-2 w-2 rounded-full bg-ink-300" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

function OptionButtons({
  options,
  onSelect,
}: {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="ml-11 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function buildSummary(data: FormState) {
  const firstName = data.name.trim().split(' ')[0];
  const need =
    data.hasSite === 'ha-gia-sito'
      ? `dare una bella rinfrescata al sito che hai già (il problema principale: ${findLabel(SITE_PROBLEM_OPTIONS, data.siteProblem).toLowerCase()})`
      : `un sito nuovo di zecca per la tua attività (${findLabel(BUSINESS_TYPE_OPTIONS, data.businessType).toLowerCase()})`;
  const target = findLabel(TARGET_AUDIENCE_OPTIONS, data.targetAudience).toLowerCase();
  const timelinePhrase =
    data.timeline === 'subito'
      ? 'e hai fretta di partire'
      : data.timeline === '1-2-mesi'
        ? 'con l’idea di partire nei prossimi 1-2 mesi'
        : 'anche se per ora stai solo valutando';

  return `Ecco cosa mi sembra di capire, ${firstName || 'ciao'}: ti serve ${need}, pensato soprattutto per ${target}, ${timelinePhrase}. Lasciami la tua email (e il telefono, se vuoi) qui sotto: ci pensiamo noi! 🙂`;
}

export default function BitAdvisor() {
  const [phase, setPhase] = useState<Phase>('greeting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [data, setData] = useState<FormState>(initialData);
  const [nameInput, setNameInput] = useState('');
  const [siteUrlInput, setSiteUrlInput] = useState('');
  const [pendingProblem, setPendingProblem] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  function pushMessage(from: Sender, content: string) {
    idCounter.current += 1;
    setMessages((prev) => [...prev, { id: `m${idCounter.current}`, from, content }]);
  }

  // Ad ogni cambio di fase, Bit "scrive" per un attimo e poi manda il
  // messaggio corrispondente: dà un ritmo naturale da conversazione vera.
  useEffect(() => {
    if (phase === 'done') return;
    const text = getBotMessage(phase, data);
    setIsTyping(true);
    const t = setTimeout(
      () => {
        setIsTyping(false);
        pushMessage('bit', text);
      },
      phase === 'greeting' ? 500 : 700
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  function getBotMessage(p: Phase, d: FormState): string {
    const firstName = d.name.trim().split(' ')[0];
    switch (p) {
      case 'greeting':
        return 'Ciao! Sono Bit 👋 Ti aiuto a capire da dove partire con il tuo sito. Come ti chiami?';
      case 'hasSite':
        return `Piacere${firstName ? `, ${firstName}` : ''}! Hai già un sito, o parti da zero?`;
      case 'siteProblem':
        return 'Cosa ti frustra di più del tuo sito attuale?';
      case 'businessType':
        return 'Che tipo di attività hai, o vuoi far conoscere?';
      case 'targetAudience':
        return 'A chi vuoi rivolgerti principalmente?';
      case 'timeline':
        return 'Ultima cosa: quando vorresti partire?';
      case 'summary':
        return buildSummary(d);
      default:
        return '';
    }
  }

  function goNext(current: Phase, updated: FormState) {
    if (current === 'greeting') return setPhase('hasSite');
    if (current === 'hasSite') {
      return setPhase(updated.hasSite === 'ha-gia-sito' ? 'siteProblem' : 'businessType');
    }
    if (current === 'siteProblem' || current === 'businessType') return setPhase('targetAudience');
    if (current === 'targetAudience') return setPhase('timeline');
    if (current === 'timeline') return setPhase('summary');
  }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    pushMessage('user', trimmed);
    setData((d) => ({ ...d, name: trimmed }));
    goNext('greeting', { ...data, name: trimmed });
  }

  function handleHasSite(value: string) {
    pushMessage('user', findLabel(HAS_SITE_OPTIONS, value));
    const updated = { ...data, hasSite: value };
    setData(updated);
    goNext('hasSite', updated);
  }

  function handleSiteProblemSelect(value: string) {
    setPendingProblem(value);
  }

  function handleSiteProblemContinue() {
    if (!pendingProblem) return;
    let label = findLabel(SITE_PROBLEM_OPTIONS, pendingProblem);
    if (siteUrlInput.trim()) label += ` — ${siteUrlInput.trim()}`;
    pushMessage('user', label);
    const updated = { ...data, siteProblem: pendingProblem, siteUrl: siteUrlInput.trim() };
    setData(updated);
    goNext('siteProblem', updated);
  }

  function handleBusinessType(value: string) {
    pushMessage('user', findLabel(BUSINESS_TYPE_OPTIONS, value));
    const updated = { ...data, businessType: value };
    setData(updated);
    goNext('businessType', updated);
  }

  function handleTargetAudience(value: string) {
    pushMessage('user', findLabel(TARGET_AUDIENCE_OPTIONS, value));
    const updated = { ...data, targetAudience: value };
    setData(updated);
    goNext('targetAudience', updated);
  }

  function handleTimeline(value: string) {
    pushMessage('user', findLabel(TIMELINE_OPTIONS, value));
    const updated = { ...data, timeline: value };
    setData(updated);
    goNext('timeline', updated);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.email || !data.privacyConsent) return;
    setStatus('submitting');
    try {
      const payload: Record<string, string> = {
        'form-name': 'chiedi-a-bit',
        name: data.name,
        hasSite: data.hasSite,
        siteProblem: data.siteProblem,
        siteUrl: data.siteUrl,
        businessType: data.businessType,
        targetAudience: data.targetAudience,
        timeline: data.timeline,
        email: data.email,
        phone: data.phone,
        privacyConsent: data.privacyConsent ? 'true' : 'false',
      };
      const body = new URLSearchParams(payload).toString();
      const res = await fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error('Errore invio');
      const firstName = data.name.trim().split(' ')[0];
      pushMessage(
        'bit',
        `Fatto${firstName ? `, ${firstName}` : ''}! 🎉 Ho passato tutto al team: ti ricontattiamo entro 24 ore lavorative.`
      );
      setStatus('success');
      setPhase('done');
    } catch {
      setStatus('error');
    }
  }

  const showAnswerUI = !isTyping && status !== 'success';

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-4 sm:p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div ref={scrollRef} className="flex max-h-[520px] flex-col gap-4 overflow-y-auto scroll-smooth px-1 py-2 sm:max-h-[560px]">
        {messages.map((m) =>
          m.from === 'bit' ? (
            <div key={m.id} className="flex items-end gap-2.5">
              <BitFace />
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-800 sm:text-base">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div
                className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed text-white sm:text-base"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))' }}
              >
                {m.content}
              </div>
            </div>
          )
        )}

        {isTyping && <TypingBubble />}

        {showAnswerUI && phase === 'greeting' && messages.length > 0 && (
          <div className="ml-11 flex gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Scrivi qui il tuo nome…"
              className="w-full max-w-xs rounded-full border border-ink-200 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Invia
            </button>
          </div>
        )}

        {showAnswerUI && phase === 'hasSite' && messages.length > 0 && (
          <OptionButtons options={HAS_SITE_OPTIONS} onSelect={handleHasSite} />
        )}

        {showAnswerUI && phase === 'siteProblem' && messages.length > 0 && (
          <div className="ml-11 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {SITE_PROBLEM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSiteProblemSelect(opt.value)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                    pendingProblem === opt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              value={siteUrlInput}
              onChange={(e) => setSiteUrlInput(e.target.value)}
              placeholder="Link del tuo sito, se vuoi (facoltativo)"
              className="w-full max-w-sm rounded-full border border-ink-200 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={handleSiteProblemContinue}
              disabled={!pendingProblem}
              className="btn-primary w-fit px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        )}

        {showAnswerUI && phase === 'businessType' && messages.length > 0 && (
          <OptionButtons options={BUSINESS_TYPE_OPTIONS} onSelect={handleBusinessType} />
        )}

        {showAnswerUI && phase === 'targetAudience' && messages.length > 0 && (
          <OptionButtons options={TARGET_AUDIENCE_OPTIONS} onSelect={handleTargetAudience} />
        )}

        {showAnswerUI && phase === 'timeline' && messages.length > 0 && (
          <OptionButtons options={TIMELINE_OPTIONS} onSelect={handleTimeline} />
        )}

        {showAnswerUI && phase === 'summary' && messages.length > 0 && (
          <form onSubmit={handleSubmit} className="ml-11 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              placeholder="La tua email *"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              value={data.phone}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              placeholder="Telefono (facoltativo)"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-ink-600">
              <input
                type="checkbox"
                required
                checked={data.privacyConsent}
                onChange={(e) => setData((d) => ({ ...d, privacyConsent: e.target.checked }))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#ed7d31]"
              />
              <span>
                Ho letto l'<a href="/privacy-policy" target="_blank" className="font-medium text-brand-600 hover:underline">informativa privacy</a> e
                acconsento al trattamento dei miei dati. *
              </span>
            </label>
            <button
              type="submit"
              disabled={!data.email || !data.privacyConsent || status === 'submitting'}
              className="btn-primary w-fit px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'submitting' ? 'Invio in corso…' : 'Invia a Bit'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-600">Qualcosa è andato storto, riprova o scrivici a info@manvitech.it.</p>
            )}
          </form>
        )}
      </div>

      <style>{`
        .bit-dot { animation: bit-dot-bounce 1.2s ease-in-out infinite; }
        @keyframes bit-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
