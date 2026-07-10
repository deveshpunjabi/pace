'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { AlertFeed } from '@/components/staff/AlertFeed';
import { OpsMap } from '@/components/staff/OpsMap';
import { SustainabilityMeter } from '@/components/staff/SustainabilityMeter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buildOpsAlerts, fluctuateDensity, initializeSectors } from '@/lib/data/mockData';
import { chatSchema } from '@/lib/validators/schemas';
import type { Message, StadiumSector } from '@/types';

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

export function StaffDashboard(): React.ReactElement {
  const [sectors, setSectors] = useState<StadiumSector[]>(() => initializeSectors());
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'PACE staff copilot online. Monitoring crowd density, multilingual wayfinding, and HVAC opportunities.' }
  ]);
  const [input, setInput] = useState<string>('Generate mitigation for East Concourse and sustainability actions for low-density sectors.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const alerts = useMemo(() => buildOpsAlerts(sectors), [sectors]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSectors((current) => fluctuateDensity(current));
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextMessages: Message[] = [...messages, { role: 'user' as const, content: input }].slice(-10);
    const payload = { messages: nextMessages, language: 'en' as const, userRole: 'staff' as const };
    const parsed = chatSchema.safeParse(payload);

    if (!parsed.success) {
      setError('Staff prompt must be 1-500 characters and match the secure chat schema.');
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
        throw new Error('PACE staff request failed');
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
      setError('PACE could not stream a staff response. Keep active SOPs in place and retry.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.75fr)_minmax(560px,1.45fr)_minmax(300px,0.8fr)]">
      <Card>
        <CardContent className="grid h-full gap-4 p-4">
          <section aria-labelledby="staff-chat-heading" className="grid gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">AI Copilot</p>
              <h1 id="staff-chat-heading" className="text-2xl font-black text-white">Staff Command</h1>
            </div>
            <ScrollArea className="h-[460px] rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div aria-live="polite" aria-label="PACE staff conversation" className="grid gap-3" role="log">
                {messages.slice(-10).map((message, index) => (
                  <article className="rounded-lg bg-slate-800 p-3" key={`${message.role}-${index}-${message.content.slice(0, 10)}`}>
                    <span className="text-xs font-black uppercase text-cyan-200">{message.role === 'user' ? 'Operator' : 'PACE'}</span>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content || 'Streaming...'}</p>
                  </article>
                ))}
              </div>
            </ScrollArea>
            <form className="grid gap-2" onSubmit={handleSubmit}>
              <label className="text-sm font-bold text-slate-300" htmlFor="staff-message">Ask PACE for mitigation or sustainability guidance</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input id="staff-message" maxLength={500} onChange={(event) => setInput(event.target.value)} value={input} />
                <Button aria-label="Send staff prompt" disabled={isLoading} type="submit" variant="danger">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              {error ? <p className="text-sm font-semibold text-red-300" role="alert">{error}</p> : null}
            </form>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <OpsMap sectors={sectors} />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <SustainabilityMeter sectors={sectors} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertFeed alerts={alerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
