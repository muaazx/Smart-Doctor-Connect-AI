import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Using onSnapshot for real-time updates
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Activity className="animate-spin text-blue-600" /></div>;

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 bg-background min-h-screen">
      <header className="h-20 glass px-8 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-all">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
          <span className="hover:text-blue-600 cursor-pointer font-black uppercase tracking-widest">Health Console</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">Patient Portal</span>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[10px] shadow-lg shadow-blue-500/20">
                {profile?.name?.charAt(0) || 'P'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {profile?.name || 'Verified Patient'}
              </span>
           </div>
           <Link to="/doctors">
             <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 rounded-full px-8 shadow-xl shadow-blue-500/20 text-[10px] uppercase tracking-widest transition-all active:scale-95">
                New Session
             </Button>
           </Link>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Wellness Summary */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Health Index Matrix</span>
              <Activity className="text-blue-400 animate-pulse" size={18} />
            </div>
            <div className="mt-6 text-5xl font-black tracking-tighter relative z-10">
              84.2<span className="text-sm font-bold text-slate-500 ml-2 tracking-widest">/ 100</span>
            </div>
            <div className="mt-6 w-full bg-slate-800 h-2 rounded-full overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              ></motion.div>
            </div>
            <div className="mt-4 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black italic relative z-10">Diagnostic Confidence: Optimal</div>
          </motion.div>

          {/* Visits Tracker */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Confirmed Logs</span>
              <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${confirmedCount > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-lg shadow-green-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {confirmedCount > 0 ? 'Session Ready' : 'Standby'}
              </span>
            </div>
            <div className="mt-6 text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{confirmedCount}</div>
            <div className="mt-6 flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 ${i <= confirmedCount ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
              ))}
            </div>
            <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Upcoming Engagements</div>
          </motion.div>

          {/* Pending Alerts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Awaiting Response</span>
              <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${pendingCount > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {pendingCount > 0 ? 'Neural Triage' : 'Queue Empty'}
              </span>
            </div>
            <div className="mt-6 text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{pendingCount}</div>
            <div className="mt-6 flex items-end h-8 gap-1.5">
              <div className="bg-blue-600/10 w-full h-4 rounded-full"></div>
              <div className="bg-blue-600/20 w-full h-7 rounded-full"></div>
              <div className="bg-blue-600/40 w-full h-5 rounded-full"></div>
              <div className="bg-blue-600 w-full h-8 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
            </div>
            <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Network Latency: Low</div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 dark:border-white/5"
        >
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 dark:text-white">Visit Log History</h3>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-mono">REGISTRY-ID: {user?.uid.slice(0, 8)}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">
                <tr>
                  <th className="px-8 py-5">Medical Specialist</th>
                  <th className="px-8 py-5">Domain</th>
                  <th className="px-8 py-5">Chronology</th>
                  <th className="px-8 py-5">Registry Status</th>
                  <th className="px-8 py-5 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600 dark:text-slate-300">
                {appointments.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-[11px] font-black italic shadow-lg group-hover:scale-110 transition-transform">
                          {app.doctorName?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{app.doctorName}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">Verified Specialist</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800">
                        {app.specialization || 'Clinical'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-[10px] text-slate-500 dark:text-slate-400 tracking-widest">
                      {app.date} <span className="text-slate-300 dark:text-slate-700">|</span> {app.timeSlot}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        app.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        app.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <Link to={`/doctor/${app.doctorId}`}>
                          <Button variant="ghost" size="sm" className="h-9 px-5 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-100 dark:border-white/10 rounded-xl transition-all">
                             View Node
                          </Button>
                       </Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Activity size={48} className="text-slate-300 dark:text-slate-700" />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">Registry Cache Empty</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
