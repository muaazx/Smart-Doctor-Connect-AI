import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import DoctorCard from '@/components/DoctorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Activity, Sparkles, LineChart } from 'lucide-react';
import { getDoctorSuggestions } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialQuery);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const fetchDoctors = async (searchTerm: string) => {
    setLoading(true);
    try {
      const doctorsRef = collection(db, 'doctors');
      let q = query(doctorsRef, limit(20));

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const filtered = results.filter((doc: any) => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.location.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setDoctors(filtered);

      if (searchTerm.length > 3 && searchTerm.split(' ').length > 1) {
        getDoctorSuggestions(searchTerm).then(suggestion => {
          setAiSuggestion(suggestion);
        });
      } else {
        setAiSuggestion(null);
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
       <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <span className="hover:text-blue-600 cursor-pointer font-medium tracking-tight">Main Controller</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Provider Search</span>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-4xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query nodes by name, specialization, or location..."
                className="pl-12 h-12 rounded-md border-slate-200 bg-slate-50 font-medium focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all uppercase tracking-tight text-xs"
              />
            </div>
            <Button className="rounded-md px-8 h-12 bg-slate-900 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800">
              Execute Search
            </Button>
            <Button variant="ghost" className="rounded-md h-12 border border-slate-200 px-4 text-slate-400">
              <SlidersHorizontal size={18} />
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        <AnimatePresence>
          {aiSuggestion && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16"></div>
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 relative z-10 shadow-lg shadow-blue-900/50">
                <Sparkles size={32} />
              </div>
              <div className="flex-1 space-y-1 text-center md:text-left relative z-10">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">AI Diagnostic Insight</h4>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Specialization Recommended:</h3>
                   <span className="text-2xl font-black text-blue-500 italic tracking-tighter">{aiSuggestion.specialization}</span>
                </div>
                <p className="text-slate-400 text-sm font-medium tracking-wide max-w-2xl">{aiSuggestion.reason}</p>
              </div>
              <Button 
                onClick={() => {
                  setSearch(aiSuggestion.specialization);
                  fetchDoctors(aiSuggestion.specialization);
                }}
                className="rounded-md px-8 py-4 h-auto bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all relative z-10"
              >
                Sync with Specialists
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
           <div>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Discovery Results</h2>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {loading ? 'Scanning Nodes...' : `${doctors.length} Verified Providers found`}
              </p>
           </div>
           <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase">Sort by:</span>
              <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer">
                <LineChart size={14} className="inline mr-1" />
                <option>Performance</option>
                <option>Latency</option>
              </select>
           </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-[380px] bg-white rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="text-center py-24 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
            <Activity size={48} className="mx-auto text-slate-200 mb-6 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Node Not Found</h3>
            <p className="text-slate-400 text-sm font-medium mt-2">No active providers match your current query parameters.</p>
            <Button variant="ghost" className="mt-8 rounded-md border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]" onClick={() => fetchDoctors('')}>
              Reset Global Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
