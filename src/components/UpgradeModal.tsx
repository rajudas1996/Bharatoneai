import React from 'react';
import { X, Crown, Check, Sparkles, Zap, Shield, Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'Basic' | 'Gold' | 'Free';
  onSelectPlan: (plan: 'Basic' | 'Gold') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Upgrade Bharat 1 AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Premium Plans
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Unlock full AI power: Gemini 3.1, Veo 3 Video, Lyria Music & Maps Grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Plan 1: Basic Plan (99 / month) */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
            currentPlan === 'Basic'
              ? 'border-red-500 bg-red-50/30 ring-2 ring-red-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Starter Tier
                </span>
                {currentPlan === 'Basic' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">Basic Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">Essential tools for creators & analysts</p>

              <div className="mt-4 mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹99</span>
                <span className="text-xs text-slate-500 font-semibold">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50 AI Image Generations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard 1080p Image Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Excel Dashboard with cross-filtering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full filtered Excel export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Community & Email Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectPlan('Basic');
                onClose();
              }}
              className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentPlan === 'Basic'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 hover:bg-black text-white shadow-xs'
              }`}
            >
              {currentPlan === 'Basic' ? 'Current Active Plan' : 'Select Basic Plan (₹99/mo)'}
            </button>
          </div>

          {/* Plan 2: Gold Plan (299 / month) */}
          <div className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all ${
            currentPlan === 'Gold'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
              : 'border-amber-300 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-400 shadow-xs'
          }`}>
            {/* Top Recommended Tag */}
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Full Powerhouse
                </span>
                {currentPlan === 'Gold' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Gold Plan</span>
                <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Everything unlimited with all generative models</p>

              <div className="mt-4 mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹299</span>
                <span className="text-xs text-slate-500 font-semibold">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                  <span className="font-semibold text-slate-900">Unlimited 4K Images (Gemini 3.1 Flash)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                  <span className="font-semibold text-slate-900">Veo 3.1 Video & Image Animation (16:9 & 9:16)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                  <span className="font-semibold text-slate-900">Lyria AI Music & Synthesizer Stems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Google Maps Grounding & Location Intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Unlimited Excel Rows & Dynamic Builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dedicated 24/7 Priority Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectPlan('Gold');
                onClose();
              }}
              className="w-full mt-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{currentPlan === 'Gold' ? 'Active Gold Member' : 'Upgrade to Gold Plan (₹299/mo)'}</span>
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            100% Secure Checkout with Razorpay / UPI / Cards
          </span>
          <span>Cancel anytime without penalty</span>
        </div>
      </div>
    </div>
  );
};
