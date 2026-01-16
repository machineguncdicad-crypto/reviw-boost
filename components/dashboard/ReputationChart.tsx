"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; 
import { AreaChart, Area, Tooltip, YAxis, ResponsiveContainer, XAxis } from 'recharts';
import { Star, TrendingUp, TrendingDown, CalendarDays, Loader2 } from 'lucide-react';

export default function ReputationChart() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('hari'); 
  const [chartData, setChartData] = useState<any[]>([]); 
  
  const [stats, setStats] = useState({
      current: 0,
      isUp: true
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [filter]); 

  const fetchData = async () => {
      setLoading(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
          const { data: campaigns } = await supabase.from("campaigns").select("id").eq("user_id", user.id);
          
          let campaignIds = [];
          if (profile) campaignIds.push(profile.id);
          if (campaigns) campaigns.forEach((c: any) => campaignIds.push(c.id));

          if (campaignIds.length > 0) {
              const { data: feedbacks } = await supabase
                  .from("feedbacks")
                  .select("rating, created_at")
                  .in("campaign_id", campaignIds)
                  .order("created_at", { ascending: true });

              if (feedbacks) {
                  processChartData(feedbacks, filter);
              }
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  // --- LOGIKA JANTUNG (ZIG-ZAG) + AUTO FILL ---
  const processChartData = (data: any[], type: string) => {
      let processed: any[] = [];
      const now = new Date();

      if (type === 'hari') {
          // Ambil review 24 jam terakhir
          const recentReviews = data.filter((f: any) => {
              const fDate = new Date(f.created_at);
              const diffTime = Math.abs(now.getTime() - fDate.getTime());
              const diffHours = diffTime / (1000 * 60 * 60); 
              return diffHours <= 24; 
          });

          // Petakan: 1 Review = 1 Titik
          processed = recentReviews.map((r: any) => {
              const d = new Date(r.created_at);
              const timeLabel = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              return {
                  name: timeLabel,
                  rating: r.rating 
              };
          });

          // 🔥 PERBAIKAN: Kalau data cuma 1 (Titik Doang), bikin titik palsu di awal hari biar jadi garis lurus
          if (processed.length === 1) {
              processed.unshift({
                  name: "00:00",
                  rating: processed[0].rating // Nilainya sama, jadi garisnya datar (flat)
              });
          }

          // Kalau kosong total, kasih default
          if (processed.length === 0) {
             processed = [{name: '00:00', rating: 0}, {name: '23:59', rating: 0}]; 
          }

      } else if (type === 'minggu') {
          const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          // Ambil rating terakhir dari database sebagai nilai awal (carry over)
          let lastKnownRating = data.length > 0 ? data[data.length - 1].rating : 0;

          // Urutkan data berdasarkan waktu (penting buat carry over)
          const sortedData = [...data].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dayName = days[d.getDay()];

              const reviewsInDay = sortedData.filter((f: any) => {
                  const fDate = new Date(f.created_at);
                  return fDate.toDateString() === d.toDateString();
              });

              // Jika hari ini ada review, hitung rata-ratanya
              // Jika TIDAK ADA, pakai nilai terakhir (carry over) biar grafiknya nyambung terus
              if (reviewsInDay.length > 0) {
                  const sum = reviewsInDay.reduce((a:any, b:any) => a + b.rating, 0);
                  const avg = sum / reviewsInDay.length;
                  lastKnownRating = Number(avg.toFixed(1)); // Update nilai terakhir
              }

              processed.push({ name: dayName, rating: lastKnownRating });
          }

      } else if (type === 'bulan') {
          // Logika Bulan juga sama, pake carry over
          let lastKnownRating = data.length > 0 ? data[data.length - 1].rating : 0;
          const sortedData = [...data].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          for (let i = 3; i >= 0; i--) {
              const end = new Date();
              end.setDate(end.getDate() - (i * 7));
              const start = new Date();
              start.setDate(start.getDate() - (i * 7) - 7);

              const reviewsInWeek = sortedData.filter((f: any) => {
                  const fDate = new Date(f.created_at);
                  return fDate >= start && fDate <= end;
              });

              if (reviewsInWeek.length > 0) {
                  const sum = reviewsInWeek.reduce((a:any, b:any) => a + b.rating, 0);
                  const avg = sum / reviewsInWeek.length;
                  lastKnownRating = Number(avg.toFixed(1));
              }

              processed.push({ name: `Mg ${4-i}`, rating: lastKnownRating });
          }
      }

      setChartData(processed);

      // Update Angka Summary
      if (processed.length > 0) {
          const curr = processed[processed.length - 1].rating;
          const prev = processed.length >= 2 ? processed[processed.length - 2].rating : curr;
          setStats({ current: curr, isUp: curr >= prev });
      }
  };

  if (!mounted) return <div className="h-40 bg-zinc-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm group hover:border-zinc-700 transition-colors">
      
      {/* HEADER ATAS */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             <Star size={12} className="text-yellow-500 fill-yellow-500" />
             <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Live Rating</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white leading-none tracking-tight">
              {stats.current}
            </span>
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 ${
                stats.isUp ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
                {stats.isUp ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
            </div>
          </div>
        </div>

        {/* TOMBOL FILTER */}
        <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
            {['hari', 'minggu', 'bulan'].map((item) => (
                <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`px-2 py-1 rounded-md text-[9px] font-bold capitalize transition-all ${
                        filter === item 
                        ? 'bg-zinc-700 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {item}
                </button>
            ))}
        </div>
      </div>

      {/* CHART AREA */}
      <div className="relative z-10 -ml-4 select-none h-[100px]">
          {loading ? (
              <div className="h-full flex items-center justify-center pl-4">
                  <Loader2 className="animate-spin text-zinc-600" size={20}/>
              </div>
          ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stats.isUp ? "#fbbf24" : "#ef4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={stats.isUp ? "#fbbf24" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#09090b', 
                            border: '1px solid #27272a', 
                            borderRadius: '8px', 
                            fontSize: '11px',
                            padding: '6px 10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value: any) => [value, '⭐']}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                    />
                    
                    <YAxis domain={[0, 6]} hide />
                    <XAxis dataKey="name" hide />
                    
                    <Area 
                        type="monotone" 
                        dataKey="rating" 
                        stroke={stats.isUp ? "#fbbf24" : "#ef4444"} 
                        strokeWidth={2} 
                        fill="url(#colorRating)"
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                        animationDuration={500} 
                    />
                  </AreaChart>
              </ResponsiveContainer>
          ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-600 pl-4">
                  Belum ada data
              </div>
          )}
      </div>

      {/* Info Bawah */}
      <div className="relative z-10 flex items-center justify-between mt-1 border-t border-white/5 pt-2">
         <span className="text-[9px] text-zinc-500 font-medium flex items-center gap-1">
            <CalendarDays size={10}/> Data: {filter === 'hari' ? 'Real-time' : filter === 'minggu' ? '7 Hari' : '4 Minggu'}
         </span>
         <span className="text-[9px] text-zinc-600">Max 5.0</span>
      </div>

    </div>
  );
}