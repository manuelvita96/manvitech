import { useEffect, useRef, useState, type FormEvent } from 'react';

// Minigame in stile "visual novel": Bit e un secondo personaggio (che
// rappresenta l'utente, "Tu") si alternano sul palco. Il riquadro di dialogo
// mostra il testo con un effetto macchina da scrivere; una volta finito,
// sotto compaiono le scelte (o un campo di testo, o il form finale) come in
// un menu di gioco. Stesso meccanismo di raccolta dati e invio Netlify Forms
// di prima, solo con una veste completamente diversa.

type Phase =
  | 'greeting'
  | 'hasSite'
  | 'siteProblem'
  | 'businessType'
  | 'targetAudience'
  | 'timeline'
  | 'summary'
  | 'done';

type Speaker = 'bit' | 'user';

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

const PHASE_STEP: Record<Phase, number> = {
  greeting: 1,
  hasSite: 2,
  siteProblem: 3,
  businessType: 3,
  targetAudience: 4,
  timeline: 5,
  summary: 6,
  done: 6,
};
const TOTAL_STEPS = 6;

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
  return `Ecco cosa mi sembra di capire, ${firstName || 'ciao'}: ti serve ${need}, pensato soprattutto per ${target}, ${timelinePhrase}. Scrivimi qui sotto la tua email (e il telefono, se vuoi): ci pensiamo noi! 🙂`;
}

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

// --- Personaggi -------------------------------------------------------

function BitCharacter({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 160 190" className="h-24 w-24 sm:h-32 sm:w-32" aria-hidden="true">
      <defs>
        <linearGradient id="bit-char-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ED7D31" />
          <stop offset="1" stopColor="#F0396A" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="178" rx="38" ry="7" fill="#171717" opacity="0.1" />
      <rect x="18" y="80" width="18" height="46" rx="9" fill="url(#bit-char-grad)" />
      <g className={active ? 'bit-char-wave' : ''} style={{ transformOrigin: '134px 90px' }}>
        <rect x="124" y="65" width="18" height="46" rx="9" fill="url(#bit-char-grad)" />
      </g>
      <rect x="40" y="45" width="80" height="95" rx="20" fill="white" />
      <rect x="40" y="45" width="80" height="22" rx="20" fill="url(#bit-char-grad)" />
      <circle cx="55" cy="56" r="3" fill="white" opacity="0.9" />
      <circle cx="66" cy="56" r="3" fill="white" opacity="0.6" />
      <circle cx="68" cy="105" r="6.5" fill="#171717" />
      <circle cx="92" cy="105" r="6.5" fill="#171717" />
      <circle cx="71" cy="102" r="1.8" fill="white" />
      <circle cx="95" cy="102" r="1.8" fill="white" />
      <path d="M64 122c6 10 26 10 32 0" stroke="#171717" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <line x1="80" y1="45" x2="80" y2="25" stroke="url(#bit-char-grad)" strokeWidth="4" strokeLinecap="round" />
      <circle className="bit-char-pulse" cx="80" cy="18" r="8" fill="url(#bit-char-grad)" />
      <rect x="58" y="150" width="18" height="14" rx="6" fill="#262626" opacity="0.85" />
      <rect x="84" y="150" width="18" height="14" rx="6" fill="#262626" opacity="0.85" />
    </svg>
  );
}

function UserCharacter({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 160 190" className="h-24 w-24 sm:h-32 sm:w-32" aria-hidden="true">
      <ellipse cx="80" cy="178" rx="38" ry="7" fill="#171717" opacity="0.1" />
      <g className={active ? 'user-char-point' : ''} style={{ transformOrigin: '26px 90px' }}>
        <rect x="18" y="70" width="17" height="44" rx="8.5" fill="#F0396A" opacity="0.85" />
      </g>
      <rect x="124" y="80" width="17" height="44" rx="8.5" fill="#ED7D31" opacity="0.85" />
      <path d="M40 50 q40 -22 80 0 v55 q0 30 -40 38 q-40 -8 -40 -38 Z" fill="white" stroke="#E5E5E5" strokeWidth="3" />
      <path d="M62 138 q18 14 36 0 l-8 20 q-10 8 -20 0 Z" fill="white" stroke="#E5E5E5" strokeWidth="3" />
      <circle cx="66" cy="92" r="6.5" fill="#171717" />
      <circle cx="94" cy="92" r="6.5" fill="#171717" />
      <circle cx="69" cy="89" r="1.8" fill="white" />
      <circle cx="97" cy="89" r="1.8" fill="white" />
      <path d="M64 108c6 9 26 9 32 0" stroke="#171717" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="52" cy="105" r="7" fill="#ED7D31" opacity="0.35" />
      <circle cx="108" cy="105" r="7" fill="#ED7D31" opacity="0.35" />
    </svg>
  );
}

