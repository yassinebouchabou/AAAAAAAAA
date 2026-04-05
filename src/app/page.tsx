"use client";

import { useMemo } from 'react';
import { usePixelCart } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Hammer, Wrench, LayoutGrid, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Loading from './loading';
import { cn } from '@/lib/utils';

export default function Home() {
  const { products, settings, categories, isInitialLoading } = usePixelCart();

  const latestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  }, [products]);

  // Map settings to Tailwind grid column classes
  const productGridCols = {
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  }[settings.productColsDesktop || 6];

  const categoryGridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[settings.categoryColsDesktop || 3];

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Categories Explorer Section - Compact */}
      <section className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6">
          <div>
            <h2 className="font-headline text-xl font-bold">Explorer par Catégories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Trouvez l'équipement adapté à votre métier.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary font-bold gap-2 text-[10px] h-8">
            <Link href="/categories">
              Voir tout
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className={cn("grid grid-cols-1 gap-4", categoryGridCols)}>
          {categories.slice(0, settings.categoryColsDesktop || 3).map((cat) => (
            <Link key={cat.id} href={`/shop?category=${encodeURIComponent(cat.name)}`}>
              <Card className="group relative h-36 overflow-hidden rounded-xl border-none shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={cat.image || 'https://picsum.photos/seed/cat-industrial/600/400'} 
                    alt={cat.name} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                
                <CardContent className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h2 className="text-lg font-black">{cat.name}</h2>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-accent/90 mt-0.5">
                        Découvrir
                      </div>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {categories.length === 0 && !isInitialLoading && (
            <div className="col-span-full py-12 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
              <LayoutGrid className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-20" />
              <p className="text-xs text-muted-foreground">Configurez vos catégories dans le tableau de bord.</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Products Grid - Compact */}
      <section id="products" className="container mx-auto px-4 py-8 scroll-mt-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6">
          <div>
            <h2 className="font-headline text-xl font-bold">Nos Dernières Nouveautés</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Le meilleur de l'équipement pour votre chantier.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-primary">
            <Hammer className="h-3 w-3" />
            <span>{products.length} Articles</span>
          </div>
        </div>

        {latestProducts.length > 0 ? (
          <div className={cn("grid grid-cols-2 gap-3 sm:gap-6", productGridCols)}>
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !isInitialLoading && (
            <div className="bg-muted/50 rounded-2xl border-2 border-dashed p-12 text-center">
              <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-2">
                <Wrench className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-md font-bold mb-1">Inventaire en cours de mise à jour</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                Revenez très bientôt pour découvrir nos nouveautés !
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
