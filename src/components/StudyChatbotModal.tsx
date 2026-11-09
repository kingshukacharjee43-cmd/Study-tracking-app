import React, { useState, useRef, useEffect } from 'react';
import {
  StudyTrekState,
  StudyCategory,
  STUDY_CATEGORIES,
  calculateStudyMetrics,
} from '../utils/studyEngine';
import {
  X,
  Send,
  Bot,
  User,
  Trash2,
  Cpu,
  Sliders,
  Sparkles,
  Zap,
  Brain,
  CheckCircle2,
  Play,
  Plus,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

type MentorRoleId = 'socratic_tutor' | 'exam_coach' | 'code_proof_reviewer';
type TaskComplexity = 'fast' | 'general' | 'complex';
type OptimizerEngineMode = 'fast_triage' | 'schedule_wellbeing' | 'deep_stem';

interface OptimizationResult {
  modelUsed: string;
  headline: string;
  summary: string;
  recommendedFocusMinutes: number;
  recommendedCategory: string;
  recommendedTaskTitle: string;
  actionableSteps: string[];
}

interface StudyChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: StudyTrekState;
  studentName: string;
  initialViewTab?: 'chat' | 'optimizer';
  onAddOptimizedTask?: (input: {
    title: string;
    category: StudyCategory;
    date: string;
    estimatedMinutes: number;
    priority: 'High' | 'Medium' | 'Low';
  }) => void;
  onLaunchFocusWithConfig?: (config: {
    durationMinutes: number;
    category: StudyCategory;
    taskTitle: string;
  }) => void;
}

const MENTOR_ROLES: {
  id: MentorRoleId;
  label: string;
  subtitle: string;
  defaultSystemInstruction: string;
}[] = [
  {
    id: 'socratic_tutor',
    label: 'Socratic STEM Tutor',
    subtitle: 'Step-by-step questioning & active recall prompts',
    defaultSystemInstruction:
      'You are Lectra Socratic Tutor, an expert academic mentor inside the "Lectra: Study Timer & Checklist" app. Guide students through Computer Science, Mathematics, Physics, Literature, Languages, and Systems Design using concise Socratic questioning, step-by-step derivations, and active recall prompts.',
  },
  {
    id: 'exam_coach',
    label: 'Exam Sprint & Focus Coach',
    subtitle: 'Pomodoro planning & checklist prioritization',
    defaultSystemInstruction:
      'You are Lectra Exam Sprint Coach, a time-management and Pomodoro strategist inside the "Lectra: Study Timer & Checklist" app. Help students break down their subject todo checklists into focused 25m/45m/60m Focus Mode blocks and optimize their Digital Wellbeing study balance.',
  },
  {
    id: 'code_proof_reviewer',
    label: 'Proof & Code Reviewer',
    subtitle: 'Mathematical rigor, Dart/Flutter & algorithm audits',
    defaultSystemInstruction:
      'You are Lectra STEM Proof & Code Reviewer inside the "Lectra: Study Timer & Checklist" app. Analyze mathematical proofs, algorithms, Dart/Flutter patterns, and systems design concepts with rigorous precision, highlighting invariants and edge cases.',
  },
];

const MODEL_OPTIONS: {
  complexity: TaskComplexity;
  modelName: string;
  label: string;
  description: string;
}[] = [
  {
    complexity: 'fast',
    modelName: 'gemini-3.1-flash-lite',
    label: 'Fast · gemini-3.1-flash-lite',
    description: 'Ultra-low latency for quick flashcards & task triage',
  },
  {
    complexity: 'general',
    modelName: 'gemini-3.8-flash',
    label: 'General · gemini-3.8-flash',
    description: 'Balanced study coaching, schedules & summarization',
  },
  {
    complexity: 'complex',
    modelName: 'gemini-4-argon',
    label: 'Complex STEM · gemini-4-argon',
    description: 'Deep proofs, algorithms & multi-step academic reasoning',
  },
];

