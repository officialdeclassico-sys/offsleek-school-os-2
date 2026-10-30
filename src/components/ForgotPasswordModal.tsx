import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, Send, X } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your school registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
    }, 900);
  };

  const handleReset = () => {
    setStatus('idle');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      <div
        className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Check your email</h3>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              We have dispatched password recovery instructions to <strong className="text-neutral-900">{email}</strong> if it matches an authorized school staff record.
            </p>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-500 mb-6 text-left">
              <strong>Note:</strong> In this demo environment, no real email is dispatched. Your school administrator can also reset credentials directly via the management directory.
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-black text-white hover:bg-neutral-800 font-medium text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Back to Sign in
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                School OS Recovery
              </span>
              <h3 id="modal-title" className="text-xl font-bold text-neutral-900 mt-1">
                Reset your password
              </h3>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5 leading-relaxed">
                Enter your institutional email address and we'll send you a secure link to reset your account credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="you@riverdale.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                    disabled={status === 'loading'}
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{errorMessage}</p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-black text-white hover:bg-neutral-800 font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <span>Sending reset instructions...</span>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full text-neutral-600 hover:text-neutral-900 text-xs font-medium py-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
