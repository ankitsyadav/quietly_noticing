/**
 * Dummy catalog used while DATA_SOURCE=fixture (the default until Neha's
 * sheet has real rows). Shaped exactly like a Sheets API v4 values response
 * so switching to DATA_SOURCE=sheet exercises the identical parser.
 *
 * Categories, platform mix and voice here are modelled on her actual
 * Instagram (@quietly__noticing — "Pretty Finds 🎀 Fashion • Decor"):
 * traditional/kundan jewellery and layered necklaces, ethnic co-ord sets
 * and sarees, and Meesho-sourced home decor hauls are what she genuinely
 * posts, so the dummy catalog leans into that instead of generic westernwear.
 *
 * Images: tried loremflickr first for real keyword-matched photos, but it
 * rate-limits hard under this app's actual load pattern — a cold page load
 * requests ~25-30 unique Pic_1 images near-simultaneously (one per visible
 * card), which reliably tripped their per-IP limit within a few page loads,
 * independent of any manual testing. Every image on the site still degrades
 * gracefully to a fallback tile when a URL fails (see ProductImage), so
 * nothing breaks — but a demo that's mostly fallback icons isn't useful to
 * look at. Picsum has been 100% reliable all session, so that's the
 * fixture's image source instead; it's real (Unsplash-sourced) photography,
 * just not keyword-targeted to jewellery/ethnic wear specifically. Swap
 * back to photo-by-keyword (or real postimages URLs) once real product
 * shots exist — see git history for the loremflickr version if wanted.
 * `seed` pins each URL to one specific photo, stable across reloads.
 *
 * Deliberately includes the edge cases that matter: 1-image and 4-image
 * products, missing MRP, a Sold Out item, an unindexable short note, every
 * supported platform, and one row per known failure mode for /health to
 * demonstrate against.
 */
import type { ValueGrid } from '@/lib/parse-catalog';

let seedSeq = 100;
/** A real (Unsplash-sourced) photo, stable across reloads via its seed. */
function photo(_keywords: string): string {
  seedSeq += 1;
  return `https://picsum.photos/seed/qn${seedSeq}/800/1000`;
}

export const productHeaders = [
  'Id', 'Title', 'Note', 'Description', 'Category', 'Platform',
  'Affiliate_Link', 'Price', 'MRP', 'Badge', 'Featured', 'Status',
  'Pic_1', 'Pic_2', 'Pic_3', 'Pic_4',
] as const;

type Row = Record<(typeof productHeaders)[number], string>;

function r(partial: Partial<Row> & Pick<Row, 'Id' | 'Title' | 'Category' | 'Affiliate_Link' | 'Price'>): string[] {
  const full: Row = {
    Note: '', Description: '', Platform: '', MRP: '', Badge: '', Featured: '', Status: '',
    Pic_1: '', Pic_2: '', Pic_3: '', Pic_4: '',
    ...partial,
  };
  return productHeaders.map((h) => full[h]);
}

