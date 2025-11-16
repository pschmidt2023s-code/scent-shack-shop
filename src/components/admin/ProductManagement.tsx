import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Upload, Image as ImageIcon, Save, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_number: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  in_stock: boolean;
  preorder: boolean;
  release_date: string | null;
  rating: number;
  review_count: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (productsError) {
      toast.error("Fehler beim Laden der Produkte");
      console.error(productsError);
    } else {
      setProducts(productsData || []);
    }

    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .order("created_at", { ascending: false });

    if (variantsError) {
      toast.error("Fehler beim Laden der Varianten");
      console.error(variantsError);
    } else {
      setVariants(variantsData || []);
    }

    setLoading(false);
  };

  const uploadImage = async (file: File, productId: string) => {
    try {
      setUploadingImageFor(productId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('products')
        .update({ image: publicUrl })
        .eq('id', productId);

      if (updateError) throw updateError;

      toast.success("Bild erfolgreich hochgeladen!");
      loadProducts();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Fehler beim Hochladen des Bildes");
    } finally {
      setUploadingImageFor(null);
    }
  };

  const ImageDropzone = ({ productId, currentImage }: { productId: string; currentImage: string | null }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadImage(acceptedFiles[0], productId);
      }
    }, [productId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp']
      },
      maxFiles: 1,
      disabled: uploadingImageFor === productId
    });

    return (
      <div
        {...getRootProps()}
        className={`relative w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        } ${uploadingImageFor === productId ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {currentImage ? (
          <img src={currentImage} alt="Product" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        )}
        {uploadingImageFor === productId && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        {!uploadingImageFor && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    );
  };

  const startEditingPrice = (variantId: string, currentPrice: number) => {
    setEditingPriceId(variantId);
    setEditingPriceValue(currentPrice.toString());
  };

  const savePrice = async (variantId: string) => {
    const newPrice = parseFloat(editingPriceValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Ungültiger Preis");
      return;
    }

    const { error } = await supabase
      .from('product_variants')
      .update({ price: newPrice })
      .eq('id', variantId);

    if (error) {
      toast.error("Fehler beim Aktualisieren des Preises");
      console.error(error);
    } else {
      toast.success("Preis aktualisiert!");
      setEditingPriceId(null);
      loadProducts();
    }
  };

  const cancelEditingPrice = () => {
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Möchten Sie dieses Produkt wirklich löschen? Alle zugehörigen Varianten werden ebenfalls gelöscht.")) {
      return;
    }

    const { error: variantsError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (variantsError) {
      toast.error("Fehler beim Löschen der Varianten");
      console.error(variantsError);
      return;
    }

    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) {
      toast.error("Fehler beim Löschen des Produkts");
      console.error(productError);
    } else {
      toast.success("Produkt gelöscht!");
      loadProducts();
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Möchten Sie diese Variante wirklich löschen?")) {
      return;
    }

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      toast.error("Fehler beim Löschen der Variante");
      console.error(error);
    } else {
      toast.success("Variante gelöscht!");
      loadProducts();
    }
  };

  const getVariantsForProduct = (productId: string) => {
    return variants.filter(v => v.product_id === productId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produktverwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktverwaltung</CardTitle>
        <p className="text-sm text-muted-foreground">
          Klicken oder ziehen Sie Bilder auf die Bildfelder. Klicken Sie auf Preise zum Bearbeiten.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produkte</TabsTrigger>
            <TabsTrigger value="variants">Varianten & Preise</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bild</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Marke</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Größe</TableHead>
                    <TableHead>Varianten</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const productVariants = getVariantsForProduct(product.id);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <ImageDropzone 
                            productId={product.id} 
                            currentImage={product.image}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {productVariants.length} Variante(n)
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Preis (klicken zum bearbeiten)</TableHead>
                    <TableHead>Lager</TableHead>
                    <TableHead>Auf Lager</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => {
                    const product = products.find(p => p.id === variant.product_id);
                    const isEditingPrice = editingPriceId === variant.id;
                    
                    return (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">
                          {product?.name || 'Unbekannt'}
                        </TableCell>
                        <TableCell>{variant.variant_number}</TableCell>
                        <TableCell>{variant.name}</TableCell>
                        <TableCell>
                          {isEditingPrice ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPriceValue}
                                onChange={(e) => setEditingPriceValue(e.target.value)}
                                className="w-24"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') savePrice(variant.id);
                                  if (e.key === 'Escape') cancelEditingPrice();
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => savePrice(variant.id)}
                              >
                                <Save className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditingPrice}
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditingPrice(variant.id, variant.price)}
                              className="flex items-center gap-2 px-3 py-1 hover:bg-accent rounded-md transition-colors"
                            >
                              <span className="font-semibold">€{variant.price.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">(klicken)</span>
                            </button>
                          )}
                        </TableCell>
                        <TableCell>{variant.stock_quantity}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            variant.in_stock 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {variant.in_stock ? 'Ja' : 'Nein'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteVariant(variant.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
