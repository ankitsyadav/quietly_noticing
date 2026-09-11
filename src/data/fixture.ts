/**
 * Dummy catalog used while DATA_SOURCE=fixture (the default until Neha's
 * sheet has real rows). Shaped exactly like a Sheets API v4 values response
 * so switching to DATA_SOURCE=sheet exercises the identical parser.
 *
 * Images come from loremflickr (real, keyword-matched Flickr photos, not
 * abstract placeholders) so the storefront actually looks like a women's
 * fashion/jewellery/beauty catalogue while real product photos aren't in
 * yet. `?lock=<n>` pins each URL to one specific photo so it's stable
 * across reloads instead of re-rolling on every request.
 *
 * Deliberately includes the edge cases that matter: 1-image and 4-image
 * products, missing MRP, a Sold Out item, an unindexable short note, every
 * supported platform, and one row per known failure mode for /health to
 * demonstrate against.
 */
import type { ValueGrid } from '@/lib/parse-catalog';

let lockSeq = 100;
/** A real photo matching `keywords`, stable across reloads via its lock id. */
function photo(keywords: string): string {
  lockSeq += 1;
  return `https://loremflickr.com/800/1000/${encodeURIComponent(keywords)}?lock=${lockSeq}`;
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
  r({ Id: '1', Title: 'Gold Plated Hoop Earrings', Category: 'Jewellery', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example1?tag=quietlynoticing', Price: '299', MRP: '999', Badge: 'Trending', Featured: 'true',
    Note: 'I loved this because it looks so premium without being expensive — I have worn it almost daily for two months and the gold tone has not faded once.',
    Description: '18k gold-plated, tarnish-resistant, 2cm drop, hypoallergenic posts.',
    Pic_1: photo('gold hoop earrings,jewelry'), Pic_2: photo('gold earrings,woman,fashion'), Pic_3: photo('jewelry,earrings,closeup'), Pic_4: photo('woman,earrings,portrait') }),

  r({ Id: '2', Title: 'Ribbed Knit Tote Bag', Category: 'Bags', Platform: 'Myntra',
    Affiliate_Link: 'https://myntra.com/example2', Price: '649', MRP: '1299', Badge: 'New', Featured: 'true',
    Note: 'This carries my whole day without stretching out of shape, and the neutral shade goes with literally everything I own.',
    Description: 'Soft ribbed knit, roomy 14L interior, magnetic snap closure.',
    Pic_1: photo('tote bag,woman,fashion'), Pic_2: photo('knit bag,handbag') }),

  r({ Id: '3', Title: 'Matte Liquid Lipstick — Terracotta', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example3', Price: '449', MRP: '', Featured: 'true',
    Note: 'The shade is exactly the warm terracotta I was hoping for and it genuinely lasted through an entire wedding without needing a touch-up.',
    Description: 'Long-wear matte finish, transfer-proof, 3.5g.',
    Pic_1: photo('lipstick,makeup,beauty') }),

  r({ Id: '4', Title: 'Ceramic Ribbed Planter Set of 2', Category: 'Home', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example4', Price: '599', MRP: '899',
    Note: 'These sit on my windowsill and somehow make every plant I put in them look ten times more expensive than it is.',
    Description: 'Set of 2, 4in and 6in, drainage hole with tray, matte white.',
    Pic_1: photo('ceramic planter,home decor'), Pic_2: photo('plant pot,indoor plant'), Pic_3: photo('planter,windowsill') }),

  r({ Id: '5', Title: 'Everyday Chunky Sneakers', Category: 'Footwear', Platform: 'Ajio',
    Affiliate_Link: 'https://ajio.com/example5', Price: '1299', MRP: '2499', Badge: 'Bestseller',
    Note: 'I wear these on every travel day now — they are the one shoe that has never once given me a blister on a long walk.',
    Description: 'Chunky sole, breathable mesh upper, lace-up.',
    Pic_1: photo('white sneakers,shoes,woman'), Pic_2: photo('sneakers,footwear') }),

  r({ Id: '6', Title: 'Layered Pearl Necklace', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example6', Price: '349', MRP: '799',
    Note: 'so pretty!', // deliberately short -> not indexable
    Description: 'Two-layer freshwater pearl finish, adjustable chain.',
    Pic_1: photo('pearl necklace,jewelry,woman') }),

  r({ Id: '7', Title: 'Wireless Earbuds — ANC', Category: 'Electronics', Platform: 'Flipkart',
    Affiliate_Link: 'https://flipkart.com/example7', Price: '1799', MRP: '3499', Badge: 'Trending', Featured: 'true',
    Note: 'The noise cancellation genuinely holds up on a crowded local train, and the battery has never once died on me mid-commute.',
    Description: '30hr total playback, ANC, IPX4, USB-C fast charge.',
    Pic_1: photo('wireless earbuds,tech'), Pic_2: photo('earbuds case'), Pic_3: photo('earbuds,woman,listening'), Pic_4: photo('earbuds,charging case') }),

  r({ Id: '8', Title: 'Satin Slip Skirt', Category: 'Fashion', Platform: 'Myntra',
    Affiliate_Link: 'https://myntra.com/example8', Price: '899', MRP: '1799',
    Note: 'It drapes so much better than the price suggests, and I have dressed it up and down more times than I can count already.',
    Description: 'Bias-cut satin, midi length, elastic waistband.',
    Pic_1: photo('satin skirt,woman,fashion'), Pic_2: photo('midi skirt,outfit') }),

  r({ Id: '9', Title: 'Stainless Steel Lunch Box — 3 Compartment', Category: 'Kitchen', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example9', Price: '399', MRP: '699',
    Note: 'It has survived daily use in my bag for months without a single leak, which is more than I can say for the last three I tried.',
    Description: 'Leak-proof, insulated outer, 900ml total capacity.',
    Pic_1: photo('lunch box,steel container') }),

  r({ Id: '10', Title: 'Rose Gold Cuff Bracelet', Category: 'Jewellery', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example10', Price: '249', MRP: '599', Status: 'Sold Out',
    Note: 'This was one of my most-worn pieces this year, which is exactly why I am sad it is currently out of stock.',
    Description: 'Adjustable open cuff, rose gold finish.',
    Pic_1: photo('bracelet,rose gold,jewelry') }),

  r({ Id: '11', Title: 'Cotton Co-ord Set — Sage', Category: 'Fashion', Platform: 'Ajio',
    Affiliate_Link: 'https://ajio.com/example11', Price: '1099', MRP: '2199', Badge: 'New',
    Note: 'It is the most comfortable thing in my closet and somehow still looks put-together enough to wear outside the house.',
    Description: 'Breathable cotton blend, relaxed fit, pockets.',
    Pic_1: photo('co-ord set,woman,fashion'), Pic_2: photo('cotton outfit,woman'), Pic_3: photo('loungewear,fashion') }),

  r({ Id: '12', Title: 'Silk-Finish Hair Serum', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example12', Price: '299', MRP: '499',
    Note: 'good smell', // short -> not indexable
    Description: 'Lightweight, non-greasy, 50ml.',
    Pic_1: photo('hair serum,haircare') }),
];