function ChoiceMenu({
  options,
  onSelect,
}: {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className="choice-btn flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm font-medium text-ink-700 transition-all hover:translate-x-1 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span className="text-brand-500">▸</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function BitAdvisor() {
  const [phase, setPhase] = useState<Phase>('greeting');
  const [data, setData] = useState<FormState>(initialData);
  const [speaker, setSpeaker] = useState<Speaker>('bit');
  const [shownText, setShownText] = useState('');
  const [fullText, setFullText] = useState('');
  const [isTypingText, setIsTypingText] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [siteUrlInput, setSiteUrlInput] = useState('');
  const [pendingProblem, setPendingProblem] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const typingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDoneRef = useRef<(() => void) | undefined>(undefined);

  function sayLine(who: Speaker, text: string, onDone?: () => void) {
    if (typingInterval.current) clearInterval(typingInterval.current);
    setSpeaker(who);
    setFullText(text);
    setShownText('');
    setIsTypingText(true);
    setShowInput(false);
    onDoneRef.current = onDone;
    let i = 0;
    typingInterval.current = setInterval(() => {
      i += 1;
      setShownText(text.slice(0, i));
      if (i >= text.length) {
        if (typingInterval.current) clearInterval(typingInterval.current);
        setIsTypingText(false);
        const cb = onDoneRef.current;
        onDoneRef.current = undefined;
        cb?.();
      }
    }, 16);
  }

  function skipTyping() {
    if (!isTypingText) return;
    if (typingInterval.current) clearInterval(typingInterval.current);
    setShownText(fullText);
    setIsTypingText(false);
    const cb = onDoneRef.current;
    onDoneRef.current = undefined;
    cb?.();
  }

  // Ad ogni cambio di fase, Bit "recita" la sua battuta; al termine
  // dell'effetto macchina da scrivere compaiono le scelte per l'utente.
  useEffect(() => {
    if (phase === 'done') return;
    setShowInput(false);
    const t = setTimeout(() => {
      sayLine('bit', getBotMessage(phase, data), () => setShowInput(true));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => {
    if (typingInterval.current) clearInterval(typingInterval.current);
  }, []);

  function advanceAfter(userLabel: string, updated: FormState, next: Phase) {
    setData(updated);
    sayLine('user', userLabel, () => {
      setTimeout(() => setPhase(next), 500);
    });
  }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setNameInput('');
    advanceAfter(trimmed, { ...data, name: trimmed }, 'hasSite');
  }

  function handleHasSite(value: string) {
    const updated = { ...data, hasSite: value };
    const next: Phase = value === 'ha-gia-sito' ? 'siteProblem' : 'businessType';
    advanceAfter(findLabel(HAS_SITE_OPTIONS, value), updated, next);
  }

  function handleSiteProblemContinue() {
    if (!pendingProblem) return;
    let label = findLabel(SITE_PROBLEM_OPTIONS, pendingProblem);
    if (siteUrlInput.trim()) label += ` — ${siteUrlInput.trim()}`;
    advanceAfter(label, { ...data, siteProblem: pendingProblem, siteUrl: siteUrlInput.trim() }, 'targetAudience');
  }

  function handleBusinessType(value: string) {
    advanceAfter(findLabel(BUSINESS_TYPE_OPTIONS, value), { ...data, businessType: value }, 'targetAudience');
  }

  function handleTargetAudience(value: string) {
    advanceAfter(findLabel(TARGET_AUDIENCE_OPTIONS, value), { ...data, targetAudience: value }, 'timeline');
  }

  function handleTimeline(value: string) {
    advanceAfter(findLabel(TIMELINE_OPTIONS, value), { ...data, timeline: value }, 'summary');
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
      setStatus('success');
      const firstName = data.name.trim().split(' ')[0];
      sayLine('bit', `Fatto${firstName ? `, ${firstName}` : ''}! 🎉 Ho passato tutto al team: ti ricontattiamo entro 24 ore lavorative.`);
      setPhase('done');
    } catch {
      setStatus('error');
    }
  }

  const stepNumber = PHASE_STEP[phase];

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Barra di avanzamento, in stile livello di gioco */}
      <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50/60 px-4 py-2.5 sm:px-6">
        <span className="text-xs font-semibold text-ink-400">Passo {stepNumber}/{TOTAL_STEPS}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(stepNumber / TOTAL_STEPS) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))',
            }}
          />
        </div>
      </div>

      {/* Palco: i due personaggi, uno di fronte all'altro */}
      <div
        className="relative h-48 overflow-hidden sm:h-56"
        style={{ background: 'linear-gradient(180deg, var(--color-brand-50), white)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-8 h-px bg-ink-100"
        />
        <div
          className={`absolute bottom-3 left-3 transition-all duration-300 sm:left-6 ${
            speaker === 'bit' ? 'scale-100 opacity-100' : 'scale-90 opacity-50 grayscale-[0.2]'
          }`}
        >
          <BitCharacter active={speaker === 'bit'} />
        </div>
        <div
          className={`absolute bottom-3 right-3 transition-all duration-300 sm:right-6 ${
            speaker === 'user' ? 'scale-100 opacity-100' : 'scale-90 opacity-50 grayscale-[0.2]'
          }`}
        >
          <UserCharacter active={speaker === 'user'} />
        </div>
      </div>

      {/* Riquadro di dialogo */}
      <div
        onClick={skipTyping}
        className="relative mx-4 -mt-7 cursor-pointer rounded-2xl border border-ink-100 bg-white p-4 sm:mx-6 sm:p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{
            background:
              speaker === 'bit'
                ? 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))'
                : '#262626',
          }}
        >
          {speaker === 'bit' ? 'Bit' : 'Tu'}
        </span>
        <p className="mt-2 min-h-[3.2rem] text-sm leading-relaxed text-ink-800 sm:text-base">
          {shownText}
          {isTypingText && <span className="dialogue-caret">▍</span>}
        </p>
      </div>

      {/* Area risposte: scelte, campo di testo, o form finale */}
      <div className="px-4 pb-5 pt-4 sm:px-6">
        {showInput && phase === 'greeting' && (
          <div className="flex gap-2">
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

        {showInput && phase === 'hasSite' && <ChoiceMenu options={HAS_SITE_OPTIONS} onSelect={handleHasSite} />}

        {showInput && phase === 'siteProblem' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {SITE_PROBLEM_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingProblem(opt.value)}
                  className={`choice-btn flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    pendingProblem === opt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="text-brand-500">▸</span>
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              value={siteUrlInput}
              onChange={(e) => setSiteUrlInput(e.target.value)}
              placeholder="Link del tuo sito, se vuoi (facoltativo)"
              className="w-full rounded-full border border-ink-200 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
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

        {showInput && phase === 'businessType' && (
          <ChoiceMenu options={BUSINESS_TYPE_OPTIONS} onSelect={handleBusinessType} />
        )}
        {showInput && phase === 'targetAudience' && (
          <ChoiceMenu options={TARGET_AUDIENCE_OPTIONS} onSelect={handleTargetAudience} />
        )}
        {showInput && phase === 'timeline' && <ChoiceMenu options={TIMELINE_OPTIONS} onSelect={handleTimeline} />}

        {showInput && phase === 'summary' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
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

        {phase === 'done' && status === 'success' && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
            <span>🎉</span>
            <span>Missione compiuta! Ti ricontattiamo presto.</span>
          </div>
        )}
      </div>

      <style>{`
        .dialogue-caret { animation: caret-blink 0.9s steps(1) infinite; color: var(--color-brand-500); }
        @keyframes caret-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }

        .choice-btn { animation: choice-in 0.35s ease-out backwards; }
        @keyframes choice-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .bit-char-wave { animation: bit-char-wave 1.6s ease-in-out infinite; }
        @keyframes bit-char-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-12deg); }
        }
        .bit-char-pulse { animation: bit-char-pulse 2.2s ease-in-out infinite; transform-origin: center; }
        @keyframes bit-char-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.18); }
        }
        .user-char-point { animation: user-char-point 1.6s ease-in-out infinite; }
        @keyframes user-char-point {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(14deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .dialogue-caret, .choice-btn, .bit-char-wave, .bit-char-pulse, .user-char-point {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
