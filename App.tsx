import React, { useState, useEffect, useMemo } from 'react';
import { PartnerType, SurveyEntry, CoupleProfile, ScoreSet, ChartDataPoint, User, AuthResponse } from './types';
import { DOMAIN_LABELS } from './constants';
import SliderInput from './components/SliderInput';
import MaritalChart from './components/MaritalChart';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dym_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dym_token'));
  const [profile, setProfile] = useState<CoupleProfile | null>(() => {
    const saved = localStorage.getItem('dym_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard'>('survey');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  // Survey Form State
  const [scores, setScores] = useState<ScoreSet>({ domain1: 5, domain2: 5, domain3: 5, overall: 5 });
  const [note, setNote] = useState('');

  useEffect(() => {
    if (token) {
      fetchEntries();
    }
  }, [token]);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch entries', err);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (res.ok) {
        const auth = result as AuthResponse;
        setUser(auth.user);
        setToken(auth.token);
        setProfile(auth.couple);
        setEntries(auth.entries);
        localStorage.setItem('dym_token', auth.token);
        localStorage.setItem('dym_user', JSON.stringify(auth.user));
        localStorage.setItem('dym_profile', JSON.stringify(auth.couple));
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setProfile(null);
    setEntries([]);
    window.location.reload();
  };

  const submitSurvey = async () => {
    if (!user || !token) return;
    setIsSubmitting(true);
    
    const newEntry: Partial<SurveyEntry> = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      partnerType: user.partnerType,
      scores: { ...scores },
      notes: note ? [note] : [],
    };
    
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry)
      });
      
      if (res.ok) {
        const savedEntry = await res.json();
        setEntries(prev => [...prev, savedEntry]);
        setScores({ domain1: 5, domain2: 5, domain3: 5, overall: 5 });
        setNote('');
        alert("Survey submitted! Remember to encourage your spouse to complete theirs.");
        setActiveTab('dashboard');
      }
    } catch (err) {
      alert("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    const groupedByDate: Record<string, ChartDataPoint> = {};
    entries.forEach(entry => {
      if (!groupedByDate[entry.date]) {
        groupedByDate[entry.date] = { date: entry.date };
      }
      if (entry.partnerType === PartnerType.HUSBAND) {
        groupedByDate[entry.date].h_overall = entry.scores.overall;
        groupedByDate[entry.date].h_d1 = entry.scores.domain1;
        groupedByDate[entry.date].h_d2 = entry.scores.domain2;
        groupedByDate[entry.date].h_d3 = entry.scores.domain3;
      } else {
        groupedByDate[entry.date].w_overall = entry.scores.overall;
        groupedByDate[entry.date].w_d1 = entry.scores.domain1;
        groupedByDate[entry.date].w_d2 = entry.scores.domain2;
        groupedByDate[entry.date].w_d3 = entry.scores.domain3;
      }
    });
    return Object.values(groupedByDate);
  }, [entries]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-indigo-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-indigo-900">DYM Tracker</h1>
            <p className="text-slate-500 mt-2">Delight Your Marriage Model</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Husband's Email</label>
                  <input required name="husbandEmail" type="email" placeholder="husband@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Wife's Email</label>
                  <input required name="wifeEmail" type="email" placeholder="wife@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input required name="email" type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input required name="password" type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            
            {authError && <p className="text-red-500 text-xs font-medium">{authError}</p>}
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
              {authMode === 'login' ? 'Login to Tracker' : 'Create Couple Account'}
            </button>
          </form>
          
          <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
            {authMode === 'signup' 
              ? "By signing up, you'll start receiving weekly reminders and marital health reports."
              : "Welcome back! Your data is securely stored and private to your couple."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">DYM M-Health</h1>
          <p className="text-xs text-slate-500 font-medium">Logged in as {user.email}</p>
        </div>
        <button 
          onClick={logout}
          className="text-xs font-semibold text-slate-400 hover:text-red-500"
        >
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        {activeTab === 'survey' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white mb-8">
              <h2 className="text-2xl font-bold mb-2 text-center">Weekly Pulse Check</h2>
              <p className="text-indigo-100 text-sm text-center">How have things been on average over the last week, {user.partnerType.toLowerCase()}?</p>
            </div>

            <SliderInput 
              label={DOMAIN_LABELS[user.partnerType].d1}
              value={scores.domain1}
              onChange={(v) => setScores({ ...scores, domain1: v })}
              minLabel={DOMAIN_LABELS[user.partnerType].d1Labels[0]}
              midLabel={DOMAIN_LABELS[user.partnerType].d1Labels[5]}
              maxLabel={DOMAIN_LABELS[user.partnerType].d1Labels[10]}
            />

            <SliderInput 
              label={DOMAIN_LABELS[user.partnerType].d2}
              value={scores.domain2}
              onChange={(v) => setScores({ ...scores, domain2: v })}
              minLabel={DOMAIN_LABELS[user.partnerType].d2Labels[0]}
              midLabel={DOMAIN_LABELS[user.partnerType].d2Labels[5]}
              maxLabel={DOMAIN_LABELS[user.partnerType].d2Labels[10]}
            />

            <SliderInput 
              label={DOMAIN_LABELS[user.partnerType].d3}
              value={scores.domain3}
              onChange={(v) => setScores({ ...scores, domain3: v })}
              minLabel={DOMAIN_LABELS[user.partnerType].d3Labels[0]}
              midLabel={DOMAIN_LABELS[user.partnerType].d3Labels[5]}
              maxLabel={DOMAIN_LABELS[user.partnerType].d3Labels[10]}
            />

            <SliderInput 
              label="Overall Marital Health"
              value={scores.overall}
              onChange={(v) => setScores({ ...scores, overall: v })}
              minLabel={DOMAIN_LABELS.overall[0]}
              midLabel={DOMAIN_LABELS.overall[5]}
              maxLabel={DOMAIN_LABELS.overall[10]}
            />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">What's one thing your spouse could do to improve these ratings?</h3>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share a gentle, constructive suggestion..."
                className="w-full p-4 h-32 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
              />
            </div>

            <button 
              onClick={submitSurvey}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl transition-all flex items-center justify-center ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving Progress...
                </>
              ) : 'Submit Weekly Pulse'}
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Overall Health Trends
              </h2>
              {entries.length > 0 ? (
                <MaritalChart data={chartData} />
              ) : (
                <div className="bg-slate-100 h-64 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                  Submit your first survey to see trends
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-indigo-900 mb-2">Weekly Email Summary</h4>
                <p className="text-sm text-slate-600">Reminders are sent every Sunday at 8:00 PM to your registered emails.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-emerald-900 mb-2">Tracking Streak</h4>
                <p className="text-sm text-slate-600">You've tracked {entries.filter(e => e.partnerType === user.partnerType).length} weeks of data so far.</p>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center">
        <button 
          onClick={() => setActiveTab('survey')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'survey' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Survey</span>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Reports</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
