import { useState, FormEvent } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  UserX, 
  Link2, 
  Users, 
  Key, 
  ChevronDown, 
  Send,
  CheckCircle2,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { submitScamReport, incrementGlobalThreats } from '../firebase/firestore';

export default function AwarenessHub() {
  const { user } = useAuth();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const awarenessCards = [
    { 
      id: 'phishing', 
      title: 'Phishing Attacks', 
      icon: ShieldAlert, 
      desc: 'Learn how to spot fraudulent emails and websites designed to steal your data.',
      tips: ['Check the sender email address carefully.', 'Look for urgent or threatening language.', 'Hover over links to see the actual destination.']
    },
    { 
      id: 'identity', 
      title: 'Identity Theft', 
      icon: UserX, 
      desc: 'Protect your personal information from being used for fraudulent activities.',
      tips: ['Never share your SSN or private IDs online.', 'Use strong, unique passwords for every account.', 'Monitor your credit reports regularly.']
    },
    { 
      id: 'fake-links', 
      title: 'Fake Links', 
      icon: Link2, 
      desc: 'Shortened or masked URLs can lead to malware or credential harvesting sites.',
      tips: ['Use a URL expander to check shortened links.', 'Avoid clicking links in unsolicited messages.', 'Check for HTTPS and valid SSL certificates.']
    },
    { 
      id: 'social', 
      title: 'Social Engineering', 
      icon: Users, 
      desc: 'Manipulative tactics used to trick you into revealing confidential information.',
      tips: ['Be skeptical of unexpected requests for help.', 'Verify the identity of anyone asking for data.', 'Set boundaries for what you share on social media.']
    },
    { 
      id: 'passwords', 
      title: 'Weak Passwords', 
      icon: Key, 
      desc: 'The first line of defense. Weak passwords are the easiest way for hackers to get in.',
      tips: ['Use a password manager.', 'Enable Multi-Factor Authentication (MFA).', 'Avoid using common words or personal info.']
    },
    { 
      id: 'elderly', 
      title: 'Elderly Safety', 
      icon: HelpCircle, 
      desc: 'Specialized tips for protecting seniors from common online and phone scams.',
      tips: ['Talk to family about common scam tactics.', 'Set up "trusted contact" alerts.', 'Be wary of "grandparent" or "tech support" scams.']
    },
  ];

  const quizQuestions = [
    { q: "A bank emails you asking to 'verify your account' via a link. What do you do?", a: ["Click the link", "Delete the email", "Call the bank directly"], correct: 2 },
    { q: "What does 'HTTPS' in a URL signify?", a: ["High Speed", "Secure Connection", "Hyper Text"], correct: 1 },
    { q: "Which of these is a strong password?", a: ["Password123", "JohnDoe1985", "Tr0ub4dor&3!"], correct: 2 },
    { q: "What is Multi-Factor Authentication (MFA)?", a: ["Multiple passwords", "An extra security layer", "A type of virus"], correct: 1 },
    { q: "If a site has a padlock icon, it is 100% safe.", a: ["True", "False"], correct: 1 },
  ];

  const handleReportSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setReportStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const report = {
      uid: user.uid,
      type: formData.get('type'),
      description: formData.get('description'),
      url: formData.get('url'),
    };

    await submitScamReport(report);
    await incrementGlobalThreats();
    setReportStatus('success');
    setTimeout(() => setReportStatus('idle'), 3000);
    (e.target as HTMLFormElement).reset();
  };

  const handleQuizAnswer = (index: number) => {
    if (index === quizQuestions[quizStep].correct) {
      setQuizScore(prev => prev + 1);
    }
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      setShowQuizResult(true);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-display font-bold tracking-tighter mb-4">Awareness Hub</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Knowledge is your best defense. Explore our resources to stay protected 
          against the latest cyber threats and scams.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {awarenessCards.map((card) => (
          <div
            key={card.id}
            className={`glass-card overflow-hidden cursor-pointer transition-all ${
              expandedCard === card.id ? 'ring-2 ring-accent-cyan' : 'hover:border-accent-cyan/30'
            }`}
            onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
          >
            <div className="p-8">
              <card.icon className="w-12 h-12 text-accent-cyan mb-6" />
              <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-4">{card.desc}</p>
              <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-widest">
                {expandedCard === card.id ? 'Close Tips' : 'View Safety Tips'}
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedCard === card.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedCard === card.id && (
              <div
                className="bg-bg-primary/50 border-t border-white/10"
              >
                <div className="p-8 space-y-4">
                  <h4 className="font-bold text-accent-cyan uppercase text-xs tracking-widest">Pro Tips:</h4>
                  <ul className="space-y-3">
                    {card.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Scam Report Form */}
        <div
          className="glass-card p-8"
        >
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-accent-red" />
            Report a Scam
          </h2>
          <p className="text-text-muted mb-8">
            Found something suspicious? Report it here to help us protect others. 
            Our team will review the report and update our threat database.
          </p>

          <form onSubmit={handleReportSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Scam Type</label>
                <select 
                  name="type"
                  required
                  className="w-full bg-bg-primary border border-white/10 rounded-xl py-3 px-4 focus:border-accent-cyan outline-none transition-colors appearance-none"
                >
                  <option value="phishing">Phishing Email</option>
                  <option value="website">Malicious Website</option>
                  <option value="identity">Identity Theft</option>
                  <option value="other">Other Scam</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">URL (Optional)</label>
                <input 
                  type="text" 
                  name="url"
                  placeholder="https://..."
                  className="w-full bg-bg-primary border border-white/10 rounded-xl py-3 px-4 focus:border-accent-cyan outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</label>
              <textarea 
                name="description"
                required
                rows={4}
                placeholder="Describe the scam in detail..."
                className="w-full bg-bg-primary border border-white/10 rounded-xl py-3 px-4 focus:border-accent-cyan outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={reportStatus !== 'idle'}
              className="w-full py-4 bg-accent-red text-white font-bold rounded-xl hover:glow-red transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {reportStatus === 'submitting' ? 'Submitting...' : 
               reportStatus === 'success' ? 'Report Submitted!' : 'Submit Report'}
              {reportStatus === 'idle' && <Send className="w-5 h-5" />}
              {reportStatus === 'success' && <CheckCircle2 className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Quiz Section */}
        <div
          className="glass-card p-8 flex flex-col"
        >
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent-cyan" />
            Security Quiz
          </h2>
          
          <div className="flex-1 flex flex-col justify-center">
            {!showQuizResult ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">Question {quizStep + 1} of {quizQuestions.length}</span>
                  <div className="flex gap-1">
                    {quizQuestions.map((_, i) => (
                      <div key={i} className={`h-1 w-8 rounded-full ${i <= quizStep ? 'bg-accent-cyan' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold leading-tight">{quizQuestions[quizStep].q}</h3>
                
                <div className="space-y-3">
                  {quizQuestions[quizStep].a.map((answer, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full p-4 text-left bg-bg-primary/50 border border-white/10 rounded-xl hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all font-medium"
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-accent-cyan" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
                <p className="text-text-muted mb-8">You scored <span className="text-accent-cyan font-bold">{quizScore}</span> out of {quizQuestions.length}</p>
                <button
                  onClick={() => {
                    setQuizStep(0);
                    setQuizScore(0);
                    setShowQuizResult(false);
                  }}
                  className="px-8 py-3 bg-accent-cyan text-bg-primary font-bold rounded-xl hover:glow-cyan transition-all"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
