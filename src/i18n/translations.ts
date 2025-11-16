export const translations = {
  de: {
    nav: {
      home: 'Startseite',
      products: 'Produkte',
      favorites: 'Favoriten',
      profile: 'Profil',
      cart: 'Warenkorb',
    },
    hero: {
      title: 'Exklusive Parfüms',
      subtitle: 'Entdecke deine Signature-Duft',
      cta: 'Jetzt entdecken',
    },
    product: {
      addToCart: 'In den Warenkorb',
      addToFavorites: 'Zu Favoriten',
      outOfStock: 'Nicht verfügbar',
      inStock: 'Auf Lager',
      price: 'Preis',
      size: 'Größe',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      favorites: 'Favorites',
      profile: 'Profile',
      cart: 'Cart',
    },
    hero: {
      title: 'Exclusive Perfumes',
      subtitle: 'Discover your signature scent',
      cta: 'Discover now',
    },
    product: {
      addToCart: 'Add to Cart',
      addToFavorites: 'Add to Favorites',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      size: 'Size',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Produits',
      favorites: 'Favoris',
      profile: 'Profil',
      cart: 'Panier',
    },
    hero: {
      title: 'Parfums Exclusifs',
      subtitle: 'Découvrez votre parfum signature',
      cta: 'Découvrir maintenant',
    },
    product: {
      addToCart: 'Ajouter au panier',
      addToFavorites: 'Ajouter aux favoris',
      outOfStock: 'Rupture de stock',
      inStock: 'En stock',
      price: 'Prix',
      size: 'Taille',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      products: 'Productos',
      favorites: 'Favoritos',
      profile: 'Perfil',
      cart: 'Carrito',
    },
    hero: {
      title: 'Perfumes Exclusivos',
      subtitle: 'Descubre tu aroma característico',
      cta: 'Descubrir ahora',
    },
    product: {
      addToCart: 'Añadir al carrito',
      addToFavorites: 'Añadir a favoritos',
      outOfStock: 'Agotado',
      inStock: 'En stock',
      price: 'Precio',
      size: 'Tamaño',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.de;
