import { db } from "./db";
import { products, productVariants, users, sampleSets } from "../shared/schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("Starting database seed...");

  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  
  await db.insert(users).values({
    email: "admin@aldenair.de",
    password: hashedPassword,
    fullName: "Admin ALDENAIR",
    role: "admin",
  }).onConflictDoNothing();

  console.log("Admin user created: admin@aldenair.de / Admin123!");

  // Generate fixed UUIDs for products so we can reference them in variants
  const productIds = {
    bottles50ml: uuidv4(),
    testerkits: uuidv4(),
    sparkits: uuidv4(),
    autoparfum: uuidv4(),
    collection3d: uuidv4(),
    threed: uuidv4(),
  };

  // 2. Insert Products
  const productsData = [
    {
      id: productIds.bottles50ml,
      name: 'ALDENAIR Prestige Collection',
      brand: 'ALDENAIR',
      category: '50ML Bottles',
      size: '50ml',
      image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png'
    },
    {
      id: productIds.testerkits,
      name: 'ALDENAIR Testerkits Collection',
      brand: 'ALDENAIR',
      category: 'Testerkits',
      size: '5ml',
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
    },
    {
      id: productIds.sparkits,
      name: 'ALDENAIR Sparkits Collection',
      brand: 'ALDENAIR',
      category: 'Sparkits',
      size: 'Bundle',
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
    },
    {
      id: productIds.autoparfum,
      name: 'ALDENAIR Autoparfüm Collection',
      brand: 'ALDENAIR',
      category: 'Autoparfüm',
      size: '50ml',
      image: '/lovable-uploads/a8f5f8f2-c551-4c79-a16a-ec6fa216cf67.png'
    },
    {
      id: productIds.collection3d,
      name: 'ALDENAIR 3D Collection',
      brand: 'ALDENAIR',
      category: '3D Collection',
      size: '100ml',
      image: '/lovable-uploads/a9ff5ec5-a969-4de6-9989-8e36f83f1b9b.png'
    },
    {
      id: productIds.threed,
      name: 'THREED X ALDENAIR THREED WRLD 2 COLLECTION',
      brand: 'THREED X ALDENAIR',
      category: 'Special Edition',
      size: '50ml',
      image: '/lovable-uploads/a9ff5ec5-a969-4de6-9989-8e36f83f1b9b.png'
    }
  ];

  for (const product of productsData) {
    await db.insert(products).values(product).onConflictDoNothing();
  }
  console.log(`Inserted ${productsData.length} products`);

  // 3. Insert Product Variants
  const variantsData = [
    // 50ML Bottles variants
    { productId: productIds.bottles50ml, name: 'ALDENAIR 399', description: 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Die edle Komposition aus Bergamotte und Zedernholz in der Herznote verschmilzt mit dem kostbaren Oud in der Basis zu einem unverwechselbaren, maskulinen Parfüm. Ideal für besondere Anlässe und den selbstbewussten Mann.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 978', description: 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und Zitrone treffen auf exotischen Jasmin-Sambac und warmen Honig. Die Basis aus Tabak, Tonkabohne und Vanille verleiht diesem Unisex-Parfüm eine sinnliche Tiefe und lang anhaltende Eleganz.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 999', description: 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz in der Herznote ergänzen sich perfekt mit der frischen Apfel-Note und dem mystischen Oud in der Basis. Ein zeitloser Duft für jeden Tag.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 189', description: 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose in der Herznote werden von einer reichen Basis aus Harzen, Holznoten und aromatischem Kaffee getragen. Zimt und Himbeere verleihen diesem Parfüm eine unwiderstehliche Süße.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 390', description: 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille in der Herznote verschmelzen mit Safran und Rum zu einer warmen, einladenden Komposition. Die Basis aus Tabak und Sandelholz verleiht diesem Parfüm eine maskuline Tiefe.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 275', description: 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom treffen auf cremige Tonkabohne und tropische Ananas. Die erdige Basis aus Eichenmoss, Talkum und Vanille macht diesen Duft zu einem perfekten Begleiter für warme Tage.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 527', description: 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte. Die süße Basis aus Tonkabohne, Rohrzucker und Amber wird von weißem Moschus und Eichenmoos abgerundet.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    { productId: productIds.bottles50ml, name: 'ALDENAIR 695', description: 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere. Die holzige Basis aus Zedernholz und Vetiver wird von süßer Vanille und Amber abgerundet.', price: "49.99", inStock: true, stock: 100, size: '50ml' },
    
    // Testerkits variants
    { productId: productIds.testerkits, name: 'ALDENAIR 399 Testerkit', description: 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Perfekt zum Testen vor dem Kauf der Vollgröße.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 978 Testerkit', description: 'Verführerischer süß-würziger Duft mit orientalischen Noten. Probieren Sie diesen sinnlichen Duft in der praktischen 5ml Größe.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 999 Testerkit', description: 'Harmonische Verbindung von holzigen und blumigen Elementen.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 189 Testerkit', description: 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 390 Testerkit', description: 'Cremig-holziger Duft mit süßen und rauchigen Facetten.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 275 Testerkit', description: 'Süß-fruchtiger Duft mit exotischen Nuancen. Perfekt für warme Tage.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 527 Testerkit', description: 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    { productId: productIds.testerkits, name: 'ALDENAIR 695 Testerkit', description: 'Aromatisch-fruchtiger Duft mit komplexer Komposition.', price: "6.95", inStock: true, stock: 200, size: '5ml' },
    
    // Sparkits variants
    { productId: productIds.sparkits, name: 'Sparkit - 5x Proben', description: 'Stelle dir dein persönliches Sparkit zusammen! Wähle 5 beliebige Proben (5ml) aus unserem gesamten Sortiment und spare dabei. Perfekt, um verschiedene Düfte zu testen und deinen Favoriten zu finden.', price: "29.95", inStock: true, stock: 100, size: 'Bundle' },
    { productId: productIds.sparkits, name: 'Sparkit - 3x 50ml Flakons', description: 'Spare beim Kauf von 3 beliebigen 50ml Flakons! Wähle aus unserem kompletten Sortiment deine drei Lieblingsdüfte aus und profitiere von einem attraktiven Bundle-Preis.', price: "129.99", inStock: true, stock: 50, size: 'Bundle' },
    { productId: productIds.sparkits, name: 'Sparkit - 5x 50ml Flakons', description: 'Unser beliebtestes Sparkit! Wähle 5 beliebige 50ml Flakons aus unserem gesamten Sortiment und spare dabei maximal. Ideal für Duftliebhaber, die ihre Sammlung erweitern möchten.', price: "199.99", inStock: true, stock: 30, size: 'Bundle' },
    
    // Autoparfüm variants
    { productId: productIds.autoparfum, name: 'ALDENAIR Autoparfüm 399', description: 'Luxuriöser orientalischer Duft für Ihr Auto. Langanhaltender Duft, der Ihr Fahrzeug in eine Oase der Eleganz verwandelt.', price: "14.99", inStock: true, stock: 150, size: '50ml' },
    { productId: productIds.autoparfum, name: 'ALDENAIR Autoparfüm 978', description: 'Süß-würziger Duft für unterwegs. Perfekt für lange Fahrten und ein angenehmes Ambiente im Auto.', price: "14.99", inStock: true, stock: 150, size: '50ml' },
    { productId: productIds.autoparfum, name: 'ALDENAIR Autoparfüm 999', description: 'Holzig-blumiger Autoduft mit zeitlosem Charakter. Verwandelt jede Fahrt in ein Dufterlebnis.', price: "14.99", inStock: true, stock: 150, size: '50ml' },
    { productId: productIds.autoparfum, name: 'ALDENAIR Autoparfüm 189', description: 'Süßer Gourmand-Duft mit Kaffee-Noten für Ihr Auto. Ideal für Kaffeeliebhaber.', price: "14.99", inStock: true, stock: 150, size: '50ml' },
    
    // 3D Collection variant
    { productId: productIds.collection3d, name: 'ALDENAIR 3D 001', description: 'Premium 3D Duft-Erlebnis mit innovativer Technologie. 100ml für langanhaltenden Luxus.', price: "79.99", inStock: true, stock: 50, size: '100ml' },
    
    // THREED Collection variant
    { productId: productIds.threed, name: 'THREED X ALDENAIR THREED WRLD 2 COLLECTION', description: 'THREED X ALDENAIR – The WRLD in a Scent. Zwei kreative Welten, eine Vision: THREED und ALDENAIR vereinen Musik und Parfümerie in einer limitierten Special Edition.', price: "39.99", inStock: false, stock: 0, size: '50ml' }
  ];

  for (const variant of variantsData) {
    await db.insert(productVariants).values(variant).onConflictDoNothing();
  }
  console.log(`Inserted ${variantsData.length} product variants`);

  // 4. Insert Sample Sets (Probensets)
  const sampleSetsData = [
    {
      name: 'Herren Probenset',
      description: 'Entdecke unsere beliebtesten Herrendüfte in praktischen 5ml Proben. Perfekt um deinen Lieblingsduft zu finden.',
      price: "24.95",
      sampleCount: 5,
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
      isActive: true
    },
    {
      name: 'Damen Probenset',
      description: 'Unsere elegantesten Damendüfte vereint in einem Set. 5 exklusive Proben zum Kennenlernen.',
      price: "24.95",
      sampleCount: 5,
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
      isActive: true
    },
    {
      name: 'Bestseller Probenset',
      description: 'Die 5 meistverkauften Düfte von ALDENAIR in einem Set. Entdecke, was unsere Kunden am meisten lieben.',
      price: "24.95",
      sampleCount: 5,
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
      isActive: true
    },
    {
      name: 'Orientalisches Probenset',
      description: 'Tauche ein in die Welt orientalischer Düfte. 5 ausgewählte Proben mit Oud, Amber und exotischen Gewürzen.',
      price: "24.95",
      sampleCount: 5,
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
      isActive: true
    },
    {
      name: 'Frische Düfte Probenset',
      description: 'Leichte, frische Düfte für jeden Tag. Perfekt für Frühling und Sommer.',
      price: "24.95",
      sampleCount: 5,
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
      isActive: true
    }
  ];

  for (const set of sampleSetsData) {
    await db.insert(sampleSets).values(set).onConflictDoNothing();
  }
  console.log(`Inserted ${sampleSetsData.length} sample sets`);

  console.log("\n========================================");
  console.log("Database seeding completed successfully!");
  console.log("========================================");
  console.log("\nAdmin Login:");
  console.log("  Email: admin@aldenair.de");
  console.log("  Password: Admin123!");
  console.log("\nProducts imported:");
  console.log("  - 6 product categories");
  console.log("  - 26 product variants");
  console.log("  - 5 sample sets");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
