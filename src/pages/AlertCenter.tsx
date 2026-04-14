import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, AlertTriangle, Info, CheckCircle, Trash2, Filter, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToAlerts, markAlertAsRead } from '../firebase/firestore';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AlertCenter() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAlerts(user.uid, setAlerts);
    return () => unsubscribe();
  }, [user]);

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' ? true : alert.severity === filter
  );

  const handleMarkAsRead = async (alertId: string) => {
    if (!user) return;
    await markAlertAsRead(user.uid, alertId);
  };

  const pushTestAlert = async () => {
    if (!user) return;
    const severities: ('critical' | 'warning' | 'info')[] = ['critical', 'warning', 'info'];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    
    await addDoc(collection(db, `alerts/${user.uid}/userAlerts`), {
      title: `Test ${randomSeverity.toUpperCase()} Alert`,
      message: `This is a simulated ${randomSeverity} security notification for testing purposes.`,
      severity: randomSeverity,
      read: false,
      timestamp: Timestamp.now()
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tighter mb-2">Alert Center</h1>
          <p className="text-text-muted">Manage your security notifications and system alerts.</p>
        </div>
        <button
          onClick={pushTestAlert}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Test Alert
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-accent-cyan text-bg-primary' 
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`glass-card p-6 flex items-start gap-6 relative overflow-hidden group ${
                !alert.read ? 'border-l-4 border-l-accent-cyan' : 'opacity-60'
              }`}
            >
              <div className={`p-3 rounded-xl ${
                alert.severity === 'critical' ? 'bg-accent-red/20 text-accent-red' :
                alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-accent-cyan/20 text-accent-cyan'
              }`}>
                {alert.severity === 'critical' ? <AlertTriangle className="w-6 h-6" /> :
                 alert.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                 <Info className="w-6 h-6" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-lg truncate ${!alert.read ? 'text-text-primary' : 'text-text-muted'}`}>
                    {alert.title}
                  </h3>
                  <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                    {new Date(alert.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
                <p className="text-text-muted text-sm leading-relaxed mb-4">
                  {alert.message}
                </p>
                
                {!alert.read && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark as Read
                  </button>
                )}
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-accent-red transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          )) : (
            <div className="glass-card p-20 text-center">
              <Bell className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-text-muted">No alerts found</h3>
              <p className="text-text-muted mt-2">You're all caught up! No security threats detected.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
