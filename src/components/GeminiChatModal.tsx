import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { EventItem, SummaryStats, ChatMessage, ChatbotPersonaRole } from '../types';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronDown,
  Info,
  HelpCircle,
  TrendingUp,
  HeartHandshake,
  PenTool,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventItem | null;
  stats?: SummaryStats;
}

const PERSONA_CONFIGS: {
  id: ChatbotPersonaRole;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  quickPrompts: string[];
}[] = [
  {
    id: 'ceremony_advisor',
    title: 'ជំនួយការពិធីការ & មង្គលការ',
    shortTitle: 'ពិធីការ & មង្គលការ',
    desc: 'ប្រឹក្សាពិធីប្រពៃណីខ្មែរ កាលវិភាគ កាត់សក់ សំពះពេលា និងការទទួលភ្ញៀវ',
    icon: HeartHandshake,
    accentColor: 'from-rose-500 to-amber-500',
    quickPrompts: [
      'តើកាលវិភាគពិធីមង្គលការពេលព្រឹកខ្មែរមានពិធីអ្វីខ្លះ?',
      'តើពិធីកាត់សក់បង្កក់សិរីមានអត្ថន័យដូចម្តេច និងត្រូវត្រៀមអ្វីខ្លះ?',
      'គន្លឹះរៀបចំទទួលភ្ញៀវពេលល្ងាចឱ្យរលូន និងមិនស្ទះតុ',
    ],
  },
  {
    id: 'gift_analyst',
    title: 'អ្នកវិភាគចំណងដៃ & ថវិកា',
    shortTitle: 'វិភាគចំណងដៃ',
    desc: 'វិភាគទិន្នន័យចំណូលចំណងដៃ ប្រៀបធៀបដុល្លារ-រៀល និងគណនាចំណាយ',
    icon: TrendingUp,
    accentColor: 'from-emerald-500 to-teal-500',
    quickPrompts: [
      'ជួយវិភាគ និងសង្ខេបចំណងដៃកម្មវិធីបច្ចុប្បន្ននេះ',
      'តើគួរបែងចែកលុយចំណងដៃដុល្លារ និងរៀលទុកទូទាត់ចំណាយយ៉ាងដូចម្តេច?',
      'គន្លឹះត្រួតពិនិត្យ និងតាមដានភ្ញៀវដែលមិនទាន់បានបង់ប្រាក់',
    ],
  },
  {
    id: 'blessing_writer',
    title: 'អ្នកតែងពាក្យជូនពរ & សារអរគុណ',
    shortTitle: 'សារជូនពរ & អរគុណ',
    desc: 'តែងពាក្យជូនពរមង្គលការពិរោះៗ សារថ្លែងអំណរគុណ និងសុន្ទរកថាមេបា',
    icon: PenTool,
    accentColor: 'from-amber-500 to-orange-500',
    quickPrompts: [
      'តែងពាក្យជូនពរមង្គលការយ៉ាងពិរោះ និងមានអត្ថន័យជ្រាលជ្រៅ',
      'សរសេរសារថ្លែងអំណរគុណភ្ញៀវកិត្តិយសតាម Telegram / SMS ដ៏គួរសម',
      'តែងអត្ថបទថ្លែងសុន្ទរកថាខ្លីរបស់មេបា ស្វាគមន៍ភ្ញៀវក្នុងពិធីជប់លៀង',
    ],
  },
];

