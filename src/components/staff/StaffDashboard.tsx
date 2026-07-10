'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import { AlertFeed } from '@/components/staff/AlertFeed';
import { KpiBar } from '@/components/staff/KpiBar';
import { OpsMap } from '@/components/staff/OpsMap';
import { SustainabilityMeter } from '@/components/staff/SustainabilityMeter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuickAction } from '@/components/ui/quick-action';
import { ScrollArea } from '@/components/ui/scroll-area';
import { applyAlertAction, computeKpis, deriveAlerts } from '@/lib/services/opsService';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';
import { chatSchema } from '@/lib/validators/schemas';
import type { Message, OpsAlert, StadiumSector } from '@/types';

const quickCommands = [
  'Generate a mitigation plan for the busiest sector.',
  'Draft a trilingual gate announcement for a redirect.',
  'Recommend sustainability actions for idle sectors.'
];

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
  const [sectors, setSectors] = useState<StadiumSector[]>(() => generateLiveSignals());
  const [executedIds, setExecutedIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'PACE staff copilot online. Monitoring crowd density, multilingual wayfinding, and HVAC opportunities.'
    }
  ]);
  const [input, setInput] = useState<string>(quickCommands[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState<boolean>(false);

  const alerts = useMemo(() => deriveAlerts(sectors), [sectors]);
  const kpis = useMemo(() => computeKpis(sectors, alerts), [sectors, alerts]);

  useEffect(() => {
    if (paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSectors(generateLiveSignals(Date.now()));
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [paused]);

  function handleExecute(alert: OpsAlert): void {
    // Apply the AI action to live state and briefly pause the feed so the
    // operator can see the decision loop resolve before signals resume.
    setSectors((current) => applyAlertAction(current, alert));
    setExecutedIds((current) => (current.includes(alert.id) ? current : [...current, alert.id]));
    setPaused(true);
    window.setTimeout(() => setPaused(false), 9000);
  }

  async function send(text: string): Promise<void> {
    const nextMessages: Message[] = [...messages, { role: 'user' as const, content: text.trim() }].slice(-10);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="grid gap-4">
      <KpiBar kpis={kpis} />

      <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(420px,1.3fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardContent className="grid gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">AI Copilot</p>
                <h1 className="text-xl font-black text-white">Staff Command</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickCommands.map((command) => (
                <QuickAction
                  disabled={isLoading}
                  key={command}
                  label={command.split(' ').slice(0, 3).join(' ')}
                  onClick={() => void send(command)}
                />
              ))}
            </div>

            <ScrollArea className="h-[360px] rounded-xl border border-white/10 bg-slate-950/50 p-3">
              <div aria-live="polite" aria-label="PACE staff conversation" className="grid gap-3" role="log">
                {messages.slice(-10).map((message, index) => (
                  <article
                    className="rounded-xl bg-white/5 p-3"
                    key={`${message.role}-${index}-${message.content.slice(0, 10)}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wide text-cyan-200">
                      {message.role === 'user' ? 'Operator' : 'PACE'}
                    </span>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                      {message.content || 'Streaming...'}
                    </p>
                  </article>
                ))}
              </div>
            </ScrollArea>

            <form className="grid gap-2" onSubmit={handleSubmit}>
              <label className="text-xs font-semibold text-slate-400" htmlFor="staff-message">
                Ask PACE for mitigation or sustainability guidance
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  id="staff-message"
                  maxLength={500}
                  onChange={(event) => setInput(event.target.value)}
                  value={input}
                />
                <Button aria-label="Send staff prompt" disabled={isLoading} type="submit" variant="danger">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {error ? (
                <p className="text-sm font-semibold text-red-300" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <OpsMap sectors={sectors} />
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="p-4">
              <AlertFeed alerts={alerts} executedIds={executedIds} onExecute={handleExecute} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <SustainabilityMeter sectors={sectors} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
