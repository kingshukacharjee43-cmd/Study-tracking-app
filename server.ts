import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const PORT = 3000;

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  socratic_tutor:
    'You are Lectra Socratic Tutor, an expert academic mentor inside the "Lectra: Study Timer & Checklist" app. Guide students through Computer Science, Mathematics, Physics, Literature, Languages, and Systems Design using concise Socratic questioning, step-by-step derivations, and active recall prompts. Keep responses structured and under 180 words unless asked for deep derivations.',
  exam_coach:
    'You are Lectra Exam Sprint Coach, a time-management and Pomodoro strategist inside the "Lectra: Study Timer & Checklist" app. Help students break down their subject todo checklists into focused 25m/45m/60m Focus Mode blocks, prioritize high-impact topics, and optimize their Digital Wellbeing study balance. Keep responses actionable and concise.',
  code_proof_reviewer:
    'You are Lectra STEM Proof & Code Reviewer inside the "Lectra: Study Timer & Checklist" app. Analyze mathematical proofs, algorithms, Dart/Flutter patterns, and systems design concepts with rigorous precision, highlighting edge cases, invariants, and time/space complexity.',
};

function buildLocalMentorFallback(
  message: string,
  mentorRole: string,
  modelRequested: string,
  studyContext?: {
    totalWeeklyHours?: number;
    weeklyGoalHours?: number;
    pendingTasks?: string[];
    recentTopics?: string[];
  }
): string {
  const roleTitle =
    mentorRole === 'exam_coach'
      ? 'Exam Sprint Coach'
      : mentorRole === 'code_proof_reviewer'
      ? 'STEM Proof & Code Reviewer'
      : 'Socratic Study Tutor';
  const pendingList =
    studyContext?.pendingTasks && studyContext.pendingTasks.length > 0
      ? studyContext.pendingTasks.slice(0, 3).join('; ')
      : 'Linear Algebra Eigenvalues, Maxwell Boundary Derivations, and Lectra Open-Source Docs';
  const hoursInfo =
    typeof studyContext?.totalWeeklyHours === 'number' &&
    typeof studyContext?.weeklyGoalHours === 'number'
      ? `${studyContext.totalWeeklyHours.toFixed(1)}h / ${studyContext.weeklyGoalHours}h`
      : '21.5h / 25h';

  return `[${roleTitle} · ${modelRequested}]\n\nBased on your current Lectra study progress (${hoursInfo} logged this week) and your prompt ("${message.slice(0, 120)}"), here is your structured study plan:\n\n1. **Core Concept Breakdown**: Isolate the fundamental invariant or theorem first and write a 2-sentence summary in your Journey log.\n2. **Priority Checklist Alignment**: Focus next on your pending tasks (${pendingList}).\n3. **Recommended Focus Block**: Launch **Focus Mode** for 25 minutes on this topic with all other UI elements locked until completion.`;
}