const rows: string[][] = [
  // ── Jewellery — her single biggest theme: kundan/jadau sets, jhumkas, layered necklaces, bangles ──
  r({ Id: '1', Title: 'Kundan Chandbali Earrings', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example1', Price: '299', MRP: '999', Badge: 'Trending', Featured: 'true',
    Note: 'These looked so much more expensive than ₹299 the second I put them on — the kundan work catches the light beautifully and they are surprisingly light to wear all evening.',
    Description: 'Kundan-work chandbali, gold-tone brass, secure hook back, 4.5cm drop.',
    Pic_1: photo('kundan earrings,indian jewelry'), Pic_2: photo('chandbali earrings,gold'), Pic_3: photo('indian earrings,woman'), Pic_4: photo('jewelry closeup,earrings') }),

  r({ Id: '2', Title: 'Layered Kundan Necklace Set', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example2', Price: '449', MRP: '1499', Badge: 'Bestseller', Featured: 'true',
    Note: 'A little sparkle really does change the whole look — I wore this with a plain kurta and it instantly felt festive. Comes with matching earrings too.',
    Description: 'Layered kundan-polki necklace with matching jhumka earrings, adjustable dori closure.',
    Pic_1: photo('kundan necklace set,indian jewelry'), Pic_2: photo('layered necklace,gold jewelry'), Pic_3: photo('necklace set,bridal jewelry') }),

  r({ Id: '3', Title: '18K Gold Plated Cuff Bangle', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example3', Price: '249', MRP: '699', Featured: 'true',
    Note: 'Graceful, elegant, and genuinely everyday-wearable — this is the piece I reach for when I want something that looks intentional without trying too hard.',
    Description: '18K gold-plated, adjustable open cuff, tarnish-resistant finish.',
    Pic_1: photo('gold cuff bangle,jewelry'), Pic_2: photo('gold bracelet,woman wrist') }),

  r({ Id: '4', Title: 'Colourful Meenakari Bangles Set of 6', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example4', Price: '199', MRP: '399',
    Note: 'These stack so well with everything else in my jewellery box, and the meenakari colours photograph beautifully in daylight — my most complimented set this year.',
    Description: 'Meenakari enamel work, set of 6, mixed sizes 2.4–2.6in.',
    Pic_1: photo('meenakari bangles,indian jewelry'), Pic_2: photo('colorful bangles,woman hand') }),

  r({ Id: '5', Title: 'Emerald Drop Pendant Necklace', Category: 'Jewellery', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example5', Price: '599', MRP: '1299', Badge: 'New',
    Note: 'so pretty, wore it the same day it arrived', // deliberately short -> not indexable
    Description: 'Single emerald-tone drop, gold-tone chain, 18in with 2in extender.',
    Pic_1: photo('emerald necklace,pendant jewelry') }),

  r({ Id: '6', Title: 'Statement Jhumka Earrings — Antique Gold', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example6', Price: '164', MRP: '599', Badge: 'Trending',
    Note: '₹164 for these — I genuinely had to double check the price at checkout. The antique gold finish looks so much richer than what you would expect at this price.',
    Description: 'Antique gold-tone jhumka, oxidised finish, lightweight alloy base.',
    Pic_1: photo('jhumka earrings,antique gold jewelry'), Pic_2: photo('gold jhumka,indian earrings') }),

  r({ Id: '7', Title: 'Gold Leaf Hair Vine', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example7', Price: '349', MRP: '799', Status: 'Sold Out',
    Note: 'This was the prettiest hair piece I picked up all season, which is exactly why I am sad it is currently out of stock — hoping it restocks before wedding season.',
    Description: 'Gold-tone leaf hair vine, adjustable comb pins, lightweight metal.',
    Pic_1: photo('gold hair accessory,bridal hairpiece') }),

  r({ Id: '8', Title: 'Polki Choker Necklace Set', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example8', Price: '699', MRP: '1999', Badge: 'Bestseller',
    Note: 'This is the set I keep recommending to everyone asking what to wear for a friend’s sangeet — it photographs like a much pricier piece and the choker sits perfectly.',
    Description: 'Polki-style choker with matching drop earrings, kundan accents, adjustable dori.',
    Pic_1: photo('polki choker necklace,indian bridal jewelry'), Pic_2: photo('choker necklace,gold jewelry'), Pic_3: photo('indian jewelry set,bridal') }),

  // ── Ethnic wear / sarees — her second biggest theme ──
  r({ Id: '9', Title: 'Embroidered Organza Co-ord Set — Blush Pink', Category: 'Ethnic Wear', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example9', Price: '899', MRP: '1799', Badge: 'Trending', Featured: 'true',
    Note: 'This is how they actually look on — the floral embroidery is so much prettier in person, and the size ran true so I didn’t need any alterations.',
    Description: 'Organza co-ord set, floral thread embroidery, includes kurta and pants, size bhi bilkul perfect.',
    Pic_1: photo('pink embroidered kurta set,ethnic wear'), Pic_2: photo('indian coord set,woman fashion'), Pic_3: photo('embroidered kurta,pink outfit') }),

  r({ Id: '10', Title: 'Banarasi Silk Saree — Emerald Green', Category: 'Ethnic Wear', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example10', Price: '1099', MRP: '2799', Badge: 'New', Featured: 'true',
    Note: 'The zari border alone makes this look like a family heirloom rather than something I found online — this is my go-to recommendation for a festive saree that doesn’t break the bank.',
    Description: 'Banarasi-weave silk blend saree with zari border, unstitched blouse piece included.',
    Pic_1: photo('banarasi saree,green silk saree'), Pic_2: photo('indian saree,festive wear'), Pic_3: photo('silk saree,zari border') }),

  r({ Id: '11', Title: 'Floral Embroidered Co-ord Set — Ivory', Category: 'Ethnic Wear', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example11', Price: '749', MRP: '1499',
    Note: 'Meesho find that genuinely looks far more expensive than it is — the floral thread work is dense and even, not the patchy embroidery you sometimes get at this price.',
    Description: 'Ivory georgette co-ord set with floral thread embroidery, straight-fit kurta and pants.',
    Pic_1: photo('ivory embroidered kurta,ethnic coord'), Pic_2: photo('floral embroidery kurta,white outfit') }),

  r({ Id: '12', Title: 'Chiffon Printed Dupatta', Category: 'Ethnic Wear', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example12', Price: '249', MRP: '499',
    Note: 'good drape', // short -> not indexable
    Description: 'Lightweight chiffon, digital floral print, 2.25m length with contrast border.',
    Pic_1: photo('chiffon dupatta,indian fashion') }),

  r({ Id: '13', Title: 'Silk Blend Saree — Sindoori Red', Category: 'Ethnic Wear', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example13', Price: '999', MRP: '2299', Badge: 'Bestseller',
    Note: 'The red and gold combination is exactly what I look for in a saree that has to work for multiple functions in one wedding season — this one has earned its place in heavy rotation.',
    Description: 'Silk blend saree with contrast pallu, comes with matching blouse piece.',
    Pic_1: photo('red silk saree,indian wedding wear'), Pic_2: photo('saree pallu,red gold saree') }),

  // ── Home decor — the third real theme (Meesho hauls, price-list style) ──
  r({ Id: '14', Title: 'Floral Print Bedsheet Set — King Size', Category: 'Home', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example14', Price: '499', MRP: '899', Badge: 'Trending', Featured: 'true',
    Note: 'This completely changed how my room looks without a full redecorate — soft cotton, colours haven’t faded after multiple washes, and the fitted corners actually stay fitted.',
    Description: 'King size, 100% cotton, includes bedsheet + 2 pillow covers, floral print.',
    Pic_1: photo('floral bedsheet,bedroom decor'), Pic_2: photo('bedsheet pillow set,home decor') }),

  r({ Id: '15', Title: 'Modern Art Canvas Wall Painting', Category: 'Home', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example15', Price: '448', MRP: '899',
    Note: 'This one piece did more for the room than anything else I’ve bought this year — the colours are richer in person and it genuinely anchors the whole wall.',
    Description: 'Canvas print, framed, ready to hang, 60x90cm.',
    Pic_1: photo('modern art canvas,wall painting decor') }),

  r({ Id: '16', Title: 'Ceramic Ribbed Planter Set of 2', Category: 'Home', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example16', Price: '399', MRP: '699',
    Note: 'These sit on my windowsill and somehow make every plant I put in them look ten times more expensive than it is.',
    Description: 'Set of 2, 4in and 6in, drainage hole with tray, matte white.',
    Pic_1: photo('ceramic planter,home decor'), Pic_2: photo('plant pot,indoor plant') }),

  r({ Id: '17', Title: 'Embroidered Cushion Cover Set of 5', Category: 'Home', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example17', Price: '379', MRP: '799',
    Note: 'Every single person who has sat on my sofa since these arrived has asked where they’re from — the mustard tone works with almost any wall colour.',
    Description: 'Set of 5, 16x16in, mixed embroidered patterns, cotton blend cover.',
    Pic_1: photo('cushion covers,sofa decor,mustard') }),

  r({ Id: '18', Title: 'Fairy String Lights — Warm White, 10m', Category: 'Home', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example18', Price: '299', MRP: '',
    Note: 'wraps beautifully around the headboard', // short -> not indexable
    Description: 'Warm white LED, 10m, 8 lighting modes, USB powered.',
    Pic_1: photo('fairy lights,bedroom decor') }),

  // ── Beauty and bags — smaller adjacent categories she also touches on ──
  r({ Id: '19', Title: 'Matte Liquid Lipstick — Terracotta', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example19', Price: '449', MRP: '',
    Note: 'The shade is exactly the warm terracotta I was hoping for and it genuinely lasted through an entire wedding function without needing a touch-up.',
    Description: 'Long-wear matte finish, transfer-proof, 3.5g.',
    Pic_1: photo('lipstick,makeup,beauty') }),

  r({ Id: '20', Title: 'Silk-Finish Hair Serum', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example20', Price: '299', MRP: '499',
    Note: 'A tiny amount goes a long way before any festive hairstyle — it tames frizz without ever leaving my hair looking weighed down or greasy.',
    Description: 'Lightweight, non-greasy, 50ml.',
    Pic_1: photo('hair serum,haircare') }),

  r({ Id: '21', Title: 'Potli Clutch Bag — Embroidered', Category: 'Bags', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example21', Price: '349', MRP: '699', Badge: 'New',
    Note: 'The perfect size for a phone, lipstick and cash — I have carried this to three functions in a row and it still looks brand new.',
    Description: 'Embroidered potli-style clutch, drawstring closure, detachable chain strap.',
    Pic_1: photo('potli bag,embroidered clutch'), Pic_2: photo('ethnic clutch bag,indian fashion') }),

  r({ Id: '22', Title: 'Quilted Sling Bag', Category: 'Bags', Platform: 'Myntra',
    Affiliate_Link: 'https://myntra.com/example22', Price: '699', MRP: '1399',
    Note: 'Goes from a daytime kurta to an evening saree without looking out of place, which is exactly the kind of bag I actually need on a trip.',
    Description: 'Quilted PU leather, adjustable chain strap, 3 compartments.',
    Pic_1: photo('quilted sling bag,woman handbag') }),
];

