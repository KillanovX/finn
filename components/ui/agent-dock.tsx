"use client";

import {
  ChatIcon,
  MicrophoneIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type AgentDockMode = "idle" | "composing" | "working";

type AgentDockProps = {
  agentName: string;
  avatarSrc: string;
  className?: string;
  idleStatus?: string;
  workingStatus?: string;
  onMessageSubmit?: (message: string) => void | Promise<void>;
};

const dockTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function AgentDock({
  agentName,
  avatarSrc,
  className,
  idleStatus = "Pronta",
  workingStatus = "Raciocinando com Nemotron...",
  onMessageSubmit,
}: AgentDockProps) {
  const [mode, setMode] = useState<AgentDockMode>("idle");
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldReduceMotion = useReducedMotion();

  // Speech-to-Text Integration (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "pt-BR";

        rec.onstart = () => {
          setIsListening(true);
          setMode("composing");
        };

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessage(transcript);
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Speech recognition restart", e);
        }
      } else {
        alert("Navegador não suporta transcrição direta de voz. Digite no campo de texto.");
      }
    }
  }

  function openComposer() {
    setMode("composing");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function submitMessage() {
    const nextMessage = message.trim();
    if (!nextMessage) {
      openComposer();
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setMessage("");
    setMode("working");
    await onMessageSubmit?.(nextMessage);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "composing") {
      void submitMessage();
      return;
    }
    openComposer();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void submitMessage();
  }

  // Keyboard shortcut (V: Voice, C: Chat)
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        toggleVoice();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        openComposer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening]);

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="flex w-full flex-col-reverse overflow-hidden rounded-2xl bg-neutral-950 p-2 text-white shadow-lg border border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            alt=""
            aria-hidden="true"
            className="size-9 shrink-0 rounded-xl object-cover"
            height={36}
            src={avatarSrc}
            width={36}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">
              {agentName}
            </p>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 truncate text-xs text-neutral-400"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                key={mode + (isListening ? "-listening" : "")}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {isListening
                  ? "🎙️ Transcrevendo sua voz..."
                  : mode === "working"
                  ? workingStatus
                  : idleStatus}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <DockButton
              icon={
                <MicrophoneIcon
                  weight="bold"
                  className={isListening ? "animate-pulse text-red-400" : ""}
                />
              }
              label={isListening ? "Ouvindo" : "Voz"}
              shortcut="V"
              onClick={toggleVoice}
              isActive={isListening}
            />
            <DockButton
              icon={
                mode === "composing" ? (
                  <PaperPlaneTiltIcon weight="fill" />
                ) : (
                  <ChatIcon weight="bold" />
                )
              }
              label={mode === "composing" ? "Enviar" : "Chat"}
              shortcut="C"
              type="submit"
            />
          </div>
        </div>
        <motion.div
          animate={{
            height: mode === "composing" ? 120 : 0,
            opacity: mode === "composing" ? 1 : 0,
          }}
          aria-hidden={mode !== "composing"}
          className="overflow-hidden"
          initial={false}
          transition={shouldReduceMotion ? { duration: 0 } : dockTransition}
        >
          <div className="relative mb-2">
            <button
              aria-label="Close composer"
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
              onClick={() => {
                if (isListening) recognitionRef.current?.stop();
                setMode("idle");
              }}
              type="button"
            >
              <XIcon className="size-3.5" weight="bold" />
            </button>
            <textarea
              aria-label="Message agent"
              className="h-28 w-full resize-none bg-transparent px-2 py-2 pr-9 text-sm leading-6 outline-none placeholder:text-neutral-500"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                isListening
                  ? "Fale agora... transcrevendo em tempo real..."
                  : "Digite sua dúvida ou comando aqui..."
              }
              ref={textareaRef}
              value={message}
            />
          </div>
        </motion.div>
      </div>
    </form>
  );
}

function DockButton({
  icon,
  label,
  shortcut,
  type = "button",
  onClick,
  isActive,
}: {
  icon: ReactNode;
  label: string;
  shortcut: string;
  type?: "button" | "submit";
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      className={`flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors cursor-pointer ${
        isActive
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "hover:bg-white/10"
      }`}
      onClick={onClick}
      type={type}
    >
      <span className="size-4 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
      <kbd className="flex size-5 items-center justify-center rounded bg-white/10 font-mono text-[10px]">
        {shortcut}
      </kbd>
    </button>
  );
}

export default AgentDock;
