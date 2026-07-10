/**
 * @module components/fan/FanChat
 *
 * Multilingual fan concierge chat component. Provides a streaming AI
 * conversation interface with language tabs (EN/ES/FR), quick-action chips,
 * and an ARIA-accessible message log. Communicates with `/api/chat` and
 * streams responses token-by-token for responsive UX.
 */

'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Accessibility, Bot, Bus, Loader2, ScrollText, Send, User, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuickAction } from '@/components/ui/quick-action';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatSchema } from '@/lib/validators/schemas';
import type { Language, Message } from '@/types';

/** Maximum number of messages retained in the visible conversation window. */
const MAX_VISIBLE_MESSAGES = 10;

/** Human-readable labels for each supported language tab. */
const languageLabels: Readonly<Record<Language, string>> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais'
};

/** Initial greeting shown by the assistant for each language. */
const greetings: Readonly<Record<Language, string>> = {
  en: "Hi, I'm PACE. I can help with accessible routes, food and restrooms, transit, sustainability, and stadium rules.",
  es: 'Hola, soy PACE. Puedo ayudarte con rutas accesibles, comida y banos, transporte, sostenibilidad y reglas del estadio.',
  fr: 'Bonjour, je suis PACE. Je peux aider avec les acces, la restauration, le transport, la durabilite et le reglement.'
};

/** A quick-action chip definition with icon, label, and pre-composed query. */
interface QuickPrompt {
  readonly icon: typeof Accessibility;
  readonly label: string;
  readonly query: string;
}

/** Pre-composed quick-action prompts localised per language. */
const quickPrompts: Readonly<Record<Language, readonly QuickPrompt[]>> = {
  en: [
    {
      icon: Accessibility,
      label: 'Accessible route',
      query: 'I need an accessible route from North Gate to Section 142.'
    },
    {
      icon: Utensils,
      label: 'Food & restrooms',
      query: 'Where is the nearest food stand and restroom with the shortest queue?'
    },
    { icon: Bus, label: 'Transit', query: 'What is the fastest transit option after the match?' },
    { icon: ScrollText, label: 'Stadium rules', query: 'What items are not allowed inside the stadium?' }
  ],
  es: [
    {
      icon: Accessibility,
      label: 'Ruta accesible',
      query: 'Necesito una ruta accesible desde North Gate a Section 142.'
    },
    { icon: Utensils, label: 'Comida y banos', query: 'Donde esta la comida y el bano mas cercano con menos fila?' },
    { icon: Bus, label: 'Transporte', query: 'Cual es la opcion de transporte mas rapida despues del partido?' },
    { icon: ScrollText, label: 'Reglas', query: 'Que articulos no estan permitidos dentro del estadio?' }
  ],
  fr: [
    {
      icon: Accessibility,
      label: 'Acces PMR',
      query: 'Je cherche une route accessible de North Gate vers Section 142.'
    },
    {
      icon: Utensils,
      label: 'Repas & toilettes',
      query: 'Ou se trouve le stand et les toilettes les plus proches avec le moins d attente ?'
    },
    { icon: Bus, label: 'Transport', query: 'Quelle est l option de transport la plus rapide apres le match ?' },
    { icon: ScrollText, label: 'Reglement', query: 'Quels objets sont interdits dans le stade ?' }
  ]
};

/**
 * Reads a streaming fetch response and emits tokens to a callback as they
 * arrive. Falls back to full-text read if no readable stream is available.
 *
 * @param response - The fetch response with a readable body.
 * @param onToken - Callback invoked with each decoded text chunk.
 */
async function readStream(response: Response, onToken: (token: string) => void): Promise<void> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onToken(await response.text());
    return;
  }

  let done = false;

  while (!done) {
    const result = await reader.read();
    done = result.done;

    if (result.value) {
      onToken(decoder.decode(result.value, { stream: !done }));
    }
  }
}

