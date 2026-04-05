"use client";

import { usePixelCart } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Trash2,
  LayoutGrid,
  BoxSelect,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const firestore = useFirestore();
  const { orders, updateOrderStatus, settings } = usePixelCart();
  
  const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <LayoutGrid className="h-12 w-12 text-muted-foreground opacity-20" />
        <p className="text-muted-foreground font-black uppercase tracking-widest">Commande introuvable</p>
        <Button onClick={() => router.push('/admin/orders')}>Retour aux commandes</Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Supprimer définitivement cette commande ?")) {
      const docRef = doc(firestore, 'orders', order.id);
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Commande supprimée" });
      router.push('/admin/orders');
    }
  };

  const items = (order.items && order.items.length > 0)
    ? order.items 
    : [{ 
        productId: order.productId,
        productName: order.productName, 
        quantity: order.quantity, 
        price: (order.totalAmount - (order.deliveryCost || 0)) / order.quantity,
        selectedVariant: order.selectedVariant,
        productImage: order.productImage 
      }];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/orders" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-4">
            <ArrowLeft className="h-3 w-3" />
            Retour à la liste
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">{order.id}</h1>
            <Badge variant="outline" className="h-7 px-4 font-black uppercase text-[10px]">
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Passée le {new Date(order.createdAt).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select 
            value={order.status} 
            onValueChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}
          >
            <SelectTrigger className="w-48 h-12 rounded-xl border-2 border-primary/10 font-bold">
              <SelectValue placeholder="Changer le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="ready">Prêt à expédier</SelectItem>
              <SelectItem value="at_office">Au bureau</SelectItem>
              <SelectItem value="shipped">Vers Wilaya</SelectItem>
              <SelectItem value="delivering">En livraison</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Détails du Panier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-6 group hover:bg-muted/5 transition-colors">
                    <div className="relative h-20 w-20 rounded-2xl bg-muted border overflow-hidden shrink-0 shadow-inner">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" unoptimized={item.productImage.startsWith('data:')} />
                      ) : <BoxSelect className="h-8 w-8 text-muted-foreground/30 m-auto" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-black text-sm uppercase">{item.productName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.selectedVariant && (
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase">{item.selectedVariant}</Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] font-bold">Qté: {item.quantity}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Prix Unitaire</p>
                      <p className="font-black text-primary">{(item.price || 0).toLocaleString()} DA</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-8 bg-muted/10 border-t space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold uppercase">Sous-total</span>
                  <span className="font-black">{(order.totalAmount - (order.deliveryCost || 0)).toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold uppercase">Livraison ({order.deliveryType === 'home' ? 'Domicile' : 'Bureau'})</span>
                  <span className="font-black">{(order.deliveryCost || 0).toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-2xl font-black border-t-2 border-dashed pt-4 border-primary/10">
                  <span className="uppercase tracking-tighter">Total à Encaisser</span>
                  <span className="text-primary">{order.totalAmount.toLocaleString()} DA</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                  <DollarSign className="h-3 w-3" />
                  PAIEMENT CASH À LA LIVRAISON (COD)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <User className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nom Complet</label>
                <p className="text-xl font-black">{order.customerName}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Téléphone</label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Phone className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-black">{order.phone}</p>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Destination</label>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black">{order.state}</p>
                    <p className="text-sm text-muted-foreground font-bold">{order.commune}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type de livraison</label>
                {order.deliveryType === 'home' ? (
                  <Badge className="bg-blue-600 text-white border-none h-10 gap-3 px-4 rounded-xl">
                    <PackageCheck className="h-4 w-4" />
                    À DOMICILE
                  </Badge>
                ) : (
                  <Badge className="bg-indigo-600 text-white border-none h-10 gap-3 px-4 rounded-xl">
                    <PackageCheck className="h-4 w-4" />
                    AU BUREAU (AGENCE)
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