// Beyond 12, the /shop grid switches on automatically — these round out
// the jewellery and ethnic-wear categories with more real-feeling variety.
const more: [string, string, string, string, string, string, string, string?][] = [
  ['23', 'Oxidised Silver Jhumkas', 'Jewellery', 'Meesho', 'https://meesho.com/example23', '229', 'oxidised silver earrings,indian jewelry', '499'],
  ['24', 'Rani Pink Anarkali Suit Set', 'Ethnic Wear', 'Meesho', 'https://meesho.com/example24', '1199', 'pink anarkali suit,indian ethnic wear', '2499'],
  ['25', 'Kundan Maang Tikka', 'Jewellery', 'Meesho', 'https://meesho.com/example25', '179', 'maang tikka,kundan jewelry', '399'],
  ['26', 'Mustard Yellow Cotton Kurta Set', 'Ethnic Wear', 'Meesho', 'https://meesho.com/example26', '649', 'yellow kurta set,cotton ethnic wear', '1299'],
  ['27', 'Rustic Wooden Photo Frame Set of 3', 'Home', 'Amazon', 'https://amazon.in/dp/example27', '349', 'wooden photo frames,home decor', '599'],
  ['28', 'Layered Anklet Set', 'Jewellery', 'Meesho', 'https://meesho.com/example28', '179', 'anklet,indian jewelry,feet', '399'],
  ['29', 'Georgette Printed Saree — Dusty Rose', 'Ethnic Wear', 'Meesho', 'https://meesho.com/example29', '799', 'dusty pink saree,georgette saree', '1799'],
  ['30', 'Compact Setting Powder', 'Beauty', 'Nykaa', 'https://nykaa.com/example30', '299', 'setting powder,makeup compact', ''],
];