const OPTIMIZER_ENGINES: {
  mode: OptimizerEngineMode;
  modelName: string;
  title: string;
  subtitle: string;
}[] = [
  {
    mode: 'fast_triage',
    modelName: 'gemini-3.1-flash-lite',
    title: 'Fast Checklist Triage',
    subtitle: 'Instant sub-second task prioritization & 25m sprint setup',
  },
  {
    mode: 'schedule_wellbeing',
    modelName: 'gemini-3.8-flash',
    title: 'Balanced Schedule & Wellbeing',
    subtitle: 'Structured JSON optimization of weekly curve & subject balance',
  },
  {
    mode: 'deep_stem',
    modelName: 'gemini-4-argon',
    title: 'Deep STEM Curriculum Synthesizer',
    subtitle: 'Complex cross-subject proof & exam mastery synthesis',
  },
];

export const StudyChatbotModal: React.FC<StudyChatbotModalProps> = ({
  isOpen,
  onClose,
  state,
  studentName,
  initialViewTab = 'chat',
  onAddOptimizedTask,
  onLaunchFocusWithConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'optimizer'>(
    initialViewTab
  );
  const [mentorRole, setMentorRole] = useState<MentorRoleId>('socratic_tutor');
  const [taskComplexity, setTaskComplexity] = useState<TaskComplexity>('general');
  const [systemInstruction, setSystemInstruction] = useState<string>(
    MENTOR_ROLES[0].defaultSystemInstruction
  );
  const [showSystemConfig, setShowSystemConfig] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Hi ${studentName.split(' ')[0]}! I'm your Lectra Multi-Model Gemini Mentor. Switch between Fast (gemini-3.1-flash-lite), General (gemini-3.8-flash), and Complex STEM (gemini-4-argon) or open the AI App Optimizer tab to auto-tune your study checklist and Focus Mode blocks.`,
      timestamp: '09:05',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  // Multi-Model Optimizer State
  const [selectedOptimizer, setSelectedOptimizer] =
    useState<OptimizerEngineMode>('schedule_wellbeing');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationPlan, setOptimizationPlan] =
    useState<OptimizationResult | null>(null);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveSubTab(initialViewTab);
  }, [initialViewTab]);

  useEffect(() => {
    if (isOpen && activeSubTab === 'chat') {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeSubTab]);

  if (!isOpen) return null;

  const metrics = calculateStudyMetrics(state);
  const pendingTasks = state.tasks
    .filter((t) => !t.isCompleted)
    .map((t) => `${t.title} (${t.category}, ${t.estimatedMinutes}m)`);
  const recentTopics = state.sessions
    .slice(0, 4)
    .map((s) => `${s.topic} (${s.category})`);

  const handleRoleChange = (roleId: MentorRoleId) => {
    setMentorRole(roleId);
    const found = MENTOR_ROLES.find((r) => r.id === roleId);
    if (found) {
      setSystemInstruction(found.defaultSystemInstruction);
    }
  };

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userTurn: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userTurn]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          mentorRole,
          taskComplexity,
          customSystemInstruction: systemInstruction,
          studyContext: {
            totalWeeklyHours: metrics.totalWeeklyHours,
            weeklyGoalHours: state.weeklyGoalHours,
            pendingTasks,
            recentTopics,
          },
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        'Let us break this study topic into a 25-minute Focus Mode block and verify each step.';

      const botTurn: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
      };
      setMessages((prev) => [...prev, botTurn]);
    } catch {
      const fallbackTurn: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: `Here is a structured study breakdown for "${trimmed}":\n1. Review the core theorem or architectural invariant.\n2. Complete a 25-minute distraction-free Focus Mode session.\n3. Record your key takeaway in the Journey reflection log.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelUsed:
          MODEL_OPTIONS.find((m) => m.complexity === taskComplexity)?.modelName ||
          'gemini-3.8-flash',
      };
      setMessages((prev) => [...prev, fallbackTurn]);
    } finally {
      setIsLoading(false);
    }
  };

  const runMultiModelOptimization = async (mode: OptimizerEngineMode) => {
    setSelectedOptimizer(mode);
    setIsOptimizing(true);
    setAppliedBanner(null);

    try {
      const response = await fetch('/api/gemini/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineMode: mode,
          studyContext: {
            totalWeeklyHours: metrics.totalWeeklyHours,
            weeklyGoalHours: state.weeklyGoalHours,
            pendingTasks,
            recentTopics,
          },
        }),
      });
      const data = (await response.json()) as OptimizationResult;
      setOptimizationPlan(data);
    } catch {
      setOptimizationPlan({
        modelUsed:
          OPTIMIZER_ENGINES.find((e) => e.mode === mode)?.modelName ||
          'gemini-3.8-flash',
        headline: 'AI Study Schedule & Focus Optimization',
        summary:
          'Synthesized your weekly progress curve and pending tasks into a high-impact Focus Mode sprint.',
        recommendedFocusMinutes: 25,
        recommendedCategory: 'Computer Science',
        recommendedTaskTitle: 'Complete Priority Study Block & Active Recall Check',
        actionableSteps: [
          'Start a 25m distraction-free Focus Mode timer.',
          'Complete top High-Priority checklist item.',
          'Log reflection in Journey.',
        ],
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const resolveValidCategory = (raw?: string): StudyCategory => {
    const found = STUDY_CATEGORIES.find(
      (c) => c.toLowerCase() === (raw || '').toLowerCase()
    );
    return found || 'Computer Science';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-chatbot-title"
      data-testid="gemini-chatbot-modal"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full h-[84vh] max-h-[760px] flex flex-col shadow-xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <h2
                id="gemini-chatbot-title"
                className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate"
              >
                Lectra Gemini AI Study Mentor & Multi-Model Optimizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Powered by gemini-3.1-flash-lite (Fast), gemini-3.8-flash (General), and gemini-4-argon (Complex)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Switch between Chat and Multi-Model Optimizer */}
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
              role="group"
              aria-label="AI Assistant mode"
            >
              <button
                type="button"
                onClick={() => setActiveSubTab('chat')}
                className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeSubTab === 'chat'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Multi-Turn Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('optimizer');
                  if (!optimizationPlan) {
                    runMultiModelOptimization('schedule_wellbeing');
                  }
                }}
                className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeSubTab === 'optimizer'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Multi-Model Optimizer
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Gemini Study Mentor"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeSubTab === 'chat' ? (
          <>
            {/* Role Selector + Model Tier Bar */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Chatbot Role Selector */}
                <div
                  className="flex flex-wrap items-center gap-1"
                  role="group"
                  aria-label="Select chatbot mentor role"
                >
                  {MENTOR_ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      aria-pressed={mentorRole === role.id}
                      className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                        mentorRole === role.id
                          ? 'bg-slate-900 dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* Model Complexity Selector */}
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    aria-label="Select Gemini model by task complexity"
                    value={taskComplexity}
                    onChange={(e) =>
                      setTaskComplexity(e.target.value as TaskComplexity)
                    }
                    className="min-h-[32px] px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    {MODEL_OPTIONS.map((m) => (
                      <option key={m.complexity} value={m.complexity}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowSystemConfig((prev) => !prev)}
                    aria-expanded={showSystemConfig}
                    aria-label="Customize system instruction"
                    className="min-h-[32px] px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMessages([
                        {
                          id: `welcome-${Date.now()}`,
                          role: 'model',
                          text: 'Conversation history cleared. Which study topic or checklist item should we tackle next?',
                          timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          modelUsed:
                            MODEL_OPTIONS.find(
                              (m) => m.complexity === taskComplexity
                            )?.modelName || 'gemini-3.8-flash',
                        },
                      ])
                    }
                    aria-label="Clear chat history"
                    className="min-h-[32px] px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showSystemConfig && (
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <label
                    htmlFor="chatbot-system-instruction"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Active System Instruction (Customizes Chatbot Role & Persona)
                  </label>
                  <textarea
                    id="chatbot-system-instruction"
                    rows={2}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Scrollable Multi-Turn Conversation Thread */}
            <div
              data-testid="chatbot-messages-thread"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div
                      className={`mt-1.5 text-[10px] font-mono flex items-center gap-1.5 ${
                        msg.role === 'user'
                          ? 'text-blue-100 justify-end'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{msg.modelUsed}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span>Gemini Study Mentor is thinking...</span>
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Quick Study Prompts */}
            <div className="px-6 py-2 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                'Quiz me on Linear Algebra eigenvalues',
                'Plan a 45m Focus Mode sprint for my pending tasks',
                'Review my Maxwell Equations boundary takeaway',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendPrompt(suggestion)}
                  className="min-h-[30px] px-2.5 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendPrompt(input);
              }}
              className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900 shrink-0"
            >
              <input
                type="text"
                aria-label="Ask Gemini Study Mentor"
                placeholder="Ask a question or follow up on your study topics..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-h-[42px] px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          /* Multi-Model AI App Optimizer View */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Select AI Model Engine to Optimize Your Study App
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each Gemini model tier analyzes your live weekly hours ({metrics.totalWeeklyHours}h / {state.weeklyGoalHours}h) and pending tasks with specialized speed or reasoning depth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OPTIMIZER_ENGINES.map((engine) => {
                const isSelected = selectedOptimizer === engine.mode;
                return (
                  <button
                    key={engine.mode}
                    type="button"
                    onClick={() => runMultiModelOptimization(engine.mode)}
                    className={`p-4 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {engine.title}
                        </span>
                        {engine.mode === 'fast_triage' ? (
                          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : engine.mode === 'deep_stem' ? (
                          <Brain className="w-4 h-4 text-violet-500 shrink-0" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {engine.subtitle}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-mono text-blue-600 dark:text-blue-400">
                      {engine.modelName}
                    </div>
                  </button>
                );
              })}
            </div>

            {isOptimizing ? (
              <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  Running {OPTIMIZER_ENGINES.find((e) => e.mode === selectedOptimizer)?.modelName} optimization...
                </p>
              </div>
            ) : (
              optimizationPlan && (
                <div
                  data-testid="ai-optimization-result"
                  className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {optimizationPlan.headline}
                      </h4>
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        Model: {optimizationPlan.modelUsed} · Target: {optimizationPlan.recommendedCategory} ({optimizationPlan.recommendedFocusMinutes}m)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {optimizationPlan.summary}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Actionable Study Optimizations:
                    </div>
                    {optimizationPlan.actionableSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          0{idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {appliedBanner && (
                    <p
                      role="status"
                      className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{appliedBanner}</span>
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    {onAddOptimizedTask && (
                      <button
                        type="button"
                        onClick={() => {
                          const cat = resolveValidCategory(
                            optimizationPlan.recommendedCategory
                          );
                          onAddOptimizedTask({
                            title: optimizationPlan.recommendedTaskTitle,
                            category: cat,
                            date: '2026-11-12',
                            estimatedMinutes:
                              optimizationPlan.recommendedFocusMinutes,
                            priority: 'High',
                          });
                          setAppliedBanner(
                            `Added "${optimizationPlan.recommendedTaskTitle}" to your Todo Checklist.`
                          );
                        }}
                        className="min-h-[38px] px-3.5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Recommended Task to Todos</span>
                      </button>
                    )}

                    {onLaunchFocusWithConfig && (
                      <button
                        type="button"
                        onClick={() => {
                          const cat = resolveValidCategory(
                            optimizationPlan.recommendedCategory
                          );
                          onClose();
                          onLaunchFocusWithConfig({
                            durationMinutes:
                              optimizationPlan.recommendedFocusMinutes,
                            category: cat,
                            taskTitle: optimizationPlan.recommendedTaskTitle,
                          });
                        }}
                        className="min-h-[38px] px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>
                          Launch {optimizationPlan.recommendedFocusMinutes}m Focus Mode Now
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
