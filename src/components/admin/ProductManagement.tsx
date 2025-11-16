import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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

const categories = ["Herren", "Damen", "Unisex", "Limited Edition"];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);

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

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      category: formData.get("category") as string,
      size: formData.get("size") as string,
      image: formData.get("image") as string || null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Fehler beim Aktualisieren des Produkts");
        console.error(error);
      } else {
        toast.success("Produkt aktualisiert");
        setIsProductDialogOpen(false);
        setEditingProduct(null);
        loadProducts();
      }
    } else {
      // Generate a unique ID for new products
      const productId = `${productData.category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const { error } = await supabase
        .from("products")
        .insert([{ ...productData, id: productId }]);

      if (error) {
        toast.error("Fehler beim Erstellen des Produkts");
        console.error(error);
      } else {
        toast.success("Produkt erstellt");
        setIsProductDialogOpen(false);
        loadProducts();
      }
    }
  };

  const handleSaveVariant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const variantData = {
      product_id: formData.get("product_id") as string,
      variant_number: formData.get("variant_number") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      price: parseFloat(formData.get("price") as string),
      original_price: formData.get("original_price") ? parseFloat(formData.get("original_price") as string) : null,
      stock_quantity: parseInt(formData.get("stock_quantity") as string),
      in_stock: formData.get("in_stock") === "on",
      preorder: formData.get("preorder") === "on",
      release_date: formData.get("release_date") as string || null,
    };

    if (editingVariant) {
      const { error } = await supabase
        .from("product_variants")
        .update(variantData)
        .eq("id", editingVariant.id);

      if (error) {
        toast.error("Fehler beim Aktualisieren der Variante");
        console.error(error);
      } else {
        toast.success("Variante aktualisiert");
        setIsVariantDialogOpen(false);
        setEditingVariant(null);
        loadProducts();
      }
    } else {
      // Generate a unique ID for new variants
      const variantId = `${variantData.variant_number}-${Date.now()}`;
      const { error } = await supabase
        .from("product_variants")
        .insert([{ ...variantData, id: variantId }]);

      if (error) {
        toast.error("Fehler beim Erstellen der Variante");
        console.error(error);
      } else {
        toast.success("Variante erstellt");
        setIsVariantDialogOpen(false);
        loadProducts();
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Möchten Sie dieses Produkt wirklich löschen?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen des Produkts");
      console.error(error);
    } else {
      toast.success("Produkt gelöscht");
      loadProducts();
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Möchten Sie diese Variante wirklich löschen?")) return;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen der Variante");
      console.error(error);
    } else {
      toast.success("Variante gelöscht");
      loadProducts();
    }
  };

  if (loading) {
    return <div className="p-6">Laden...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Produktverwaltung</h2>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produkte</TabsTrigger>
          <TabsTrigger value="variants">Varianten</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Neues Produkt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Produkt bearbeiten" : "Neues Produkt"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Produktname</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label htmlFor="brand">Marke</Label>
                  <Input id="brand" name="brand" defaultValue={editingProduct?.brand} required />
                </div>
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select name="category" defaultValue={editingProduct?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Größe</Label>
                  <Input id="size" name="size" defaultValue={editingProduct?.size} placeholder="z.B. 100ml" required />
                </div>
                <div>
                  <Label htmlFor="image">Bild URL</Label>
                  <Input id="image" name="image" defaultValue={editingProduct?.image || ""} placeholder="https://..." />
                </div>
                <Button type="submit" className="w-full">Speichern</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Alle Produkte</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Marke</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Größe</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVariant(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Variante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVariant ? "Variante bearbeiten" : "Neue Variante"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveVariant} className="space-y-4">
                <div>
                  <Label htmlFor="product_id">Produkt</Label>
                  <Select name="product_id" defaultValue={editingVariant?.product_id} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Produkt auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.brand} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="variant_number">Varianten-Nummer</Label>
                  <Input id="variant_number" name="variant_number" defaultValue={editingVariant?.variant_number} required />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editingVariant?.name} required />
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea id="description" name="description" defaultValue={editingVariant?.description || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preis (€)</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={editingVariant?.price} required />
                  </div>
                  <div>
                    <Label htmlFor="original_price">Original Preis (€)</Label>
                    <Input id="original_price" name="original_price" type="number" step="0.01" defaultValue={editingVariant?.original_price || ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Lagerbestand</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={editingVariant?.stock_quantity || 0} required />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="in_stock" name="in_stock" defaultChecked={editingVariant?.in_stock ?? true} />
                  <Label htmlFor="in_stock">Auf Lager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="preorder" name="preorder" defaultChecked={editingVariant?.preorder || false} />
                  <Label htmlFor="preorder">Vorbestellung</Label>
                </div>
                <div>
                  <Label htmlFor="release_date">Verfügbar ab</Label>
                  <Input id="release_date" name="release_date" type="date" defaultValue={editingVariant?.release_date?.split('T')[0] || ""} />
                </div>
                <Button type="submit" className="w-full">Speichern</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Alle Varianten</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Lager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => {
                    const product = products.find(p => p.id === variant.product_id);
                    return (
                      <TableRow key={variant.id}>
                        <TableCell>{product?.brand} - {product?.name}</TableCell>
                        <TableCell>{variant.name}</TableCell>
                        <TableCell>€{variant.price.toFixed(2)}</TableCell>
                        <TableCell>{variant.stock_quantity}</TableCell>
                        <TableCell>
                          {variant.preorder ? (
                            <span className="text-blue-600">Vorbestellung</span>
                          ) : variant.in_stock ? (
                            <span className="text-green-600">Verfügbar</span>
                          ) : (
                            <span className="text-red-600">Nicht verfügbar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVariant(variant);
                                setIsVariantDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVariant(variant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
