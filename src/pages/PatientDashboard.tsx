import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, MessageSquare, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Activity className="animate-spin text-blue-600" /></div>;

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <span className="hover:text-blue-600 cursor-pointer font-medium tracking-tight">Main Controller</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Patient Metrics</span>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-3 bg-slate-100 px-4 py-1.5 rounded-md border border-slate-200">
              <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-black text-[10px]">
                {profile?.name?.charAt(0) || 'P'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {profile?.name || 'Authorized User'}
              </span>
           </div>
           <Link to="/doctors">
             <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 rounded-md px-5 shadow-sm text-xs uppercase tracking-widest">
                Search Node
             </Button>
           </Link>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full content-start overflow-hidden">
          {/* Wellness Summary */}
          <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Health Index</span>
              <Activity className="text-blue-400" size={16} />
            </div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight">84.2<span className="text-sm font-normal text-slate-500 ml-1">/ 100</span></div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '84%' }}></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold italic">System Confidence: High</div>
          </div>

          {/* Visits Tracker */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500 font-medium">Scheduled Visits</span>
              <span className={`status-badge ${confirmedCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`}>
                {confirmedCount > 0 ? 'Confirmed' : 'None'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{confirmedCount}</div>
            <div className="mt-3 flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= confirmedCount ? 'bg-green-500' : 'bg-slate-100'}`}></div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold leading-none">Authentication: Verified</div>
          </div>

          {/* Pending Alerts */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500 font-medium">Awaiting Provider</span>
              <span className={`status-badge ${pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`}>
                {pendingCount > 0 ? 'Active Queue' : 'Clear'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 italic tracking-tighter">{pendingCount}</div>
            <div className="mt-3 flex items-end h-8 space-x-1">
              <div className="bg-blue-100 w-full h-4 rounded-t-sm"></div>
              <div className="bg-blue-200 w-full h-6 rounded-t-sm"></div>
              <div className="bg-blue-300 w-full h-5 rounded-t-sm"></div>
              <div className="bg-blue-600 w-full h-8 rounded-t-sm"></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Network Latency: Low</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-800">Visit Log Activity</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">NODE-SYNC-2026</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-200">Physician Identity</th>
                  <th className="px-6 py-3 border-b border-slate-200">Protocol</th>
                  <th className="px-6 py-3 border-b border-slate-200">Timeline</th>
                  <th className="px-6 py-3 border-b border-slate-200">State</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {appointments.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-black italic">
                          {app.doctorName?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.doctorName}</p>
                          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter italic">V-SPEC-AUTH</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200 leading-none">
                        {app.specialization || 'Clinical'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {app.date} | {app.timeSlot}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        app.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link to={`/doctor/${app.doctorId}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-blue-600 font-bold text-[9px] uppercase tracking-widest hover:bg-blue-50 border border-slate-100">
                             View Node
                          </Button>
                       </Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold italic uppercase tracking-tighter text-sm">
                      Zero sequence detected on your node.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
