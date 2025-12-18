import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Save, X, Loader2 } from "lucide-react";

interface ProductVariant {
  id: string;
  perfumeId: string;
  size: string;
  price: string;
  originalPrice: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  variants: ProductVariant[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "herren",
    description: "",
    image: "",
    isActive: true,
  });

  const [variantForm, setVariantForm] = useState({
    size: "",
    price: "",
    originalPrice: "",
    stock: 0,
    sku: "",
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Fehler beim Laden der Produkte");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      setSaving(true);
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productForm),
      });

      if (!response.ok) throw new Error("Failed to save product");

      toast.success(editingProduct ? "Produkt aktualisiert" : "Produkt erstellt");
      setShowProductDialog(false);
      resetProductForm();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Produkt wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast.success("Produkt gelöscht");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const handleSaveVariant = async () => {
    if (!selectedProductId) return;

    try {
      setSaving(true);
      const url = editingVariant
        ? `/api/variants/${editingVariant.id}`
        : `/api/products/${selectedProductId}/variants`;
      const method = editingVariant ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...variantForm,
          price: variantForm.price,
          originalPrice: variantForm.originalPrice || null,
          stock: parseInt(variantForm.stock.toString()),
        }),
      });

      if (!response.ok) throw new Error("Failed to save variant");

      toast.success(editingVariant ? "Variante aktualisiert" : "Variante erstellt");
      setShowVariantDialog(false);
      resetVariantForm();
      loadProducts();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Variante wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/variants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete variant");

      toast.success("Variante gelöscht");
      loadProducts();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description || "",
      image: product.image || "",
      isActive: product.isActive,
    });
    setShowProductDialog(true);
  };

  const openAddVariant = (productId: string) => {
    setSelectedProductId(productId);
    setEditingVariant(null);
    resetVariantForm();
    setShowVariantDialog(true);
  };

  const openEditVariant = (variant: ProductVariant, productId: string) => {
    setSelectedProductId(productId);
    setEditingVariant(variant);
    setVariantForm({
      size: variant.size,
      price: variant.price,
      originalPrice: variant.originalPrice || "",
      stock: variant.stock,
      sku: variant.sku || "",
      isActive: variant.isActive,
    });
    setShowVariantDialog(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      brand: "",
      category: "herren",
      description: "",
      image: "",
      isActive: true,
    });
  };

  const resetVariantForm = () => {
    setEditingVariant(null);
    setVariantForm({
      size: "",
      price: "",
      originalPrice: "",
      stock: 0,
      sku: "",
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produktverwaltung</h2>
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetProductForm} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Neues Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Produkt bearbeiten" : "Neues Produkt"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Produktname"
                  data-testid="input-product-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Marke</Label>
                <Input
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="ALDENAIR"
                  data-testid="input-product-brand"
                />
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                >
                  <SelectTrigger data-testid="select-product-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herren">Herren</SelectItem>
                    <SelectItem value="damen">Damen</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Produktbeschreibung..."
                  data-testid="input-product-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Bild-URL</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-product-image"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aktiv</Label>
                <Switch
                  checked={productForm.isActive}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked })}
                  data-testid="switch-product-active"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveProduct} disabled={saving} data-testid="button-save-product">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Variante bearbeiten" : "Neue Variante"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Größe</Label>
              <Input
                value={variantForm.size}
                onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                placeholder="z.B. 50ml"
                data-testid="input-variant-size"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preis (EUR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                  placeholder="29.99"
                  data-testid="input-variant-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Originalpreis</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.originalPrice}
                  onChange={(e) => setVariantForm({ ...variantForm, originalPrice: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-variant-original-price"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lagerbestand</Label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={(e) => setVariantForm({ ...variantForm, stock: parseInt(e.target.value) || 0 })}
                  data-testid="input-variant-stock"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-variant-sku"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktiv</Label>
              <Switch
                checked={variantForm.isActive}
                onCheckedChange={(checked) => setVariantForm({ ...variantForm, isActive: checked })}
                data-testid="switch-variant-active"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowVariantDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveVariant} disabled={saving} data-testid="button-save-variant">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Produkte vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {product.brand} | {product.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAddVariant(product.id)}
                    data-testid={`button-add-variant-${product.id}`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Variante
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditProduct(product)}
                    data-testid={`button-edit-product-${product.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteProduct(product.id)}
                    data-testid={`button-delete-product-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {product.variants && product.variants.length > 0 && (
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Größe</TableHead>
                        <TableHead>Preis</TableHead>
                        <TableHead>Lager</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.id} data-testid={`row-variant-${variant.id}`}>
                          <TableCell className="font-medium">{variant.size}</TableCell>
                          <TableCell>
                            {parseFloat(variant.price).toFixed(2)} EUR
                            {variant.originalPrice && (
                              <span className="text-muted-foreground line-through ml-2">
                                {parseFloat(variant.originalPrice).toFixed(2)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{variant.stock}</TableCell>
                          <TableCell>
                            <span className={variant.isActive ? "text-green-600" : "text-red-600"}>
                              {variant.isActive ? "Aktiv" : "Inaktiv"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditVariant(variant, product.id)}
                              data-testid={`button-edit-variant-${variant.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteVariant(variant.id)}
                              data-testid={`button-delete-variant-${variant.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
