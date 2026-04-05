"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePixelCart } from '@/lib/store';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  User, 
  Phone, 
  ShoppingBag, 
  Plus, 
  Minus, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Tags, 
  Layers,
  Home,
  Building2,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Order, ProductVariant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const ALGERIA_STATES = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة", 
  "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة", 
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو", 
  "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة", 
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة", 
  "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة", 
  "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس", 
  "36 - الطارف", "37 - تندوف", "38 - تسمسيلت", "39 - الوادي", "40 - خنشلة", 
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلة", "45 - النعامة", 
  "46 - عين تموشنت", "47 - غرداية", "48 - غليزان"
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const { products, addToCart, addOrder, settings, deliveryTariffs } = usePixelCart();
  const product = id ? products.find(p => p.id === id) : null;
  
  const [quantity, setQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+213 ',
    state: '',
    commune: ''
  });

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const currentPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.price;
    return product?.price || 0;
  }, [selectedVariant, product]);

  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.countInStock;
    return product?.countInStock || 0;
  }, [selectedVariant, product]);

  const deliveryCost = useMemo(() => {
    if (!formData.state) return 0;
    const tariff = deliveryTariffs.find(t => t.stateName === formData.state);
    if (!tariff) return 0;
    return deliveryType === 'home' ? tariff.homePrice : tariff.deskPrice;
  }, [formData.state, deliveryType, deliveryTariffs]);

  const totalWithShipping = useMemo(() => {
    return (currentPrice * quantity) + deliveryCost;
  }, [currentPrice, quantity, deliveryCost]);

  const productImages = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return ['https://picsum.photos/seed/placeholder/800/800'];
    }
    return product.images;
  }, [product]);

  if (!id || !product) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du produit...</p>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const prefix = '+213 ';
    
    if (!val.startsWith(prefix)) {
      val = prefix;
    }
    
    // Only allow digits after the prefix and limit to 10 digits as requested
    const digits = val.slice(prefix.length).replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: prefix + digits });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Ajouté au panier",
      description: `${quantity} ${product.name} ajouté(s).`,
    });
  };

  const handleQuickPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneDigits = formData.phone.replace('+213 ', '').trim();
    if (!formData.fullName || phoneDigits.length < 8 || !formData.state) {
      toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول وادخال رقم هاتف صحيح لإكمال الطلب.",
      });
      return;
    }

    setPurchaseLoading(true);

    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: formData.fullName,
      phone: formData.phone,
      state: formData.state,
      commune: formData.commune,
      productId: product.id,
      productName: product.name,
      productImage: productImages[0],
      quantity: quantity,
      totalAmount: totalWithShipping,
      deliveryType: deliveryType,
      deliveryCost: deliveryCost,
      selectedVariant: selectedVariant?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: [{
        productId: product.id,
        productName: product.name,
        productImage: productImages[0],
        quantity: quantity,
        price: currentPrice,
        selectedVariant: selectedVariant?.name || ''
      }]
    };

    addOrder(newOrder);

    setPurchaseLoading(false);
    toast({
      title: "تم إرسال طلبك بنجاح!",
      description: `${settings.checkoutSuccessMsgAr || "شكرا، سنتصل بك قريبا لتأكيد الطلب."}`,
    });
    
    setFormData({ fullName: '', phone: '+213 ', state: '', commune: '' });
    setQuantity(1);
  };

  const checkoutStyles = {
    '--checkout-accent': `hsl(${settings.checkoutColor || settings.primaryColor})`,
    '--checkout-bg': `hsl(${settings.checkoutBgColor || "0 0% 100%"})`,
    '--checkout-badge': `hsl(${settings.priceBadgeColor || "24 95% 53%"})`
  } as React.CSSProperties;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        العودة للمتجر
      </Button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
        {/* Left Column: Images and Trust Badges - Now with sticky option for desktop */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-2xl border border-primary/5 group">
            <Image
              src={productImages[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            
            {productImages.length > 1 && (
              <>
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg z-10"
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg z-10"
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % productImages.length)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full font-black text-sm animate-pulse shadow-xl z-10">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {productImages.map((img, i) => (
              <button 
                key={i}
                className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                onClick={() => setCurrentImageIndex(i)}
              >
                <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 text-center border rounded-2xl bg-card shadow-sm">
              <Truck className="mb-2 h-6 w-6 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">توصيل سريع</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center border rounded-2xl bg-card shadow-sm">
              <RefreshCw className="mb-2 h-6 w-6 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">ضمان حقيقي</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center border rounded-2xl bg-card shadow-sm">
              <ShieldCheck className="mb-2 h-6 w-6 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">أصلي 100%</p>
            </div>
          </div>
        </div>

        {/* Right Column: ALL ORDER INFO & FORM - Perfectly aligned next to image */}
        <div className="flex flex-col space-y-6" dir="rtl" style={checkoutStyles}>
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary border-none text-xs px-3 py-1">{product.category}</Badge>
              {product.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
            
            <h1 className="font-headline text-3xl font-black lg:text-4xl text-foreground leading-tight">{product.name}</h1>
            
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-primary">{currentPrice.toLocaleString()} دج</span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-lg text-muted-foreground/60 line-through font-bold">
                  {product.originalPrice.toLocaleString()} دج
                </span>
              )}
            </div>
          </div>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-black flex items-center gap-2 text-muted-foreground">
                <Layers className="h-3 w-3 text-primary" /> اختر النوع:
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    className={`p-2.5 text-xs rounded-xl border-2 transition-all font-bold ${selectedVariant?.name === v.name ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-primary/40'}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK CHECKOUT CARD - Main Focus */}
          <Card 
            className="border-[var(--checkout-accent)]/30 shadow-[0_25px_60px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden border-2"
            style={{ backgroundColor: 'var(--checkout-bg)' }}
          >
            <div className="bg-[var(--checkout-accent)]/5 p-5 border-b border-[var(--checkout-accent)]/10 text-center">
              <h2 className="text-xl font-black text-[var(--checkout-accent)] flex items-center justify-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                {settings.checkoutTitleAr || "املأ البيانات للطلب"}
              </h2>
            </div>
            <CardContent className="p-6 md:p-8 space-y-6">
              <form onSubmit={handleQuickPurchase} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-wider">{settings.nameLabelAr || "الاسم الكامل"}</Label>
                    <div className="relative">
                      <User className="absolute right-4 top-3.5 h-4 w-4 text-[var(--checkout-accent)]" />
                      <Input 
                        placeholder={settings.nameLabelAr || "الاسم الكامل"} 
                        className="pr-12 h-12 border-2 border-[var(--checkout-accent)]/10 focus:border-[var(--checkout-accent)] rounded-2xl text-lg"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-wider">{settings.phoneLabelAr || "رقم الهاتف"}</Label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-3.5 h-4 w-4 text-[var(--checkout-accent)]" />
                      <Input 
                        placeholder={settings.phoneLabelAr || "رقم الهاتف"} 
                        type="tel"
                        className="pr-12 h-12 border-2 border-[var(--checkout-accent)]/10 focus:border-[var(--checkout-accent)] rounded-2xl text-lg"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-wider">{settings.stateLabelAr || "الولاية"}</Label>
                    <Select 
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })} 
                      required
                    >
                      <SelectTrigger className="h-12 border-2 border-[var(--checkout-accent)]/10 rounded-2xl text-lg">
                        <SelectValue placeholder={settings.stateLabelAr || "الولاية"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {ALGERIA_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-wider">{settings.communeLabelAr || "البلدية"}</Label>
                    <div className="relative">
                      <MapPin className="absolute right-4 top-3.5 h-4 w-4 text-[var(--checkout-accent)]" />
                      <Input 
                        placeholder={formData.state ? (settings.communeLabelAr || "البلدية") : "اختر الولاية أولاً"}
                        className="pr-12 h-12 border-2 border-[var(--checkout-accent)]/10 focus:border-[var(--checkout-accent)] rounded-2xl text-lg"
                        value={formData.commune}
                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                        disabled={!formData.state}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-wider">طريقة التوصيل:</Label>
                  <RadioGroup 
                    value={deliveryType} 
                    onValueChange={(val: 'home' | 'desk') => setDeliveryType(val)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem value="home" id="home" className="peer sr-only" />
                      <Label
                        htmlFor="home"
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-[var(--checkout-accent)] peer-data-[state=checked]:bg-[var(--checkout-accent)]/5 border-border hover:border-[var(--checkout-accent)]/40"
                      >
                        <Home className="h-6 w-6 mb-2 text-[var(--checkout-accent)]" />
                        <span className="font-bold text-xs">إلى المنزل</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="desk" id="desk" className="peer sr-only" />
                      <Label
                        htmlFor="desk"
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-[var(--checkout-accent)] peer-data-[state=checked]:bg-[var(--checkout-accent)]/5 border-border hover:border-[var(--checkout-accent)]/40"
                      >
                        <Building2 className="h-6 w-6 mb-2 text-[var(--checkout-accent)]" />
                        <span className="font-bold text-xs">إلى المكتب</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="relative pt-10">
                  <div 
                    className="absolute -top-6 left-6 z-20 text-white px-6 py-2 rounded-full font-black text-lg shadow-2xl transform -rotate-6 animate-bounce flex flex-col items-center border-2 border-white/20"
                    style={{ background: `var(--checkout-badge)` }}
                  >
                    <span>{totalWithShipping.toLocaleString()} دج</span>
                    {deliveryCost > 0 && (
                      <span className="text-[9px] opacity-80 font-bold">(شامل التوصيل)</span>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-2xl font-black rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] active:scale-95 gap-4" 
                    style={{ backgroundColor: 'var(--checkout-accent)' }}
                    disabled={currentStock <= 0 || purchaseLoading}
                  >
                    <ShoppingBag className="h-8 w-8" />
                    {settings.checkoutButtonTextAr || "تأكيد الطلب"}
                  </Button>
                </div>

                <div className="flex items-center gap-4 pt-2">
                   <div className="flex items-center border-2 border-[var(--checkout-accent)]/20 rounded-2xl bg-white h-14 overflow-hidden shadow-inner">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-full w-12 rounded-none hover:bg-[var(--checkout-accent)]/10 text-[var(--checkout-accent)]"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-12 text-center font-black text-xl">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-full w-12 rounded-none hover:bg-[var(--checkout-accent)]/10 text-[var(--checkout-accent)]"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-14 gap-3 border-2 text-[var(--checkout-accent)] font-black rounded-2xl hover:bg-[var(--checkout-accent)]/5"
                    style={{ borderColor: 'var(--checkout-accent)' }}
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    إضافة للسلة
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Description - Below the fold or secondary content area */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              وصف المنتج
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-6 rounded-2xl border-r-4 border-primary/20">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest pb-10">
            <Tags className="h-3 w-3" />
            <span>عرض حصري من بريكو برو ديزاد</span>
          </div>
        </div>
      </div>
    </div>
  );
}
