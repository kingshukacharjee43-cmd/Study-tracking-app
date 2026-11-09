import React, { useState } from 'react';
import {
  AuthenticatedAccount,
  loginWithGooglePopup,
  loginWithEmailPassword,
  registerWithEmailPassword,
} from '../services/firebaseService';
import { X, LogIn, UserPlus, ShieldCheck, HelpCircle, Users } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AuthenticatedAccount;
  presetAccounts: AuthenticatedAccount[];
  onSelectAccount: (account: AuthenticatedAccount) => void;
  onConnectFriend?: (input: {
    friendCodeOrEmail: string;
    displayName?: string;
  }) => string | undefined;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  presetAccounts,
  onSelectAccount,
  onConnectFriend,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'friend'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [friendCodeInput, setFriendCodeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showConsoleGuide, setShowConsoleGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFriendSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    if (!friendCodeInput.trim()) {
      setErrorMsg('Please enter a Friend Invite Code (e.g. LECTRA-LIAM-07) or friend email.');
      return;
    }
    if (onConnectFriend) {
      const err = onConnectFriend({
        friendCodeOrEmail: friendCodeInput,
        displayName: displayName || undefined,
      });
      if (err) {
        setErrorMsg(err);
        return;
      }
      setFriendCodeInput('');
      setInfoMsg('Friend connected to your Study Circle!');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const user = await loginWithGooglePopup();
      onSelectAccount({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Student',
        emailVerified: user.emailVerified,
        provider: 'google',
        isCloudSynced: user.emailVerified,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes('popup-closed-by-user')
          ? 'Google Sign-In popup was closed before completing authentication.'
          : `Google Sign-In error: ${msg}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setErrorMsg('Please enter your student display name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await registerWithEmailPassword(
          trimmedEmail,
          password,
          displayName.trim()
        );
        onSelectAccount({
          uid: user.uid,
          email: user.email,
          displayName: displayName.trim(),
          emailVerified: user.emailVerified,
          provider: 'password',
          isCloudSynced: user.emailVerified,
        });
        onClose();
      } else {
        const user = await loginWithEmailPassword(trimmedEmail, password);
        onSelectAccount({
          uid: user.uid,
          email: user.email,
          displayName:
            user.displayName || user.email?.split('@')[0] || 'Student',
          emailVerified: user.emailVerified,
          provider: 'password',
          isCloudSynced: user.emailVerified,
        });
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If Email/Password provider is not yet enabled in the Firebase Console, create an isolated account session and guide the user
      if (
        msg.includes('operation-not-allowed') ||
        msg.includes('CONFIGURATION_NOT_FOUND')
      ) {
        const deterministicUid = `acct-${trimmedEmail.replace(/[^a-z0-9]/g, '-')}`;
        const derivedName =
          displayName.trim() || trimmedEmail.split('@')[0] || 'Student';
        onSelectAccount({
          uid: deterministicUid,
          email: trimmedEmail,
          displayName: derivedName,
          emailVerified: false,
          provider: 'local-account',
          isCloudSynced: false,
        });
        onClose();
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8 transition-colors">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="auth-modal-title"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              Firebase Account & Data Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sign in with Google or Email/Password to associate study graphs, journals, and checklists with your account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Sign-In Button */}
        <div className="mt-5">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full min-h-[44px] px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Continue with Google Sign-In (Popup)</span>
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span>or Email & Password</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {/* Mode Toggle: Sign In vs Create Account vs Friend Sign-In */}
        <div
          className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4"
          role="group"
          aria-label="Email authentication mode"
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 min-h-[36px] text-xs font-medium rounded-md transition-colors ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 min-h-[36px] text-xs font-medium rounded-md transition-colors ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('friend');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 min-h-[36px] text-xs font-medium rounded-md transition-colors ${
              mode === 'friend'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Friend Sign-In
          </button>
        </div>

        {mode === 'friend' ? (
          <form onSubmit={handleFriendSignInSubmit} className="space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="auth-friend-code"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Friend Sign-In Code or University Email
              </label>
              <input
                id="auth-friend-code"
                type="text"
                placeholder="e.g. LECTRA-LIAM-07 or friend@stanford.edu"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="auth-friend-name"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Friend Display Name (Optional)
              </label>
              <input
                id="auth-friend-name"
                type="text"
                placeholder="e.g. Liam Chen"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}
            {infoMsg && (
              <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {infoMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>Connect Friend Account</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3.5" noValidate>
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-display-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Student Display Name
                </label>
                <input
                  id="auth-display-name"
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Password (min 6 characters)
              </label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}
            {infoMsg && (
              <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {infoMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {mode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Authenticated Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Instant Multi-Account Switcher to Verify Account Isolation */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Switch Authenticated Workspace Account (Isolated Data)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetAccounts.map((acct) => {
              const isCurrent = acct.uid === currentAccount.uid;
              return (
                <button
                  key={acct.uid}
                  type="button"
                  onClick={() => {
                    onSelectAccount(acct);
                    onClose();
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    isCurrent
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-slate-900 dark:text-slate-100'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">
                    {acct.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {acct.email}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Firebase Console Email/Password Provider Guide */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowConsoleGuide((prev) => !prev)}
            aria-expanded={showConsoleGuide}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>How to enable Email/Password provider in Firebase Console</span>
          </button>

          {showConsoleGuide && (
            <div className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Enabling Email/Password in Firebase Console (Project: digital-coast-8bvhw):
              </p>
              <p>
                1. Open the Firebase Console and select project{' '}
                <code className="font-mono text-slate-800 dark:text-slate-200">digital-coast-8bvhw</code>.
              </p>
              <p>
                2. Navigate to <strong>Build → Authentication → Sign-in method</strong>.
              </p>
              <p>
                3. Click <strong>Add new provider → Email/Password</strong>, toggle{' '}
                <strong>Enable</strong> on, and click <strong>Save</strong>. (Google Sign-In is pre-configured automatically).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
