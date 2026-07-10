'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Languages, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatSchema } from '@/lib/validators/schemas';
import type { Language, Message } from '@/types';

const languageLabels: Record<Language, string> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais'
};

const starterMessages: Record<Language, string> = {
  en: 'I need an accessible route from North Gate to Section 142.',
  es: 'Necesito una ruta accesible desde North Gate a Section 142.',
  fr: 'Je cherche une route accessible de North Gate vers Section 142.'
};

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

export function FanChat(): React.ReactElement {
  const [language, setLanguage] = useState<Language>('es');
  const [input, setInput] = useState<string>(starterMessages.es);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola. Soy PACE. Puedo ayudarte con rutas, accesibilidad, transporte, sostenibilidad y reglas del estadio.'
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextMessages: Message[] = [...messages, { role: 'user' as const, content: input }].slice(-10);
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
        throw new Error('PACE request failed');
      }

      await readStream(response, (token) => {
        setMessages((current) => {
          const copy = [...current];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: `${last.content}${token}` };
          return copy.slice(-10);
        });
      });
    } catch {
      setError('PACE could not stream a response. Try again from the nearest help desk or volunteer point.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLanguageChange(nextLanguage: Language): void {
    setLanguage(nextLanguage);
    setInput(starterMessages[nextLanguage]);
  }

  return (
    <section className="grid h-full gap-4" aria-labelledby="fan-chat-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Fan Concierge</p>
          <h1 id="fan-chat-heading" className="text-2xl font-black text-white">PACE Assistant</h1>
        </div>
        <Languages className="h-6 w-6 text-cyan-300" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Language selector">
        {(Object.keys(languageLabels) as Language[]).map((code) => (
          <Button
            aria-label={`Switch language to ${languageLabels[code]}`}
            aria-selected={language === code}
            key={code}
            onClick={() => handleLanguageChange(code)}
            role="tab"
            type="button"
            variant={language === code ? 'primary' : 'secondary'}
          >
            {languageLabels[code]}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[48vh] rounded-lg border border-slate-800 bg-slate-950/80 p-4">
        <div aria-live="polite" aria-label="PACE fan conversation" className="grid gap-3" role="log">
          {visibleMessages.map((message, index) => (
            <article
              className={message.role === 'user' ? 'ml-auto max-w-[86%] rounded-lg bg-cyan-300 p-3 text-slate-950' : 'mr-auto max-w-[86%] rounded-lg bg-slate-800 p-3 text-slate-100'}
              key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            >
              <span className="block text-xs font-black uppercase opacity-70">{message.role === 'user' ? 'Fan' : 'PACE'}</span>
              <p className="mt-1 text-sm leading-6">{message.content || 'Streaming...'}</p>
            </article>
          ))}
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-cyan-300" aria-label="PACE is typing" /> : null}
        </div>
      </ScrollArea>

      <form className="grid gap-2" onSubmit={handleSubmit}>
        <label className="text-sm font-bold text-slate-300" htmlFor="fan-message">
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
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {error ? <p className="text-sm font-semibold text-red-300" id="fan-chat-error" role="alert">{error}</p> : null}
      </form>
    </section>
  );
}
