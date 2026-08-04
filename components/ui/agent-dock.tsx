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
  defaultExpanded?: boolean;
};

const dockTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function AgentDock({
  agentName,
  avatarSrc,
  className,
  idleStatus = "Pronta",
  workingStatus = "Analisando...",
  onMessageSubmit,
  defaultExpanded = false,
}: AgentDockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [mode, setMode] = useState<AgentDockMode>("idle");
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageRef = useRef(message);
  messageRef.current = message;

  const shouldReduceMotion = useReducedMotion();

  // Speech-to-Text Integration (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "pt-BR";

        rec.onstart = () => {
          setIsListening(true);
          setMode("composing");
          setIsExpanded(true);
        };

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessage(transcript);

          // Reset 3s silence timer on each speech result
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (transcript.trim()) {
            silenceTimerRef.current = setTimeout(() => {
              try {
                recognitionRef.current?.stop();
              } catch (e) {}
              setIsListening(false);
              void submitMessage();
            }, 3000);
          }
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };

        rec.onend = () => {
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };

        recognitionRef.current = rec;
      }
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  function toggleVoice() {
    if (!isExpanded) setIsExpanded(true);
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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
    if (!isExpanded) setIsExpanded(true);
    setMode("composing");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function submitMessage() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    const currentMsg = messageRef.current || message;
    const nextMessage = currentMsg.trim();
    if (!nextMessage) {
      openComposer();
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }
    setMessage("");
    messageRef.current = "";
    setMode("working");
    await onMessageSubmit?.(nextMessage);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }
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
  }, [isListening, isExpanded]);

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: isExpanded ? "100%" : "52px",
        borderRadius: isExpanded ? "1rem" : "9999px",
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 160, damping: 24 }
      }
      className={`relative overflow-hidden border-2 border-black bg-neutral-950 text-white shadow-2xl ml-auto ${
        !isExpanded ? "cursor-pointer hover:scale-105 transition-transform" : ""
      }`}
      onClick={() => {
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex w-full flex-col-reverse p-1.5">
          <div className="flex h-10 items-center justify-between gap-2.5">
            {/* Always-mounted avatar circle */}
            <div
              className="relative shrink-0 flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                if (isExpanded) {
                  e.stopPropagation();
                  if (isListening) recognitionRef.current?.stop();
                  setIsExpanded(false);
                }
              }}
              title={isExpanded ? "Recolher Zara" : `Abrir ${agentName}`}
            >
              <img
                alt={agentName}
                className="size-9 rounded-full object-cover shrink-0"
                src={avatarSrc}
              />
              {!isExpanded && (
                <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black">
                  <span className="size-1 rounded-full bg-white animate-pulse" />
                </span>
              )}
            </div>

            {/* Expanded Header Controls */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 items-center justify-between min-w-0 gap-2"
              >
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
                      {isListening ? (
                        <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold">
                          <MicrophoneIcon weight="fill" className="size-3.5 animate-pulse" />
                          Ouvindo (envio automático em 3s de silêncio)...
                        </span>
                      ) : mode === "working" ? (
                        workingStatus
                      ) : (
                        idleStatus
                      )}
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isListening) recognitionRef.current?.stop();
                      setIsExpanded(false);
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    aria-label="Recolher Zara"
                    title="Recolher Zara"
                  >
                    <XIcon className="size-4" weight="bold" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Composer Textarea */}
          {isExpanded && (
            <motion.div
              animate={{
                height: mode === "composing" ? 110 : 0,
                opacity: mode === "composing" ? 1 : 0,
              }}
              aria-hidden={mode !== "composing"}
              className="overflow-hidden"
              initial={false}
              transition={shouldReduceMotion ? { duration: 0 } : dockTransition}
            >
              <div className="relative mb-1 mt-1">
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
                  className="h-24 w-full resize-none bg-transparent px-2 py-2 pr-9 text-sm leading-6 outline-none placeholder:text-neutral-500"
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={
                    isListening
                      ? "Fale agora... envio automático após 3s de silêncio..."
                      : "Digite sua dúvida ou comando (ex: 'mercado 800 nubank')..."
                  }
                  ref={textareaRef}
                  value={message}
                />
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
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