const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (លំនាំដើម • ឆ្លាតវៃ & លឿន)', badge: 'Default' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (ទូទៅ • ស្ថេរភាពខ្ពស់)', badge: 'General' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (លឿនរហ័ស • Fast)', badge: 'Fast' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (កម្រិតខ្ពស់ • ការគិតស៊ីជម្រៅ)', badge: 'Pro' },
];

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  currentEvent,
  stats,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatbotPersonaRole>('ceremony_advisor');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Storage key specific to event or general
  const storageKey = `gemini_chat_history_${currentEvent?.id || 'general'}`;

  // Initial greeting based on role
  const getInitialGreeting = (role: ChatbotPersonaRole): ChatMessage => {
    let greetingText = '';
    if (role === 'ceremony_advisor') {
      greetingText = `ជំរាបសួរ! ខ្ញុំគឺជា **Gemini AI ជំនួយការពិធីការ & មង្គលការ**។ ខ្ញុំត្រៀមខ្លួនជាស្រេចក្នុងការជួយលោកអ្នករៀបចំពិធីមង្គលការ កាលវិភាគកម្មវិធី ពិធីប្រពៃណីខ្មែរ និងការទទួលភ្ញៀវយ៉ាងរលូន។ តើលោកអ្នកចង់សាកសួរអ្វីខ្លះនៅថ្ងៃនេះ?`;
    } else if (role === 'gift_analyst') {
      greetingText = `ជំរាបសួរ! ខ្ញុំគឺជា **Gemini AI អ្នកវិភាគចំណងដៃ & ថវិកា**។ ខ្ញុំអាចជួយលោកអ្នកវិភាគទិន្នន័យចំណូលចំណងដៃ (${stats?.totalGuests || 0} នាក់, $${stats?.totalUSD || 0}, ${(stats?.totalKHR || 0).toLocaleString()} ៛) គណនាលំហូរសាច់ប្រាក់ និងតាមដានការទូទាត់។ តើលោកអ្នកចង់ឱ្យខ្ញុំវិភាគចំណុចណាដែរ?`;
    } else {
      greetingText = `ជំរាបសួរ! ខ្ញុំគឺជា **Gemini AI អ្នកតែងពាក្យជូនពរ & សារអរគុណ**។ ខ្ញុំអាចជួយលោកអ្នកតែងពាក្យជូនពរមង្គលការពិរោះរណ្តំ សរសេរសារថ្លែងអំណរគុណភ្ញៀវ ឬរៀបរៀងសុន្ទរកថាមេបាយ៉ាងកក់ក្តៅ។`;
    }

    return {
      id: 'msg-welcome-' + Date.now(),
      role: 'model',
      content: greetingText,
      timestamp: new Date().toISOString(),
      modelUsed: selectedModel,
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved chat history:', e);
    }
    return [getInitialGreeting('ceremony_advisor')];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Failed to save chat to localStorage:', e);
    }
  }, [messages, storageKey]);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const activePersona = PERSONA_CONFIGS.find((p) => p.id === selectedRole) || PERSONA_CONFIGS[0];
  const PersonaIcon = activePersona.icon;

  // Handle switching persona
  const handleRoleChange = (newRole: ChatbotPersonaRole) => {
    setSelectedRole(newRole);
    setRoleDropdownOpen(false);
    // Add persona switch message
    const switchGreeting = getInitialGreeting(newRole);
    setMessages((prev) => [...prev, switchGreeting]);
  };

  // Clear chat history
  const handleClearHistory = () => {
    if (window.confirm('តើលោកអ្នកពិតជាចង់សម្អាតប្រវត្តិសន្ទនាទាំងអស់នេះមែនទេ?')) {
      const fresh = [getInitialGreeting(selectedRole)];
      setMessages(fresh);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context of current event
      const eventContext = currentEvent
        ? {
            title: currentEvent.title,
            hostName: currentEvent.hostName,
            eventType: currentEvent.eventType,
            date: currentEvent.date,
            location: currentEvent.location || '',
            totalGuests: stats?.totalGuests || 0,
            totalUSD: stats?.totalUSD || 0,
            totalKHR: stats?.totalKHR || 0,
            paidGuestsCount: stats?.paidGuests || 0,
          }
        : null;

      // Map messages for server
      const payloadMessages = newHistory
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          roleId: selectedRole,
          eventContext,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        role: 'model',
        content: data.reply || 'មិនមានការឆ្លើយតប។',
        timestamp: new Date().toISOString(),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        content: `សូមអភ័យទោស! មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Gemini AI៖ ${error.message || 'សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬព្យាយាមម្តងទៀត'}`.trim(),
        timestamp: new Date().toISOString(),
        isError: true,
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      
      {/* Click outside backdrop to close on desktop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Chat Panel Container */}
      <div
        className={`relative w-full z-10 flex flex-col bg-white dark:bg-slate-900 shadow-2xl border border-rose-100/80 dark:border-slate-800 transition-all duration-200 overflow-hidden ${
          isExpanded
            ? 'h-full sm:h-[92vh] sm:max-w-4xl sm:rounded-2xl rounded-none'
            : 'h-[90vh] sm:h-[680px] sm:max-w-xl sm:rounded-2xl rounded-t-2xl'
        }`}
      >
        {/* Top Gradient Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 shrink-0" />

        {/* Modal Header */}
        <div className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  Gemini Chatbot
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
                  {selectedModel.replace('gemini-', '')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentEvent ? `សម្រាប់: ${currentEvent.title}` : 'ជំនួយការវៃឆ្លាតសម្រាប់កម្មវិធី & ចំណងដៃ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Clear History */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="សម្អាតប្រវត្តិសន្ទនា (Clear History)"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Expand / Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:inline-flex p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? 'បង្រួញ' : 'ពង្រីក'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="បិទ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persona Role & Model Config Subheader */}
        <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0 text-xs">
          
          {/* Persona Role Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setModelDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:border-rose-300 dark:hover:border-rose-700 transition-colors shadow-2xs cursor-pointer"
              title="ជ្រើសរើសតួនាទីជំនួយការ AI (AI Role / Persona)"
            >
              <PersonaIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold">{activePersona.shortTitle}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setRoleDropdownOpen(false)} />
                <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    តួនាទីជំនួយការ AI (Roles)
                  </div>
                  {PERSONA_CONFIGS.map((persona) => {
                    const Icon = persona.icon;
                    const isSelected = persona.id === selectedRole;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => handleRoleChange(persona.id)}
                        className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${persona.accentColor} text-white shrink-0 mt-0.5`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs">{persona.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                            {persona.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setModelDropdownOpen(!modelDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs cursor-pointer text-xs"
              title="ជ្រើសរើស Gemini Model"
            >
              <Bot className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[130px] font-medium">{selectedModel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    ជម្រើសម៉ូដែល (Gemini Models)
                  </div>
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = m.id === selectedModel;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">{m.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-950/30">
          
          {/* Informational Welcome Banner */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>តួនាទីបច្ចុប្បន្ន៖</strong> {activePersona.title} — {activePersona.desc}
              {currentEvent && (
                <div className="mt-1 text-[11px] text-amber-800 dark:text-amber-400">
                  ភ្ជាប់ជាមួយទិន្នន័យកម្មវិធី: <strong>{currentEvent.title}</strong> (ភ្ញៀវ {stats?.totalGuests || 0} នាក់ • ${stats?.totalUSD || 0})
                </div>
              )}
            </div>
          </div>

          {/* Messages Loop */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isCopied = copiedId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar */}
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 transition-all shadow-2xs ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-br-xs'
                      : message.isError
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-bl-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Markdown or plain text message body */}
                  <div className="prose dark:prose-invert text-xs sm:text-sm max-w-none break-words leading-relaxed">
                    <Markdown>{message.content}</Markdown>
                  </div>

                  {/* Message Bottom Toolbar (Copy & Timestamp) */}
                  <div
                    className={`mt-1.5 pt-1 border-t flex items-center justify-between gap-3 text-[10px] ${
                      isUser
                        ? 'border-rose-500/40 text-rose-200'
                        : 'border-slate-100 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="truncate">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.modelUsed && !isUser && (
                        <span className="ml-1 opacity-75">({message.modelUsed.replace('gemini-', '')})</span>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(message.id, message.content)}
                      className={`inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 rounded ${
                        isUser ? 'hover:text-white' : 'hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                      title="ចម្លងអត្ថបទ (Copy)"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px]">បានចម្លង</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">ចម្លង</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-2 text-xs shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Gemini កំពុងគិត និងរៀបចំចម្លើយ...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts Section */}
        {activePersona.quickPrompts.length > 0 && !isLoading && (
          <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>សំណួរណែនាំរហ័ស (Quick Suggestions):</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {activePersona.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="inline-flex items-center px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap transition-colors shadow-2xs cursor-pointer active:scale-98"
                >
                  <span className="truncate max-w-[240px] sm:max-w-[320px]">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-rose-500 dark:focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="សរសេរសំណួររបស់អ្នកនៅទីនេះ... (ចុច Enter ដើម្បីផ្ញើ)"
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden max-h-24 overflow-y-auto"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shrink-0"
              title="ផ្ញើសារ (Send)"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>ចុច Enter ដើម្បីផ្ញើ • Shift + Enter ដើម្បីចុះបន្ទាត់</span>
            <span>ថាមពលដោយ Google Gemini</span>
          </div>
        </div>

      </div>
    </div>
  );
};

interface GeminiFloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const GeminiFloatingChatButton: React.FC<GeminiFloatingChatButtonProps> = ({
  onClick,
  isOpen,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 dark:border-slate-800/80 cursor-pointer group"
      title="ជំនួយការ AI Gemini Chatbot"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </div>
      <span className="hidden sm:inline font-bold text-xs tracking-wide">
        ជំនួយការ Gemini
      </span>
    </button>
  );
};
