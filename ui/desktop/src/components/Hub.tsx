/**
 * Hub Component
 *
 * The empty-chat landing screen. Visually it's "Pair with no messages yet" —
 * a large time + greeting above a centered, narrower ChatInput. Submitting
 * creates a session and navigates to /pair so the rest of the chat lifecycle
 * lives there.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from '../i18n';
import { AppEvents } from '../constants/events';
import ChatInput from './ChatInput';
import { ChatInputCard } from './ChatInputCard';
import { ChatState } from '../types/chatState';
import 'react-toastify/dist/ReactToastify.css';
import { View, ViewOptions } from '../utils/navigationUtils';
import { useConfig } from './ConfigContext';
import {
  clearExtensionOverrides,
  getExtensionConfigsWithOverrides,
} from '../store/extensionOverrides';
import { getInitialWorkingDir } from '../utils/workingDir';
import { createSession } from '../sessions';
import LoadingGoose from './LoadingGoose';
import { UserInput } from '../types/message';
import { ScrollText, AlignRight, Code2, Sparkles, ChevronLeft } from 'lucide-react';

type SuggestionCard = {
  icon: typeof ScrollText;
  label: string;
  prompt: string;
  bg: string;
  fg: string;
};

const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    icon: ScrollText,
    label: 'نوشتن مقاله',
    prompt: 'سلام! می‌خواهم یک مقاله بنویسم. لطفاً بپرس موضوعش چیست.',
    bg: 'rgba(37, 99, 235, 0.12)',
    fg: '#2563eb',
  },
  {
    icon: AlignRight,
    label: 'خلاصه‌سازی متن',
    prompt: 'می‌خواهم یک متن را خلاصه کنم. لطفاً بگو متن را بفرستم.',
    bg: 'rgba(19, 187, 175, 0.14)',
    fg: '#0f9d92',
  },
  {
    icon: Code2,
    label: 'نوشتن کد',
    prompt: 'می‌خواهم یک قطعه کد بنویسم. لطفاً بپرس چه کاری باید انجام دهد و با چه زبانی.',
    bg: 'rgba(99, 102, 241, 0.12)',
    fg: '#6366f1',
  },
  {
    icon: Sparkles,
    label: 'ایده‌پردازی',
    prompt: 'به چند ایده‌ی خلاقانه نیاز دارم. لطفاً بپرس درباره‌ی چه موضوعی.',
    bg: 'rgba(217, 154, 43, 0.16)',
    fg: '#c2871a',
  },
];

const i18n = defineMessages({
  goodMorning: { id: 'hub.goodMorning', defaultMessage: 'Good morning' },
  goodAfternoon: { id: 'hub.goodAfternoon', defaultMessage: 'Good afternoon' },
  goodEvening: { id: 'hub.goodEvening', defaultMessage: 'Good evening' },
});

function useClock(locale: string): { time: string; meridiem: string; hour: number } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  // Locale-aware time + day period: Persian gets Persian digits (۱۰:۳۷) and
  // localized markers (ق.ظ / ب.ظ); English keeps 10:37 / AM / PM.
  const parts = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const time = `${part('hour')}:${part('minute')}`;
  const meridiem = part('dayPeriod');
  return { time, meridiem, hour };
}

export default function Hub({
  setView,
}: {
  setView: (view: View, viewOptions?: ViewOptions) => void;
}) {
  const intl = useIntl();
  const { extensionsList } = useConfig();
  const [workingDir, setWorkingDir] = useState(getInitialWorkingDir());
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { time, meridiem, hour } = useClock(intl.locale);

  const greeting = useMemo(() => {
    if (hour < 12) return intl.formatMessage(i18n.goodMorning);
    if (hour < 18) return intl.formatMessage(i18n.goodAfternoon);
    return intl.formatMessage(i18n.goodEvening);
  }, [intl, hour]);

  // rAF is more reliable than autoFocus across async render boundaries.
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleSubmit = async (input: UserInput) => {
    const { msg: userMessage, images } = input;
    if (!(images.length > 0 || userMessage.trim()) || isCreatingSession) return;

    const extensionConfigs = getExtensionConfigsWithOverrides(extensionsList);
    clearExtensionOverrides();
    setIsCreatingSession(true);

    try {
      const session = await createSession(workingDir, {
        extensionConfigs,
        allExtensions: extensionConfigs.length > 0 ? undefined : extensionsList,
      });

      window.dispatchEvent(new CustomEvent(AppEvents.SESSION_CREATED));
      window.dispatchEvent(
        new CustomEvent(AppEvents.ADD_ACTIVE_SESSION, {
          detail: { sessionId: session.id, initialMessage: { msg: userMessage, images } },
        })
      );

      setView('pair', {
        disableAnimation: true,
        resumeSessionId: session.id,
        initialMessage: { msg: userMessage, images },
      });
    } catch (error) {
      console.error('Failed to create session:', error);
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center px-6 relative">
      <div className="w-full max-w-3xl">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-6xl font-light text-text-primary tracking-tight tabular-nums">
            {time}
          </span>
          <span className="text-2xl font-light text-text-secondary">{meridiem}</span>
        </div>
        <p className="text-xl text-text-secondary mb-6">{greeting}</p>

        <ChatInputCard>
          <ChatInput
            sessionId={null}
            handleSubmit={handleSubmit}
            chatState={isCreatingSession ? ChatState.LoadingConversation : ChatState.Idle}
            onStop={() => {}}
            initialValue=""
            setView={setView}
            totalTokens={0}
            accumulatedInputTokens={0}
            accumulatedOutputTokens={0}
            droppedFiles={[]}
            onFilesProcessed={() => {}}
            messages={[]}
            disableAnimation={false}
            toolCount={0}
            onWorkingDirChange={setWorkingDir}
            inputRef={inputRef}
          />
        </ChatInputCard>

        <p className="text-xs text-text-tertiary mt-6 mb-3">یا شروع کنید با:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => handleSubmit({ msg: card.prompt, images: [] })}
                disabled={isCreatingSession}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-border-primary bg-background-secondary text-start transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-border-info disabled:opacity-50 disabled:pointer-events-none"
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: card.bg, color: card.fg }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-text-primary">{card.label}</span>
                <ChevronLeft className="w-4 h-4 text-text-tertiary transition-colors group-hover:text-text-info" />
              </button>
            );
          })}
        </div>
      </div>

      {isCreatingSession && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <LoadingGoose chatState={ChatState.LoadingConversation} />
        </div>
      )}
    </div>
  );
}
