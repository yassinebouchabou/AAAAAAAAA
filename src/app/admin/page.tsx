"use client";

import { usePixelCart } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Bell,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboard() {
  const { products, orders } = usePixelCart();
  const [newOrderNotify, setNewOrderNotify] = useState<string | null>(null);
  const [initialCount, setInitialCount] = useState<number | null>(null);

  // Real-time Notification Logic for Dashboard Bar
  useEffect(() => {
    // Establish the initial count when orders first load
    if (orders.length > 0 && initialCount === null) {
      setInitialCount(orders.length);
    }
    
    // Detect new orders arriving via live snapshot
    if (initialCount !== null && orders.length > initialCount) {
      const latestOrder = [...orders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      if (latestOrder) {
        setNewOrderNotify(latestOrder.customerName);
        setInitialCount(orders.length);
      }
    }
  }, [orders, initialCount]);

  // Calculate real-time stats with strict memoization
  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const unique = new Set(orders.map(o => o.phone)).size;

    return [
      { title: "Produits Totaux", value: products.length, icon: Package, color: "text-blue-500", desc: "Inventaire actif" },
      { title: "Commandes Actives", value: active, icon: ShoppingBag, color: "text-emerald-500", desc: "En cours de traitement" },
      { title: "Clients Uniques", value: unique || 0, icon: Users, color: "text-orange-500", desc: "Basé sur les n° de téléphone" },
      { title: "Chiffre d'Affaires", value: `${revenue.toLocaleString()} DA`, icon: DollarSign, color: "text-purple-500", desc: "Revenu total cumulé" },
    ];
  }, [products.length, orders]);

  // Calculate Dynamic Chart Data (Last 7 Days Revenue)
  const chartData = useMemo(() => {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return dates.map(date => {
      const dayOrders = orders.filter(o => o.createdAt.split('T')[0] === date);
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        name: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: revenue
      };
    });
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Real-time Order Notification Bar */}
      {newOrderNotify && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl border-4 border-white/20 ring-1 ring-primary/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce shadow-inner border border-white/10">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                  Nouvelle Commande Arrivée !
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[11px] opacity-90 font-bold">
                  <span className="text-white underline decoration-white/30 underline-offset-2">{newOrderNotify}</span> vient de commander un article.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <Link href="/admin/orders">
                <Button 
                  size="sm" 
                  className="bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase rounded-xl h-8 px-4 flex items-center gap-1.5"
                >
                  Voir Commandes
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setNewOrderNotify(null)}
                className="hover:bg-white/10 text-white h-8 w-8 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight uppercase">Tableau de Bord</h1>
          <p className="text-muted-foreground text-sm">Analyse en temps réel de la performance de votre boutique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-xl transition-all duration-300 border-none shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase opacity-60">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ventes (7 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  tickFormatter={(value) => `${value} DA`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                  itemStyle={{ fontWeight: 700, color: 'hsl(var(--primary))', fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Revenu']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'white', strokeWidth: 3, stroke: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 group cursor-default">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-black leading-none uppercase truncate max-w-[180px]">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold italic">
                      {order.totalAmount.toLocaleString()} DA • {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-[9px] font-black uppercase px-2 py-1 bg-muted rounded-md text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                    {order.status}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic opacity-50">
                    Aucune commande enregistrée.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
