import React, { useState } from 'react';
import {
  StudyTrekState,
  PLAY_STORE_NAME_CANDIDATES,
  generateFlutterCodeArtifacts,
} from '../utils/studyEngine';
import { Copy, Check, Code2, FileText, Store } from 'lucide-react';

interface FlutterReleaseViewProps {
  state: StudyTrekState;
}

type ArtifactKey =
  | 'mainDart'
  | 'firebaseAuthDart'
  | 'hiveTaskEngineDart'
  | 'flChartWidgetDart'
  | 'playStoreAso'
  | 'readmeMd'
  | 'contributingMd';

export const FlutterReleaseView: React.FC<FlutterReleaseViewProps> = ({ state }) => {
  const artifacts = generateFlutterCodeArtifacts(state);
  const [activeTab, setActiveTab] = useState<ArtifactKey>('mainDart');
  const [copied, setCopied] = useState<boolean>(false);

  const tabs: { id: ArtifactKey; label: string; filename: string }[] = [
    { id: 'mainDart', label: '1. main.dart (AuthGate)', filename: 'lib/main.dart' },
    {
      id: 'firebaseAuthDart',
      label: '2. auth_service.dart',
      filename: 'lib/services/auth_service.dart',
    },
    {
      id: 'hiveTaskEngineDart',
      label: '3. study_task_manager.dart',
      filename: 'lib/models/study_task_manager.dart',
    },
    {
      id: 'flChartWidgetDart',
      label: '4. study_line_chart.dart',
      filename: 'lib/widgets/study_line_chart.dart',
    },
    {
      id: 'playStoreAso',
      label: '5. Play Store ASO',
      filename: 'play_store_aso_listing.txt',
    },
    { id: 'readmeMd', label: '6. README.md', filename: 'README.md' },
    {
      id: 'contributingMd',
      label: '7. CONTRIBUTING.md',
      filename: 'CONTRIBUTING.md',
    },
  ];

  const activeMeta = tabs.find((t) => t.id === activeTab) || tabs[0];
  const activeContent = artifacts[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Section: Google Play Store Name & ASO Positioning */}
      <section
        aria-labelledby="play-store-names-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h2
                id="play-store-names-heading"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Google Play Store Identity & ASO Discoverability
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active brand identity configured as Lectra: Study Timer & Checklist alongside high-ranking search alternatives
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            flutter build appbundle --release
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {PLAY_STORE_NAME_CANDIDATES.map((candidate, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={candidate.title}
                className={`p-4 rounded-xl border transition-colors ${
                  isPrimary
                    ? 'bg-slate-900 dark:bg-blue-950/60 text-white border-slate-900 dark:border-blue-500/50'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={
                      isPrimary
                        ? 'text-blue-300 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 font-medium'
                    }
                  >
                    {isPrimary ? 'Active App Identity' : `ASO Candidate #${idx + 1}`}
                  </span>
                  <span
                    className={`font-mono tabular-nums ${
                      isPrimary ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {candidate.charCount} chars
                  </span>
                </div>
                <h3 className="text-sm font-bold mt-1.5">{candidate.title}</h3>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isPrimary ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {candidate.positioning}
                </p>
                <div
                  className={`mt-3 pt-2.5 border-t text-[11px] font-mono ${
                    isPrimary
                      ? 'border-slate-800 text-blue-200'
                      : 'border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Keywords: {candidate.primaryKeywords.join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Flutter Code & Open-Source Release Explorer */}
      <section
        aria-labelledby="flutter-export-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="flutter-export-heading"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              Flutter (Dart) & Open-Source Release Codebase
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generated dynamically from your live Lectra study data, Firebase Auth config, and weekly progress metrics
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[42px] px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied {activeMeta.filename}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy {activeMeta.filename}</span>
              </>
            )}
          </button>
        </div>

        {/* File Selector Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5 py-3 border-b border-slate-100 dark:border-slate-800"
          role="tablist"
          aria-label="Flutter and Open-Source files"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.filename.endsWith('.dart') ? (
                  <Code2 className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
            <span>File: {activeMeta.filename}</span>
            <span>Material 3 · Firebase Auth · Hive · fl_chart</span>
          </div>
          <pre
            className="w-full p-5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[520px]"
            data-testid="flutter-code-preview"
          >
            <code>{activeContent}</code>
          </pre>
        </div>
      </section>
    </div>
  );
};
