"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
    Receipt, CheckCircle2, XCircle, Clock, 
    Loader2, CreditCard, Calendar, Package
} from "lucide-react";

// Tipe data transaksi
interface Transaction {
    id: string;
    order_id: string;
    plan_type: string;
    amount: number;
    status: string;
    payment_type: string;
    duration_months: number;
    created_at: string;
    updated_at: string;
}

/**
 * Format angka ke format Rupiah
 */
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 */
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

/**
 * Komponen badge status pembayaran
 */
function StatusBadge({ status }: { status: string }) {
    const config: any = {
        paid: { 
            icon: <CheckCircle2 size={12}/>, 
            label: "Lunas", 
            className: "bg-green-500/10 text-green-400 border border-green-500/20" 
        },
        pending: { 
            icon: <Clock size={12}/>, 
            label: "Pending", 
            className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
        },
        failed: { 
            icon: <XCircle size={12}/>, 
            label: "Gagal", 
            className: "bg-red-500/10 text-red-400 border border-red-500/20" 
        },
        challenge: { 
            icon: <Clock size={12}/>, 
            label: "Diverifikasi", 
            className: "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
        },
    };

    const { icon, label, className } = config[status] || config.pending;

    return (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${className}`}>
            {icon} {label}
        </span>
    );
}

export default function BillingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil data user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Ambil profil & status langganan
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("tier_name, subscription_status, subscription_end_date")
                    .eq("id", user.id)
                    .single();

                setProfile(profileData);

                // Ambil riwayat transaksi
                const { data: trxData } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                setTransactions(trxData || []);

            } catch (e) {
                console.error("Error fetch billing:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="h-full flex items-center justify-center pt-20">
            <Loader2 className="animate-spin text-amber-500" size={32}/>
        </div>
    );

    return (
        <div className="p-6 max-w-3xl mx-auto">
            
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Receipt size={24} className="text-amber-500"/> Riwayat Pembayaran
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Semua transaksi dan status langganan kamu.</p>
            </div>

            {/* KARTU STATUS LANGGANAN */}
            {profile && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Status Langganan</h2>
                    <div className="grid grid-cols-3 gap-4">
                        
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                                <Package size={10}/> Paket
                            </span>
                            <span className="font-black text-white text-lg uppercase">
                                {profile.tier_name || "FREE"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                                <CheckCircle2 size={10}/> Status
                            </span>
                            <span className={`font-bold text-sm ${profile.subscription_status === "active" ? "text-green-400" : "text-zinc-500"}`}>
                                {profile.subscription_status === "active" ? "✅ Aktif" : "❌ Tidak Aktif"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                                <Calendar size={10}/> Expired
                            </span>
                            <span className="font-bold text-sm text-white">
                                {profile.subscription_end_date 
                                    ? formatDate(profile.subscription_end_date)
                                    : "-"
                                }
                            </span>
                        </div>

                    </div>
                </div>
            )}

            {/* TABEL TRANSAKSI */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Riwayat Transaksi
                    </h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard size={40} className="text-zinc-700 mx-auto mb-3"/>
                        <p className="text-zinc-500 text-sm">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {transactions.map((trx) => (
                            <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition">
                                
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-sm uppercase">
                                        Paket {trx.plan_type}
                                    </span>
                                    <span className="text-zinc-600 text-[11px]">
                                        {trx.order_id}
                                    </span>
                                    <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                                        <Calendar size={10}/> {formatDate(trx.created_at)}
                                    </span>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-white font-black">
                                        {formatRupiah(trx.amount)}
                                    </span>
                                    <StatusBadge status={trx.status}/>
                                    {trx.payment_type && (
                                        <span className="text-zinc-600 text-[10px] capitalize">
                                            via {trx.payment_type.replace(/_/g, " ")}
                                        </span>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}