// Beyond 12, the /shop grid switches on automatically — these round out
// categories and give search/filter/sort something real to work with.
const more: [string, string, string, string, string, string, string, string?][] = [
  ['13', 'Woven Straw Tote', 'Bags', 'Amazon', 'https://amazon.in/dp/example13', '549', 'straw tote bag,summer', '999'],
  ['14', 'Statement Drop Earrings', 'Jewellery', 'Meesho', 'https://meesho.com/example14', '199', 'drop earrings,jewelry', '499'],
  ['15', 'Velvet Scrunchie Set of 6', 'Fashion', 'Amazon', 'https://amazon.in/dp/example15', '199', 'hair scrunchie,velvet', ''],
  ['16', 'Marble Coasters Set of 4', 'Home', 'Flipkart', 'https://flipkart.com/example16', '449', 'marble coasters,home decor', '799'],
  ['17', 'Tinted Lip Oil', 'Beauty', 'Nykaa', 'https://nykaa.com/example17', '399', 'lip oil,makeup', '599'],
  ['18', 'Canvas Sling Bag', 'Bags', 'Myntra', 'https://myntra.com/example18', '699', 'sling bag,canvas bag', '1399'],
  ['19', 'Espadrille Flats', 'Footwear', 'Ajio', 'https://ajio.com/example19', '899', 'espadrille flats,woman shoes', '1599'],
  ['20', 'Non-Stick Dosa Tawa', 'Kitchen', 'Amazon', 'https://amazon.in/dp/example20', '799', 'dosa tawa,cookware', '1199'],
  ['21', 'Charging Stand — 3-in-1', 'Electronics', 'Flipkart', 'https://flipkart.com/example21', '999', 'phone charging stand', '1999'],
  ['22', 'Chiffon Printed Dupatta', 'Fashion', 'Meesho', 'https://meesho.com/example22', '249', 'chiffon dupatta,indian fashion', '499'],
  ['23', 'Layered Anklet Set', 'Jewellery', 'Amazon', 'https://amazon.in/dp/example23', '179', 'anklet,jewelry,feet', '399'],
  ['24', 'Woven Table Runner', 'Home', 'Amazon', 'https://amazon.in/dp/example24', '349', 'table runner,home decor', '649'],
  ['25', 'Compact Setting Powder', 'Beauty', 'Nykaa', 'https://nykaa.com/example25', '299', 'setting powder,makeup compact', ''],
  ['26', 'Quilted Crossbody Bag', 'Bags', 'Myntra', 'https://myntra.com/example26', '899', 'crossbody bag,woman', '1799'],
  ['27', 'Platform Block Heels', 'Footwear', 'Ajio', 'https://ajio.com/example27', '1199', 'block heels,woman shoes', '2299'],
  ['28', 'Insulated Water Bottle 1L', 'Kitchen', 'Amazon', 'https://amazon.in/dp/example28', '499', 'water bottle,steel bottle', '899'],
  ['29', 'Wired Neckband — Bass+', 'Electronics', 'Amazon', 'https://amazon.in/dp/example29', '599', 'neckband earphones,tech', '1199'],
  ['30', 'Linen Blend Shirt Dress', 'Fashion', 'Myntra', 'https://myntra.com/example30', '1299', 'shirt dress,woman,fashion', '2499'],
];

