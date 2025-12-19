import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Save, X, Loader2, Sparkles, ChevronDown, ChevronUp, Droplets, FlaskConical, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  scentNotes: string[] | null;
  inspiredBy: string | null;
  aiDescription: string | null;
  seasons: string[] | null;
  occasions: string[] | null;
  topNotes: string[] | null;
  middleNotes: string[] | null;
  baseNotes: string[] | null;
  ingredients: string[] | null;
  variants: ProductVariant[];
}

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  isActive: boolean;
  scentNotes: string[];
  inspiredBy: string;
  aiDescription: string;
  seasons: string[];
  occasions: string[];
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  ingredients: string[];
}

function ChipInput({ 
  label, 
  values, 
  onChange, 
  placeholder,
  icon: Icon
}: { 
  label: string; 
  values: string[]; 
  onChange: (values: string[]) => void; 
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  const handleRemove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
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
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("essentials");

  const initialProductForm: ProductFormState = {
    name: "",
    brand: "ALDENAIR",
    category: "herren",
    description: "",
    image: "",
    isActive: true,
    scentNotes: [],
    inspiredBy: "",
    aiDescription: "",
    seasons: [],
    occasions: [],
    topNotes: [],
    middleNotes: [],
    baseNotes: [],
    ingredients: [],
  };

  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);

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
    if (!productForm.name.trim()) {
      toast.error("Produktname ist erforderlich");
      return;
    }

    try {
      setSaving(true);
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const payload = {
        ...productForm,
        scentNotes: productForm.scentNotes.length > 0 ? productForm.scentNotes : null,
        topNotes: productForm.topNotes.length > 0 ? productForm.topNotes : null,
        middleNotes: productForm.middleNotes.length > 0 ? productForm.middleNotes : null,
        baseNotes: productForm.baseNotes.length > 0 ? productForm.baseNotes : null,
        ingredients: productForm.ingredients.length > 0 ? productForm.ingredients : null,
        seasons: productForm.seasons.length > 0 ? productForm.seasons : null,
        occasions: productForm.occasions.length > 0 ? productForm.occasions : null,
        inspiredBy: productForm.inspiredBy.trim() || null,
        aiDescription: productForm.aiDescription.trim() || null,
        description: productForm.description.trim() || null,
        image: productForm.image.trim() || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
    if (!confirm("Produkt wirklich löschen? Alle Varianten werden ebenfalls gelöscht.")) return;

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
      scentNotes: product.scentNotes || [],
      inspiredBy: product.inspiredBy || "",
      aiDescription: product.aiDescription || "",
      seasons: product.seasons || [],
      occasions: product.occasions || [],
      topNotes: product.topNotes || [],
      middleNotes: product.middleNotes || [],
      baseNotes: product.baseNotes || [],
      ingredients: product.ingredients || [],
    });
    setActiveFormTab("essentials");
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
    setProductForm(initialProductForm);
    setActiveFormTab("essentials");
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

  const toggleSeason = (season: string) => {
    const seasons = productForm.seasons.includes(season)
      ? productForm.seasons.filter((s) => s !== season)
      : [...productForm.seasons, season];
    setProductForm({ ...productForm, seasons });
  };

  const toggleOccasion = (occasion: string) => {
    const occasions = productForm.occasions.includes(occasion)
      ? productForm.occasions.filter((o) => o !== occasion)
      : [...productForm.occasions, occasion];
    setProductForm({ ...productForm, occasions });
  };

  const generateAIDescription = async () => {
    try {
      setGeneratingAI(true);
      const response = await fetch("/api/admin/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productName: productForm.name,
          brand: productForm.brand,
          scentNotes: [...productForm.topNotes, ...productForm.middleNotes, ...productForm.baseNotes],
          inspiredBy: productForm.inspiredBy,
          gender: productForm.category,
          category: "Eau de Parfum",
        }),
      });

      if (!response.ok) throw new Error("KI-Generierung fehlgeschlagen");

      const result = await response.json();
      setProductForm({
        ...productForm,
        aiDescription: result.description,
        seasons: result.seasons || [],
        occasions: result.occasions || [],
        description: productForm.description || result.description,
      });
      toast.success("KI-Beschreibung erstellt");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("KI-Beschreibung fehlgeschlagen");
    } finally {
      setGeneratingAI(false);
    }
  };

  const allSeasons = ["Frühling", "Sommer", "Herbst", "Winter"];
  const allOccasions = ["Alltag", "Büro", "Date", "Abendveranstaltung", "Hochzeit", "Sport", "Freizeit"];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Produktverwaltung</h2>
          <p className="text-muted-foreground">{products.length} Produkte</p>
        </div>
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetProductForm} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Neues Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingProduct ? "Produkt bearbeiten" : "Neues Produkt"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="essentials">Basis</TabsTrigger>
                <TabsTrigger value="fragrance">Duftprofil</TabsTrigger>
                <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                <TabsTrigger value="ai">KI-Features</TabsTrigger>
              </TabsList>

              <TabsContent value="essentials" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Produktname *</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="z.B. Aventus Inspiration"
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Bild-URL</Label>
                    <Input
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Inspiriert von (Luxus-Parfüm)</Label>
                  <Input
                    value={productForm.inspiredBy}
                    onChange={(e) => setProductForm({ ...productForm, inspiredBy: e.target.value })}
                    placeholder="z.B. Creed Aventus, Dior Sauvage..."
                    data-testid="input-inspired-by"
                  />
                  <p className="text-xs text-muted-foreground">
                    Welches bekannte Luxus-Parfüm hat diesen Duft inspiriert?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Ausführliche Produktbeschreibung..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={productForm.isActive}
                    onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked })}
                  />
                  <Label>Produkt aktiv (im Shop sichtbar)</Label>
                </div>
              </TabsContent>

              <TabsContent value="fragrance" className="space-y-4 pt-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Duftpyramide
                  </h4>
                  <div className="space-y-4">
                    <ChipInput
                      label="Kopfnoten (Top Notes)"
                      values={productForm.topNotes}
                      onChange={(values) => setProductForm({ ...productForm, topNotes: values })}
                      placeholder="z.B. Bergamotte, Zitrone..."
                      icon={Droplets}
                    />
                    <ChipInput
                      label="Herznoten (Middle Notes)"
                      values={productForm.middleNotes}
                      onChange={(values) => setProductForm({ ...productForm, middleNotes: values })}
                      placeholder="z.B. Jasmin, Rose..."
                      icon={Droplets}
                    />
                    <ChipInput
                      label="Basisnoten (Base Notes)"
                      values={productForm.baseNotes}
                      onChange={(values) => setProductForm({ ...productForm, baseNotes: values })}
                      placeholder="z.B. Moschus, Sandelholz..."
                      icon={Droplets}
                    />
                  </div>
                </div>

                <ChipInput
                  label="Inhaltsstoffe / Ingredients"
                  values={productForm.ingredients}
                  onChange={(values) => setProductForm({ ...productForm, ingredients: values })}
                  placeholder="z.B. Alkohol, Aqua, Parfum..."
                  icon={FlaskConical}
                />

                <ChipInput
                  label="Allgemeine Duftnoten"
                  values={productForm.scentNotes}
                  onChange={(values) => setProductForm({ ...productForm, scentNotes: values })}
                  placeholder="z.B. Holzig, Frisch, Orientalisch..."
                />
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <Label>Passende Jahreszeiten</Label>
                  <div className="flex flex-wrap gap-2">
                    {allSeasons.map((season) => (
                      <Badge
                        key={season}
                        variant={productForm.seasons.includes(season) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSeason(season)}
                      >
                        {season}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Passende Anlässe</Label>
                  <div className="flex flex-wrap gap-2">
                    {allOccasions.map((occasion) => (
                      <Badge
                        key={occasion}
                        variant={productForm.occasions.includes(occasion) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleOccasion(occasion)}
                      >
                        {occasion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 pt-4">
                <div className="rounded-lg border p-4 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">KI-Beschreibung generieren</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIDescription}
                      disabled={generatingAI || !productForm.name}
                    >
                      {generatingAI ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generieren
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Erstellt automatisch eine ansprechende Beschreibung basierend auf den Produktdaten.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>KI-Beschreibung</Label>
                  <Textarea
                    value={productForm.aiDescription}
                    onChange={(e) => setProductForm({ ...productForm, aiDescription: e.target.value })}
                    placeholder="Die KI-generierte Beschreibung erscheint hier..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingProduct ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Produkt</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Inspiriert von</TableHead>
                <TableHead>Varianten</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.inspiredBy ? (
                      <span className="text-sm">{product.inspiredBy}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.variants.length}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAddVariant(product.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditProduct(product)}
                        data-testid={`btn-edit-${product.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteProduct(product.id)}
                        data-testid={`btn-delete-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Keine Produkte vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {products.map((product) => (
        product.variants.length > 0 && (
          <Card key={`variants-${product.id}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Varianten: {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Größe</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Originalpreis</TableHead>
                    <TableHead>Bestand</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.size}</TableCell>
                      <TableCell>EUR {parseFloat(variant.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {variant.originalPrice ? `EUR ${parseFloat(variant.originalPrice).toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant.stock > 0 ? "secondary" : "destructive"}>
                          {variant.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{variant.sku || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={variant.isActive ? "default" : "secondary"}>
                          {variant.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditVariant(variant, product.id)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteVariant(variant.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ))}

      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Variante bearbeiten" : "Neue Variante"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Größe *</Label>
                <Input
                  value={variantForm.size}
                  onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                  placeholder="z.B. 50ml"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  placeholder="z.B. ALD-001-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preis (EUR) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Originalpreis (EUR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.originalPrice}
                  onChange={(e) => setVariantForm({ ...variantForm, originalPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bestand</Label>
              <Input
                type="number"
                value={variantForm.stock}
                onChange={(e) => setVariantForm({ ...variantForm, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={variantForm.isActive}
                onCheckedChange={(checked) => setVariantForm({ ...variantForm, isActive: checked })}
              />
              <Label>Variante aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVariantDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveVariant} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {editingVariant ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