/** Multilingual fan concierge chat interface with streaming AI responses. */
export function FanChat(): React.ReactElement {
  const [language, setLanguage] = useState<Language>('es');
  const [input, setInput] = useState<string>(quickPrompts.es[0].query);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: greetings.es }]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const visibleMessages = useMemo(() => messages.slice(-MAX_VISIBLE_MESSAGES), [messages]);

  async function send(text: string): Promise<void> {
    const trimmed = text.trim();
    const nextMessages: Message[] = [...messages, { role: 'user' as const, content: trimmed }].slice(
      -MAX_VISIBLE_MESSAGES
    );
    const payload = { messages: nextMessages, language, userRole: 'fan' as const };
    const parsed = chatSchema.safeParse(payload);

    if (!parsed.success) {
      setError('Message must be 1-500 characters and include a valid language.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });

      if (!response.ok) {
        throw new Error(`PACE request failed with status ${response.status}`);
      }

      await readStream(response, (token) => {
        setMessages((current) => {
          const copy = [...current];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: `${last.content}${token}` };
          return copy.slice(-MAX_VISIBLE_MESSAGES);
        });
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FanChat] Stream error:', message);
      setError('PACE could not stream a response. Try again from the nearest help desk or volunteer point.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void send(input);
  }

  function handleLanguageChange(nextLanguage: Language): void {
    setLanguage(nextLanguage);
    setInput(quickPrompts[nextLanguage][0].query);
    setMessages([{ role: 'assistant', content: greetings[nextLanguage] }]);
  }

  return (
    <section className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-3" aria-labelledby="fan-chat-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">Fan Concierge</p>
            <h1 id="fan-chat-heading" className="text-xl font-black text-white">
              PACE Assistant
            </h1>
          </div>
        </div>
        <div className="flex gap-1.5" role="tablist" aria-label="Language selector">
          {(Object.keys(languageLabels) as Language[]).map((code) => (
            <button
              aria-label={`Switch language to ${languageLabels[code]}`}
              aria-selected={language === code}
              className={
                language === code
                  ? 'rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-2.5 py-1 text-xs font-bold text-slate-950'
                  : 'glass rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white'
              }
              key={code}
              onClick={() => handleLanguageChange(code)}
              role="tab"
              type="button"
            >
              {languageLabels[code]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts[language].map(({ icon: Icon, label, query }) => (
          <QuickAction
            disabled={isLoading}
            icon={<Icon className="h-3.5 w-3.5" />}
            key={label}
            label={label}
            onClick={() => void send(query)}
          />
        ))}
      </div>

      <ScrollArea className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div aria-live="polite" aria-label="PACE fan conversation" className="grid gap-3" role="log">
          {visibleMessages.map((message, index) => {
            const isUser = message.role === 'user';

            return (
              <article
                className={isUser ? 'flex flex-row-reverse items-start gap-2' : 'flex items-start gap-2'}
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
              >
                <span
                  aria-hidden="true"
                  className={
                    isUser
                      ? 'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-400/20 text-cyan-200'
                      : 'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-400/20 text-emerald-200'
                  }
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={
                    isUser
                      ? 'max-w-[82%] rounded-2xl rounded-tr-sm bg-cyan-400/90 px-3.5 py-2.5 text-sm leading-6 text-slate-950'
                      : 'max-w-[82%] rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5 text-sm leading-6 text-slate-100'
                  }
                >
                  {message.content || (
                    <span className="inline-flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Streaming...
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </ScrollArea>

      <form className="grid gap-2" onSubmit={handleSubmit}>
        <label className="text-xs font-semibold text-slate-400" htmlFor="fan-message">
          Ask about routes, accessibility, transit, food, or stadium rules
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            aria-describedby={error ? 'fan-chat-error' : undefined}
            id="fan-message"
            maxLength={500}
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
          <Button aria-label="Send fan message" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {error ? (
          <p className="text-sm font-semibold text-red-300" id="fan-chat-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
