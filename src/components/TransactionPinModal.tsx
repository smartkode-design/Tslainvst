"use client";

import { useState, useRef, useEffect } from "react";
import { X, Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  amountNGN: number;
  description: string;
  userId?: string;
  authToken?: string;
}

export function TransactionPinModal({
  isOpen,
  onClose,
  onSuccess,
  amountNGN,
  description,
  userId,
  authToken,
}: TransactionPinModalProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPinDigits(["", "", "", ""]);
      setErrorMsg(null);
      setVerifying(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);
    setErrorMsg(null);

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullPin = pinDigits.join("");
    if (fullPin.length !== 4) {
      setErrorMsg("Please enter your complete 4-digit PIN");
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          pin: fullPin,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.error || "Incorrect PIN. Please try again.");
      }

      // PIN is valid! Execute authorized transaction
      await onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Incorrect PIN. Please try again.");
      setPinDigits(["", "", "", ""]);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    } finally {
      setVerifying(false);
    }
  };

  const isComplete = pinDigits.every((d) => d.length === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Security Shield Icon */}
        <div className="text-center space-y-2 pt-1">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Authorize Payment</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enter your 4-digit Transaction PIN to confirm debit
          </p>
        </div>

        {/* Amount & Purpose Badge */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {description}
          </span>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₦{new Intl.NumberFormat("en-NG").format(amountNGN)}
          </span>
        </div>

        {/* 4 Digit Boxes */}
        <div className="flex justify-center gap-3 py-1">
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-13 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-center text-2xl font-black font-mono focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleVerify}
          disabled={!isComplete || verifying}
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying PIN...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Confirm & Authorize</span>
            </>
          )}
        </Button>

        {/* Forgot PIN Link */}
        <div className="text-center pt-1">
          <a
            href="https://wa.me/2348114491126?text=Hello%20TSLA%20Support,%20I%20need%20help%20resetting%20my%20Transaction%20PIN."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-slate-400 hover:text-primary dark:hover:text-indigo-400 underline"
          >
            Forgot your PIN? Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
