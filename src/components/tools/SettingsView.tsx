import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Sun, Check, User } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [userName, setUserName] = useState('Raju Das');
  const [email, setEmail] = useState('rajudaszoology22@gmail.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile, workspace defaults, and security configurations
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : null}
            <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
