import { Shield, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { subscribeToThreatFeed } from '../firebase/realtimeDB';
import { subscribeToAlerts } from '../firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [threats, setThreats] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribeThreats = subscribeToThreatFeed(setThreats);
    
    let unsubscribeAlerts = () => {};
    let unsubscribeScans = () => {};
    let unsubscribeReports = () => {};

    try {
      unsubscribeAlerts = subscribeToAlerts(user.uid, setAlerts);

      // Subscribe to user's scans
      const scansQuery = query(collection(db, `scans/${user.uid}/results`));
      unsubscribeScans = onSnapshot(scansQuery, (snapshot) => {
        setScans(snapshot.docs.map(doc => doc.data()));
      }, (err) => console.warn('Scans subscription failed:', err.message));

      // Subscribe to user's reports
      const reportsQuery = query(collection(db, 'scamReports'), where('uid', '==', user.uid));
      unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
        setReports(snapshot.docs.map(doc => doc.data()));
      }, (err) => console.warn('Reports subscription failed:', err.message));
    } catch (e) {
      console.warn('Firebase features limited:', e);
    }

    // Simulate incoming threats for demo
    const interval = setInterval(() => {
      const types = ['PHISHING', 'MALWARE', 'SCAM', 'BOTNET'];
      const locations = ['USA', 'Germany', 'Japan', 'Brazil', 'UK', 'China'];
      const sources = ['secure-login.net', 'update-patch.exe', 'crypto-win.io', 'bank-verify.com'];
      
      const newThreat = {
        type: types[Math.floor(Math.random() * types.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        severity: Math.random() > 0.7 ? 'critical' : 'warning',
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: Date.now()
      };
      
      // We don't actually push to DB here to avoid cluttering real DB, 
      // but we update local state to show "real-time" feel
      setThreats(prev => [newThreat, ...prev].slice(0, 20));
    }, 5000);

    return () => {
      unsubscribeThreats();
      unsubscribeAlerts();
      unsubscribeScans();
      unsubscribeReports();
      clearInterval(interval);
    };
  }, [user]);

  const riskScoreData = [
    { name: 'Risk', value: profile?.riskScore || 24, fill: '#00F5FF' }
  ];

  const trendData = [
    { name: 'Mon', attempts: 12 },
    { name: 'Tue', attempts: 19 },
    { name: 'Wed', attempts: 15 },
    { name: 'Thu', attempts: 22 },
    { name: 'Fri', attempts: 30 },
    { name: 'Sat', attempts: 25 },
    { name: 'Sun', attempts: 28 },
  ];

  const stats = [
    { name: 'Threats Detected', value: scans.filter(s => s.result !== 'SAFE').length.toString(), icon: Zap, color: 'text-accent-cyan' },
    { name: 'Phishing Blocked', value: scans.filter(s => s.result === 'DANGEROUS').length.toString(), icon: Shield, color: 'text-accent-green' },
    { name: 'Scam Reports', value: reports.length.toString(), icon: AlertTriangle, color: 'text-accent-red' },
    { name: 'Alerts Received', value: alerts.length.toString(), icon: CheckCircle, color: 'text-white' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 
          className="text-4xl font-display font-bold tracking-tighter"
        >
          Hello, <span className="text-accent-cyan">{profile?.displayName?.split(' ')[0]}</span>
        </h1>
        <p className="text-text-muted mt-2">Your security status is currently <span className="text-accent-green font-bold uppercase">Optimized</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.name}
                className="glass-card p-6"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{stat.name}</div>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          <div 
            className="glass-card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-cyan" />
                Fraud Attempt Trend
              </h3>
              <div className="text-xs font-bold text-accent-green uppercase tracking-widest">+12% vs last week</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#8892B0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8892B0" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F1629', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#00F5FF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attempts" 
                    stroke="#00F5FF" 
                    strokeWidth={3} 
                    dot={{ fill: '#00F5FF', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Alerts</h3>
              <button className="text-sm font-bold text-accent-cyan hover:underline">View All</button>
            </div>
            <div className="divide-y divide-white/10">
              {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-accent-red/20 text-accent-red' :
                    alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-accent-cyan/20 text-accent-cyan'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold">{alert.title}</h4>
                      <span className="text-xs text-text-muted">{new Date(alert.timestamp?.toDate()).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-text-muted">{alert.message}</p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-text-muted">No recent alerts found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Gauge & Live Feed */}
        <div className="space-y-8">
          {/* Risk Score Gauge */}
          <div
            className="glass-card p-8 text-center"
          >
            <h3 className="text-xl font-bold mb-4">Risk Score</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={10} 
                  data={riskScoreData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={5} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <div className="text-5xl font-display font-black text-accent-cyan">{profile?.riskScore || 24}</div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Low Risk</div>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-4">Your score is better than 82% of users in your region.</p>
          </div>

          {/* Live Threat Feed */}
          <div
            className="glass-card h-[600px] flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red"></span>
                </span>
                Live Threat Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {threats.map((threat) => (
                <div key={threat.id} className="p-4 bg-bg-primary/50 border border-white/5 rounded-xl text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded uppercase font-black tracking-tighter ${
                      threat.severity === 'critical' ? 'bg-accent-red text-white' : 'bg-accent-cyan text-bg-primary'
                    }`}>
                      {threat.type}
                    </span>
                    <span className="text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium text-text-primary mb-1">{threat.source} Source</div>
                  <div className="text-text-muted flex items-center justify-between">
                    <span>{threat.location}</span>
                    <ArrowUpRight className="w-3 h-3 text-accent-cyan" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