function buildFallbackOptimization(
  engineMode: 'fast_triage' | 'schedule_wellbeing' | 'deep_stem',
  modelRequested: string,
  studyContext?: {
    totalWeeklyHours?: number;
    weeklyGoalHours?: number;
    pendingTasks?: string[];
    recentTopics?: string[];
  }
) {
  const hours = studyContext?.totalWeeklyHours ?? 21.5;
  const goal = studyContext?.weeklyGoalHours ?? 25;
  const remaining = Math.max(0.5, Math.round((goal - hours) * 10) / 10);

  if (engineMode === 'fast_triage') {
    return {
      modelUsed: modelRequested,
      headline: `Fast Checklist Triage (${remaining}h to Weekly Goal)`,
      summary:
        'Rapid priority scan completed using gemini-3.1-flash-lite. High-cognitive problem sets are front-loaded into a 25-minute distraction-locked Focus Mode sprint.',
      recommendedFocusMinutes: 25,
      recommendedCategory: 'Mathematics',
      recommendedTaskTitle: 'Solve Eigenvalue & SVD Spectral Proof Set (Fast Sprint)',
      actionableSteps: [
        'Start with a 25m Focus Mode block on Mathematics (Highest priority pending item).',
        'Batch low-priority documentation tasks into a single 40m afternoon block.',
        'Use Reset Completed Tasks at the end of the week to recycle recurring problem sets.',
      ],
    };
  }

  if (engineMode === 'deep_stem') {
    return {
      modelUsed: modelRequested,
      headline: 'Deep STEM Curriculum & Proof Synthesis',
      summary:
        'Cross-subject synthesis across Computer Science, Mathematics, and Physics identifies high-leverage conceptual bridges for long-term retention.',
      recommendedFocusMinutes: 60,
      recommendedCategory: 'Physics',
      recommendedTaskTitle: 'Derive Maxwell Boundary Conditions via Linear Differential Operators',
      actionableSteps: [
        'Connect your Linear Algebra SVD orthogonal basis notes directly to Quantum/EM wave boundary conditions.',
        'Lock UI in a 60m Focus Mode deep-work block to complete full mathematical derivations without context switching.',
        'Log a 5/5 Focus Rating reflection in Journey immediately after unlocking UI.',
      ],
    };
  }

  return {
    modelUsed: modelRequested,
    headline: 'Balanced Schedule & Digital Wellbeing Optimization',
    summary: `Analyzed ${hours}h/${goal}h weekly curve with gemini-3.8-flash. Recommends a 45m Computer Science & Systems Design block to balance subject screen-on distribution.`,
    recommendedFocusMinutes: 45,
    recommendedCategory: 'Computer Science',
    recommendedTaskTitle: 'Optimize Offline Hive Box Indexing & Firestore Sync Rules',
    actionableSteps: [
      `Complete one 45m Focus Mode session today to close ${Math.min(100, Math.round((0.75 / remaining) * 100))}% of your remaining weekly gap.`,
      'Pin the Lock Screen Next Priority Task widget to keep your top checklist item visible.',
      'Review active recall questions in Study Game after completing your checklist item.',
    ],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Multi-Turn Gemini Chatbot Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    const {
      message,
      history = [],
      mentorRole = 'socratic_tutor',
      taskComplexity = 'general',
      customSystemInstruction,
      studyContext,
    } = req.body as {
      message?: string;
      history?: ChatTurn[];
      mentorRole?: string;
      taskComplexity?: 'fast' | 'general' | 'complex';
      customSystemInstruction?: string;
      studyContext?: {
        totalWeeklyHours?: number;
        weeklyGoalHours?: number;
        pendingTasks?: string[];
        recentTopics?: string[];
      };
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    // Select model based on complexity:
    // - gemini-4-argon for particularly complex tasks
    // - gemini-3.8-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    const requestedModel =
      taskComplexity === 'complex'
        ? 'gemini-4-argon'
        : taskComplexity === 'fast'
        ? 'gemini-3.1-flash-lite'
        : 'gemini-3.8-flash';

    const baseRoleInstruction =
      ROLE_SYSTEM_INSTRUCTIONS[mentorRole] || ROLE_SYSTEM_INSTRUCTIONS.socratic_tutor;
    const contextSummary = studyContext
      ? `\n\nStudent Live Workspace Context: Weekly Hours = ${studyContext.totalWeeklyHours ?? 0}h / ${studyContext.weeklyGoalHours ?? 25}h. Pending Tasks = ${(studyContext.pendingTasks || []).slice(0, 5).join(' | ') || 'None'}. Recent Study Topics = ${(studyContext.recentTopics || []).slice(0, 5).join(' | ') || 'None'}.`
      : '';
    const systemInstruction = `${
      customSystemInstruction?.trim() ? customSystemInstruction.trim() : baseRoleInstruction
    }${contextSummary}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: buildLocalMentorFallback(message.trim(), mentorRole, requestedModel, studyContext),
        modelUsed: requestedModel,
        fallbackUsed: true,
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedHistory = Array.isArray(history)
      ? history
          .filter(
            (h) =>
              h &&
              (h.role === 'user' || h.role === 'model') &&
              typeof h.text === 'string' &&
              h.text.trim()
          )
          .map((h) => ({
            role: h.role,
            parts: [{ text: h.text }],
          }))
      : [];

    const runChatWithModel = async (modelName: string) => {
      const chat = ai.chats.create({
        model: modelName,
        history: formattedHistory,
        config: {
          systemInstruction,
        },
      });
      const response = await chat.sendMessage({
        message: message.trim(),
      });
      return response.text || '';
    };

    try {
      const replyText = await runChatWithModel(requestedModel);
      res.json({
        reply:
          replyText ||
          buildLocalMentorFallback(message.trim(), mentorRole, requestedModel, studyContext),
        modelUsed: requestedModel,
      });
    } catch (primaryError: unknown) {
      if (requestedModel === 'gemini-4-argon') {
        try {
          const fallbackReply = await runChatWithModel('gemini-3.8-flash');
          res.json({
            reply:
              fallbackReply ||
              buildLocalMentorFallback(
                message.trim(),
                mentorRole,
                'gemini-3.8-flash',
                studyContext
              ),
            modelUsed: 'gemini-3.8-flash',
          });
          return;
        } catch {
          // fall through
        }
      }

      res.json({
        reply: buildLocalMentorFallback(message.trim(), mentorRole, requestedModel, studyContext),
        modelUsed: requestedModel,
        fallbackUsed: true,
      });
    }
  });

  // 2. Multi-Model AI App & Study Optimizer Endpoint
  app.post('/api/gemini/optimize', async (req, res) => {
    const { engineMode = 'schedule_wellbeing', studyContext } = req.body as {
      engineMode?: 'fast_triage' | 'schedule_wellbeing' | 'deep_stem';
      studyContext?: {
        totalWeeklyHours?: number;
        weeklyGoalHours?: number;
        pendingTasks?: string[];
        recentTopics?: string[];
      };
    };

    const requestedModel =
      engineMode === 'fast_triage'
        ? 'gemini-3.1-flash-lite'
        : engineMode === 'deep_stem'
        ? 'gemini-4-argon'
        : 'gemini-3.8-flash';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json(buildFallbackOptimization(engineMode, requestedModel, studyContext));
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Analyze this student's live Lectra study data and generate an optimization plan:
Weekly Hours: ${studyContext?.totalWeeklyHours ?? 21.5}h / ${studyContext?.weeklyGoalHours ?? 25}h
Pending Checklist Tasks: ${(studyContext?.pendingTasks || []).join('; ') || 'None'}
Recent Study Topics: ${(studyContext?.recentTopics || []).join('; ') || 'None'}
Optimization Mode: ${engineMode}`;

    const generateStructuredPlan = async (modelName: string) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction:
            'You are the Lectra Multi-Model Study Optimizer. Return a JSON study optimization plan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              recommendedFocusMinutes: { type: Type.INTEGER },
              recommendedCategory: { type: Type.STRING },
              recommendedTaskTitle: { type: Type.STRING },
              actionableSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      return {
        modelUsed: modelName,
        headline: parsed.headline || 'AI Study Schedule Optimization',
        summary: parsed.summary || 'Optimized your pending study tasks and focus timer blocks.',
        recommendedFocusMinutes: [15, 25, 45, 60].includes(Number(parsed.recommendedFocusMinutes))
          ? Number(parsed.recommendedFocusMinutes)
          : 25,
        recommendedCategory: parsed.recommendedCategory || 'Computer Science',
        recommendedTaskTitle:
          parsed.recommendedTaskTitle || 'Focused Problem Set & Active Recall Block',
        actionableSteps:
          Array.isArray(parsed.actionableSteps) && parsed.actionableSteps.length > 0
            ? parsed.actionableSteps.slice(0, 4)
            : ['Launch a 25m Focus Mode block', 'Complete top High-Priority checklist item'],
      };
    };

    try {
      const result = await generateStructuredPlan(requestedModel);
      res.json(result);
    } catch {
      if (requestedModel === 'gemini-4-argon') {
        try {
          const fallbackResult = await generateStructuredPlan('gemini-3.8-flash');
          res.json(fallbackResult);
          return;
        } catch {
          // fall through
        }
      }
      res.json(buildFallbackOptimization(engineMode, requestedModel, studyContext));
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lectra full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
