"use client";

import { usePixelCart } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Settings,
  ShoppingBag,
  Users,
  ChevronRight,
  Menu,
  ShieldCheck,
  User,
  Truck,
  Globe,
  LayoutGrid,
  Loader2,
  LogOut,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, settings, logout, orders } = usePixelCart();
  const router = useRouter();
  const pathname = usePathname();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pendingOrdersCount = pendingOrders.length;

  useEffect(() => {
    if (!isUserLoading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Vérification des accès admin...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Catalogue Produits', href: '/admin/products', icon: Package },
    { label: 'Gérer Catégories', href: '/admin/categories', icon: LayoutGrid },
    { label: 'Ajouter Produit', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Gestion Commandes', href: '/admin/orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { label: 'Tarifs Livraison', href: '/admin/delivery', icon: Truck },
    { label: 'Base Clients', href: '/admin/customers', icon: Users },
    { label: 'Configuration Site', href: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Connecté en tant que</span>
            </div>
            <h2 className="text-xl font-black text-foreground truncate leading-tight w-40" title={user?.name}>
              {user?.name || "Admin"}
            </h2>
          </div>
          
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 hover:bg-muted transition-colors relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {pendingOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl shadow-2xl border-primary/10 mt-2" align="end">
                <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Nouvelles Commandes</h3>
                  <Badge className="bg-white/20 text-white border-none text-[9px]">{pendingOrdersCount} en attente</Badge>
                </div>
                <ScrollArea className={cn("max-h-80", pendingOrdersCount > 0 ? "h-auto" : "h-20")}>
                  <div className="p-2 space-y-1">
                    {pendingOrdersCount === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground opacity-50">
                        <ShoppingBag className="h-6 w-6 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Tout est à jour</p>
                      </div>
                    ) : (
                      [...pendingOrders]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map(order => (
                          <Link key={order.id} href={`/admin/orders?status=pending`}>
                            <div className="p-3 rounded-xl hover:bg-black/5 transition-all border border-transparent hover:border-border group cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                                  {order.customerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black truncate text-foreground">{order.customerName}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold italic">{order.totalAmount.toLocaleString()} DA • {order.state}</p>
                                </div>
                                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                              </div>
                            </div>
                          </Link>
                        ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t bg-muted/30">
                  <Link href="/admin/orders?status=pending">
                    <Button variant="ghost" className="w-full h-9 text-[10px] font-black uppercase tracking-wider gap-2">
                      Voir tout le flux
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg w-fit">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
              Manager
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start gap-3 h-9 border-primary/20 text-primary hover:bg-primary/5 rounded-xl group transition-all text-xs">
            <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
            <span className="font-bold uppercase tracking-wider">Voir le Site Public</span>
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={cn(
                    "w-full justify-start gap-3 h-11 transition-all duration-300 rounded-xl px-4",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold scale-[1.02] hover:bg-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-white text-primary font-black text-[10px] px-1.5 h-5 rounded-md">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && !item.badge && <ChevronRight className="ml-auto h-4 w-4 animate-pulse" />}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-border/50">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm mb-4">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Boutique Active</p>
          <p className="text-xs font-black text-foreground truncate">{settings.brandName}</p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-bold">Déconnexion</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#f8fafc] overflow-hidden">
      <aside className="w-72 border-r bg-card hidden lg:block h-full shadow-sm">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-16 w-16 rounded-full shadow-2xl scale-110 bg-primary hover:bg-primary/90">
              <Menu className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu d'Administration</SheetTitle>
              <SheetDescription>Navigation vers les différentes sections de gestion.</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl p-6 md:p-10 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