for (const [id, title, category, platform, link, price, keywords, mrp] of more) {
  rows.push(
    r({
      Id: id, Title: title, Category: category, Platform: platform, Affiliate_Link: link, Price: price, MRP: mrp ?? '',
      Note: 'One of my favourite recent finds — it photographs beautifully and has genuinely held up to daily wear, which is the only test that matters to me.',
      Description: `${title} — a small everyday find worth a second look.`,
      Pic_1: photo(keywords), Pic_2: photo(keywords),
    }),
  );
}

export const fixtureProductsGrid: ValueGrid = [productHeaders as unknown as string[], ...rows];

export const fixtureCategoriesGrid: ValueGrid = [
  ['Name', 'Slug', 'Order', 'Cover', 'Blurb', 'Featured'],
  ['Jewellery', 'jewellery', '1', photo('kundan jewelry,indian jewelry'), 'Kundan sets, jhumkas and everyday gold-tone pieces that photograph as well as they feel.', 'true'],
  ['Ethnic Wear', 'ethnic-wear', '2', photo('indian ethnic wear,saree'), 'Sarees and co-ord sets I’d actually wear to a function, not just style for a photo.', 'true'],
  ['Home', 'home', '3', photo('home decor,interior'), 'Small pieces that make a rented room feel considered, one Meesho haul at a time.', 'true'],
  ['Beauty', 'beauty', '4', photo('makeup,beauty products'), 'Products I have actually finished a bottle of, not just tried once.', 'true'],
  ['Bags', 'bags', '5', photo('handbag,woman fashion'), 'Clutches and slings that go from daytime to festive without a second thought.', 'false'],
];

export const fixtureCollectionsGrid: ValueGrid = [
  ['Name', 'Slug', 'Product_Ids', 'Caption', 'Cover'],
  ['Pretty Picks 🎀', 'pretty-picks', '1,2,9,14', 'Everything from today’s reel, in one place.', photo('flatlay,indian jewelry accessories')],
  ['Festive Edit', 'festive-edit', '2,8,10,13,24', 'What I am actually wearing this wedding season.', photo('indian festive jewelry,saree')],
];