for (const [id, title, category, platform, link, price, keywords, mrp] of more) {
  rows.push(
    r({
      Id: id, Title: title, Category: category, Platform: platform, Affiliate_Link: link, Price: price, MRP: mrp ?? '',
      Note: 'One of my favourite recent finds — it photographs beautifully and has genuinely held up to daily use, which is the only test that matters to me.',
      Description: `${title} — a small everyday find worth a second look.`,
      Pic_1: photo(keywords), Pic_2: photo(keywords),
    }),
  );
}

export const fixtureProductsGrid: ValueGrid = [productHeaders as unknown as string[], ...rows];

export const fixtureCategoriesGrid: ValueGrid = [
  ['Name', 'Slug', 'Order', 'Cover', 'Blurb', 'Featured'],
  ['Fashion', 'fashion', '1', photo('women fashion,outfit'), 'Considered everyday fashion that photographs as well off-duty as it does in a Reel.', 'true'],
  ['Jewellery', 'jewellery', '2', photo('gold jewelry,woman'), 'Everyday gold-tone and layered pieces that don’t look cheap up close.', 'true'],
  ['Beauty', 'beauty', '3', photo('makeup,beauty products'), 'Products I have actually finished a bottle of, not just tried once.', 'true'],
  ['Bags', 'bags', '4', photo('handbag,woman fashion'), 'Totes, slings and everyday carries built to survive a real commute.', 'true'],
  ['Home', 'home', '5', photo('home decor,interior'), 'Small pieces that make a rented room feel considered.', 'false'],
  ['Kitchen', 'kitchen', '6', photo('kitchenware,cookware'), 'Kitchen finds I reach for often enough to actually recommend.', 'false'],
  ['Footwear', 'footwear', '7', photo('women shoes,footwear'), 'Shoes tested on real walking days, not just a photo.', 'false'],
  ['Electronics', 'electronics', '8', photo('gadgets,tech accessories'), 'Small electronics that earned a permanent spot in my bag.', 'false'],
];

export const fixtureCollectionsGrid: ValueGrid = [
  ['Name', 'Slug', 'Product_Ids', 'Caption', 'Cover'],
  ['Today’s Reel Picks', 'todays-reel-picks', '1,2,7,11', 'Everything from today’s reel, in one place.', photo('flatlay,fashion accessories')],
  ['Diwali Edit', 'diwali-edit', '1,6,10,14,23', 'What I am actually wearing this Diwali.', photo('indian jewelry,festive')],
];
