import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

const products = [
    {
      id: '50ml-bottles',
      name: 'ALDENAIR Prestige Collection',
      brand: 'ALDENAIR',
      category: '50ML Bottles',
      size: '50ml',
      image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png'
    },
    {
      id: 'testerkits',
      name: 'ALDENAIR Testerkits Collection',
      brand: 'ALDENAIR',
      category: 'Testerkits',
      size: '5ml',
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
    },
    {
      id: 'sparkits',
      name: 'ALDENAIR Sparkits Collection',
      brand: 'ALDENAIR',
      category: 'Sparkits',
      size: 'Bundle',
      image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
    },
      {
        id: 'autoparfum',
        name: 'ALDENAIR Autoparfüm Collection',
        brand: 'ALDENAIR',
        category: 'Autoparfüm',
        size: '50ml',
        image: '/lovable-uploads/a8f5f8f2-c551-4c79-a16a-ec6fa216cf67.png'
      },
      {
        id: '3d-collection',
        name: 'ALDENAIR 3D Collection',
        brand: 'ALDENAIR',
        category: '3D Collection',
        size: '100ml',
        image: '/lovable-uploads/a9ff5ec5-a969-4de6-9989-8e36f83f1b9b.png'
      }
    ];

    const variants = [
      // 50ML Bottles variants
      { id: '399', product_id: '50ml-bottles', variant_number: '399', name: 'ALDENAIR 399', description: 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Die edle Komposition aus Bergamotte und Zedernholz in der Herznote verschmilzt mit dem kostbaren Oud in der Basis zu einem unverwechselbaren, maskulinen Parfüm. Ideal für besondere Anlässe und den selbstbewussten Mann.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.8, review_count: 156 },
      { id: '978', product_id: '50ml-bottles', variant_number: '978', name: 'ALDENAIR 978', description: 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und Zitrone treffen auf exotischen Jasmin-Sambac und warmen Honig. Die Basis aus Tabak, Tonkabohne und Vanille verleiht diesem Unisex-Parfüm eine sinnliche Tiefe und lang anhaltende Eleganz.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.9, review_count: 203 },
      { id: '999', product_id: '50ml-bottles', variant_number: '999', name: 'ALDENAIR 999', description: 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz in der Herznote ergänzen sich perfekt mit der frischen Apfel-Note und dem mystischen Oud in der Basis. Ein zeitloser Duft für jeden Tag.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.7, review_count: 178 },
      { id: '189', product_id: '50ml-bottles', variant_number: '189', name: 'ALDENAIR 189', description: 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose in der Herznote werden von einer reichen Basis aus Harzen, Holznoten und aromatischem Kaffee getragen. Zimt und Himbeere verleihen diesem Parfüm eine unwiderstehliche Süße.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.6, review_count: 167 },
      { id: '390', product_id: '50ml-bottles', variant_number: '390', name: 'ALDENAIR 390', description: 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille in der Herznote verschmelzen mit Safran und Rum zu einer warmen, einladenden Komposition. Die Basis aus Tabak und Sandelholz verleiht diesem Parfüm eine maskuline Tiefe.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.8, review_count: 145 },
      { id: '275', product_id: '50ml-bottles', variant_number: '275', name: 'ALDENAIR 275', description: 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom treffen auf cremige Tonkabohne und tropische Ananas. Die erdige Basis aus Eichenmoss, Talkum und Vanille macht diesen Duft zu einem perfekten Begleiter für warme Tage.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.5, review_count: 134 },
      { id: '527', product_id: '50ml-bottles', variant_number: '527', name: 'ALDENAIR 527', description: 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte. Die süße Basis aus Tonkabohne, Rohrzucker und Amber wird von weißem Moschus und Eichenmoos abgerundet.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.9, review_count: 201 },
      { id: '695', product_id: '50ml-bottles', variant_number: '695', name: 'ALDENAIR 695', description: 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere. Die holzige Basis aus Zedernholz und Vetiver wird von süßer Vanille und Amber abgerundet.', price: 49.99, in_stock: true, stock_quantity: 100, rating: 4.7, review_count: 189 },
      
      // Testerkits variants
      { id: '399-sample', product_id: 'testerkits', variant_number: '399', name: 'ALDENAIR 399 Testerkit', description: 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Die edle Komposition aus Bergamotte und Zedernholz in der Herznote verschmilzt mit dem kostbaren Oud in der Basis zu einem unverwechselbaren, maskulinen Parfüm. Perfekt zum Testen vor dem Kauf der Vollgröße.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.8, review_count: 156 },
      { id: '978-sample', product_id: 'testerkits', variant_number: '978', name: 'ALDENAIR 978 Testerkit', description: 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und Zitrone treffen auf exotischen Jasmin-Sambac und warmen Honig. Probieren Sie diesen sinnlichen Duft in der praktischen 5ml Größe.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.9, review_count: 203 },
      { id: '999-sample', product_id: 'testerkits', variant_number: '999', name: 'ALDENAIR 999 Testerkit', description: 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz in der Herznote ergänzen sich perfekt mit der frischen Apfel-Note und dem mystischen Oud in der Basis.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.7, review_count: 178 },
      { id: '189-sample', product_id: 'testerkits', variant_number: '189', name: 'ALDENAIR 189 Testerkit', description: 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose in der Herznote werden von einer reichen Basis aus Harzen, Holznoten und aromatischem Kaffee getragen.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.6, review_count: 167 },
      { id: '390-sample', product_id: 'testerkits', variant_number: '390', name: 'ALDENAIR 390 Testerkit', description: 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille in der Herznote verschmelzen mit Safran und Rum zu einer warmen, einladenden Komposition.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.8, review_count: 145 },
      { id: '275-sample', product_id: 'testerkits', variant_number: '275', name: 'ALDENAIR 275 Testerkit', description: 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom treffen auf cremige Tonkabohne und tropische Ananas. Perfekt für warme Tage.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.5, review_count: 134 },
      { id: '527-sample', product_id: 'testerkits', variant_number: '527', name: 'ALDENAIR 527 Testerkit', description: 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.9, review_count: 201 },
      { id: '695-sample', product_id: 'testerkits', variant_number: '695', name: 'ALDENAIR 695 Testerkit', description: 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere.', price: 6.95, in_stock: true, stock_quantity: 200, rating: 4.7, review_count: 189 },
      
      // Sparkits variants
      { id: 'sparkit-5-proben', product_id: 'sparkits', variant_number: 'SPAR5', name: 'Sparkit - 5x Proben', description: 'Stelle dir dein persönliches Sparkit zusammen! Wähle 5 beliebige Proben (5ml) aus unserem gesamten Sortiment und spare dabei. Perfekt, um verschiedene Düfte zu testen und deinen Favoriten zu finden.', price: 29.95, original_price: 34.75, in_stock: true, stock_quantity: 100, rating: 4.9, review_count: 87 },
      { id: 'sparkit-3x50ml', product_id: 'sparkits', variant_number: 'SPAR3', name: 'Sparkit - 3x 50ml Flakons', description: 'Spare beim Kauf von 3 beliebigen 50ml Flakons! Wähle aus unserem kompletten Sortiment deine drei Lieblingsdüfte aus und profitiere von einem attraktiven Bundle-Preis.', price: 129.99, original_price: 149.97, in_stock: true, stock_quantity: 50, rating: 4.8, review_count: 124 },
      { id: 'sparkit-5x50ml', product_id: 'sparkits', variant_number: 'SPAR5F', name: 'Sparkit - 5x 50ml Flakons', description: 'Unser beliebtestes Sparkit! Wähle 5 beliebige 50ml Flakons aus unserem gesamten Sortiment und spare dabei maximal. Ideal für Duftliebhaber, die ihre Sammlung erweitern möchten.', price: 199.99, original_price: 249.95, in_stock: true, stock_quantity: 30, rating: 5.0, review_count: 156 },
      
      // Autoparfüm variants
      { id: 'auto-399', product_id: 'autoparfum', variant_number: '399', name: 'ALDENAIR Autoparfüm 399', description: 'Luxuriöser orientalischer Duft für Ihr Auto. Langanhaltender Duft, der Ihr Fahrzeug in eine Oase der Eleganz verwandelt.', price: 14.99, in_stock: true, stock_quantity: 150, rating: 4.6, review_count: 92 },
      { id: 'auto-978', product_id: 'autoparfum', variant_number: '978', name: 'ALDENAIR Autoparfüm 978', description: 'Süß-würziger Duft für unterwegs. Perfekt für lange Fahrten und ein angenehmes Ambiente im Auto.', price: 14.99, in_stock: true, stock_quantity: 150, rating: 4.7, review_count: 103 },
      { id: 'auto-999', product_id: 'autoparfum', variant_number: '999', name: 'ALDENAIR Autoparfüm 999', description: 'Holzig-blumiger Autoduft mit zeitlosem Charakter. Verwandelt jede Fahrt in ein Dufterlebnis.', price: 14.99, in_stock: true, stock_quantity: 150, rating: 4.5, review_count: 87 },
      { id: 'auto-189', product_id: 'autoparfum', variant_number: '189', name: 'ALDENAIR Autoparfüm 189', description: 'Süßer Gourmand-Duft mit Kaffee-Noten für Ihr Auto. Ideal für Kaffeeliebhaber.', price: 14.99, in_stock: true, stock_quantity: 150, rating: 4.6, review_count: 95 },
      
      // 3D Collection variants
      { id: '3d-001', product_id: '3d-collection', variant_number: '001', name: 'ALDENAIR 3D 001', description: 'Premium 3D Duft-Erlebnis mit innovativer Technologie. 100ml für langanhaltenden Luxus.', price: 79.99, in_stock: true, stock_quantity: 50, preorder: false, rating: 4.9, review_count: 78 }
    ];

    // Insert products
    const { error: productsError } = await supabaseClient
      .from('products')
      .upsert(products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        size: p.size,
        image: p.image
      })), { onConflict: 'id' });

    if (productsError) throw productsError;

    // Insert variants
    const { error: variantsError } = await supabaseClient
      .from('product_variants')
      .upsert(variants.map(v => ({
        id: v.id,
        product_id: v.product_id,
        variant_number: v.variant_number,
        name: v.name,
        description: v.description,
        price: v.price,
        original_price: v.original_price || null,
        in_stock: v.in_stock,
        stock_quantity: v.stock_quantity,
        preorder: v.preorder || false,
        rating: v.rating,
        review_count: v.review_count
      })), { onConflict: 'id' });

    if (variantsError) throw variantsError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Products seeded successfully',
        productsCount: products.length,
        variantsCount: variants.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
