
"use client";

import { useState, useMemo } from 'react';
import { usePixelCart } from '@/lib/store';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck, Home, Building2, Save, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

export default function DeliveryTariffsPage() {
  const { deliveryTariffs, updateDeliveryTariff } = usePixelCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [localTariffs, setLocalTariffs] = useState<{ [key: string]: { home: string, desk: string } }>({});

  const filteredStates = useMemo(() => {
    return ALGERIA_STATES.filter(state => 
      state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handlePriceChange = (state: string, type: 'home' | 'desk', value: string) => {
    setLocalTariffs(prev => ({
      ...prev,
      [state]: {
        ...(prev[state] || { 
          home: deliveryTariffs.find(t => t.stateName === state)?.homePrice.toString() || '0', 
          desk: deliveryTariffs.find(t => t.stateName === state)?.deskPrice.toString() || '0' 
        }),
        [type]: value
      }
    }));
  };

  const handleSave = (state: string) => {
    const tariff = localTariffs[state];
    if (!tariff) return;

    updateDeliveryTariff(state, {
      stateName: state,
      homePrice: parseFloat(tariff.home) || 0,
      deskPrice: parseFloat(tariff.desk) || 0
    });

    toast({
      title: "Tarif mis à jour",
      description: `Les prix pour ${state} ont été enregistrés.`
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tarifs de Livraison</h1>
        <p className="text-muted-foreground">Définissez les frais de port par wilaya pour la livraison à domicile ou au bureau.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Livraison à Domicile</CardTitle>
              <CardDescription>Prix pour le transport jusqu'au pas de la porte.</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Livraison au Bureau</CardTitle>
              <CardDescription>Prix pour le retrait en point relais ou agence.</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-card p-4 rounded-xl border flex items-center gap-4 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher une wilaya..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Wilaya</TableHead>
              <TableHead>Prix Domicile (DA)</TableHead>
              <TableHead>Prix Bureau (DA)</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStates.map((state) => {
              const dbTariff = deliveryTariffs.find(t => t.stateName === state);
              const localTariff = localTariffs[state];
              
              const homeValue = localTariff?.home ?? (dbTariff?.homePrice.toString() || '0');
              const deskValue = localTariff?.desk ?? (dbTariff?.deskPrice.toString() || '0');
              
              const isDirty = localTariff !== undefined;

              return (
                <TableRow key={state}>
                  <TableCell className="font-bold">{state}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-32" 
                      value={homeValue}
                      onChange={(e) => handlePriceChange(state, 'home', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-32" 
                      value={deskValue}
                      onChange={(e) => handlePriceChange(state, 'desk', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      className="gap-2"
                      variant={isDirty ? "default" : "outline"}
                      onClick={() => handleSave(state)}
                    >
                      <Save className="h-4 w-4" />
                      {isDirty ? "Enregistrer" : "Sauvegardé"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
