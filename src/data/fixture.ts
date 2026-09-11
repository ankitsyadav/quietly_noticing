/**
 * Dummy catalog used while DATA_SOURCE=fixture (the default until Neha's
 * sheet has real rows). Shaped exactly like a Sheets API v4 values response
 * so switching to DATA_SOURCE=sheet exercises the identical parser.
 *
 * Deliberately includes the edge cases that matter: 1-image and 4-image
 * products, missing MRP, a Sold Out item, an unindexable short note, every
 * supported platform, and one row per known failure mode for /health to
 * demonstrate against.
 */
import type { ValueGrid } from '@/lib/parse-catalog';

const img = (seed: string, n: number) => `https://picsum.photos/seed/${seed}${n}/800/1000`;

const LONG_NOTE = (s: string) => s; // just documents intent inline below

export const productHeaders = [
  'Id', 'Title', 'Note', 'Description', 'Category', 'Platform',
  'Affiliate_Link', 'Price', 'MRP', 'Badge', 'Featured', 'Status',
  'Pic_1', 'Pic_2', 'Pic_3', 'Pic_4',
] as const;

type Row = Record<(typeof productHeaders)[number], string>;

function r(partial: Partial<Row> & Pick<Row, 'Id' | 'Title' | 'Category' | 'Affiliate_Link' | 'Price'>): string[] {
  const full: Row = {
    Note: '', Description: '', Platform: '', MRP: '', Badge: '', Featured: '', Status: '',
    Pic_1: img(partial.Id, 1), Pic_2: '', Pic_3: '', Pic_4: '',
    ...partial,
  };
  return productHeaders.map((h) => full[h]);
}

const rows: string[][] = [
  r({ Id: '1', Title: 'Gold Plated Hoop Earrings', Category: 'Jewellery', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example1?tag=quietlynoticing', Price: '299', MRP: '999', Badge: 'Trending', Featured: 'true',
    Note: LONG_NOTE('I loved this because it looks so premium without being expensive — I have worn it almost daily for two months and the gold tone has not faded once.'),
    Description: '18k gold-plated, tarnish-resistant, 2cm drop, hypoallergenic posts.',
    Pic_1: img('1', 1), Pic_2: img('1', 2), Pic_3: img('1', 3), Pic_4: img('1', 4) }),

  r({ Id: '2', Title: 'Ribbed Knit Tote Bag', Category: 'Bags', Platform: 'Myntra',
    Affiliate_Link: 'https://myntra.com/example2', Price: '649', MRP: '1299', Badge: 'New', Featured: 'true',
    Note: LONG_NOTE('This carries my whole day without stretching out of shape, and the neutral shade goes with literally everything I own.'),
    Description: 'Soft ribbed knit, roomy 14L interior, magnetic snap closure.',
    Pic_1: img('2', 1), Pic_2: img('2', 2) }),

  r({ Id: '3', Title: 'Matte Liquid Lipstick — Terracotta', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example3', Price: '449', MRP: '', Featured: 'true',
    Note: LONG_NOTE('The shade is exactly the warm terracotta I was hoping for and it genuinely lasted through an entire wedding without needing a touch-up.'),
    Description: 'Long-wear matte finish, transfer-proof, 3.5g.',
    Pic_1: img('3', 1) }),

  r({ Id: '4', Title: 'Ceramic Ribbed Planter Set of 2', Category: 'Home', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example4', Price: '599', MRP: '899',
    Note: LONG_NOTE('These sit on my windowsill and somehow make every plant I put in them look ten times more expensive than it is.'),
    Description: 'Set of 2, 4in and 6in, drainage hole with tray, matte white.',
    Pic_1: img('4', 1), Pic_2: img('4', 2), Pic_3: img('4', 3) }),

  r({ Id: '5', Title: 'Everyday Chunky Sneakers', Category: 'Footwear', Platform: 'Ajio',
    Affiliate_Link: 'https://ajio.com/example5', Price: '1299', MRP: '2499', Badge: 'Bestseller',
    Note: LONG_NOTE('I wear these on every travel day now — they are the one shoe that has never once given me a blister on a long walk.'),
    Description: 'Chunky sole, breathable mesh upper, lace-up.',
    Pic_1: img('5', 1), Pic_2: img('5', 2) }),

  r({ Id: '6', Title: 'Layered Pearl Necklace', Category: 'Jewellery', Platform: 'Meesho',
    Affiliate_Link: 'https://meesho.com/example6', Price: '349', MRP: '799',
    Note: 'so pretty!', // deliberately short -> not indexable
    Description: 'Two-layer freshwater pearl finish, adjustable chain.',
    Pic_1: img('6', 1) }),

  r({ Id: '7', Title: 'Wireless Earbuds — ANC', Category: 'Electronics', Platform: 'Flipkart',
    Affiliate_Link: 'https://flipkart.com/example7', Price: '1799', MRP: '3499', Badge: 'Trending', Featured: 'true',
    Note: LONG_NOTE('The noise cancellation genuinely holds up on a crowded local train, and the battery has never once died on me mid-commute.'),
    Description: '30hr total playback, ANC, IPX4, USB-C fast charge.',
    Pic_1: img('7', 1), Pic_2: img('7', 2), Pic_3: img('7', 3), Pic_4: img('7', 4) }),

  r({ Id: '8', Title: 'Satin Slip Skirt', Category: 'Fashion', Platform: 'Myntra',
    Affiliate_Link: 'https://myntra.com/example8', Price: '899', MRP: '1799',
    Note: LONG_NOTE('It drapes so much better than the price suggests, and I have dressed it up and down more times than I can count already.'),
    Description: 'Bias-cut satin, midi length, elastic waistband.',
    Pic_1: img('8', 1), Pic_2: img('8', 2) }),

  r({ Id: '9', Title: 'Stainless Steel Lunch Box — 3 Compartment', Category: 'Kitchen', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example9', Price: '399', MRP: '699',
    Note: LONG_NOTE('It has survived daily use in my bag for months without a single leak, which is more than I can say for the last three I tried.'),
    Description: 'Leak-proof, insulated outer, 900ml total capacity.',
    Pic_1: img('9', 1) }),

  r({ Id: '10', Title: 'Rose Gold Cuff Bracelet', Category: 'Jewellery', Platform: 'Amazon',
    Affiliate_Link: 'https://amazon.in/dp/example10', Price: '249', MRP: '599', Status: 'Sold Out',
    Note: LONG_NOTE('This was one of my most-worn pieces this year, which is exactly why I am sad it is currently out of stock.'),
    Description: 'Adjustable open cuff, rose gold finish.',
    Pic_1: img('10', 1) }),

  r({ Id: '11', Title: 'Cotton Co-ord Set — Sage', Category: 'Fashion', Platform: 'Ajio',
    Affiliate_Link: 'https://ajio.com/example11', Price: '1099', MRP: '2199', Badge: 'New',
    Note: LONG_NOTE('It is the most comfortable thing in my closet and somehow still looks put-together enough to wear outside the house.'),
    Description: 'Breathable cotton blend, relaxed fit, pockets.',
    Pic_1: img('11', 1), Pic_2: img('11', 2), Pic_3: img('11', 3) }),

  r({ Id: '12', Title: 'Silk-Finish Hair Serum', Category: 'Beauty', Platform: 'Nykaa',
    Affiliate_Link: 'https://nykaa.com/example12', Price: '299', MRP: '499',
    Note: 'good smell', // short -> not indexable
    Description: 'Lightweight, non-greasy, 50ml.',
    Pic_1: img('12', 1) }),
];

// Beyond 12, the /shop grid switches on automatically — these round out
// categories and give search/filter/sort something real to work with.
const more: [string, string, string, string, string, string, string?][] = [
  ['13', 'Woven Straw Tote', 'Bags', 'Amazon', 'https://amazon.in/dp/example13', '549', '999'],
  ['14', 'Statement Drop Earrings', 'Jewellery', 'Meesho', 'https://meesho.com/example14', '199', '499'],
  ['15', 'Velvet Scrunchie Set of 6', 'Fashion', 'Amazon', 'https://amazon.in/dp/example15', '199', ''],
  ['16', 'Marble Coasters Set of 4', 'Home', 'Flipkart', 'https://flipkart.com/example16', '449', '799'],
  ['17', 'Tinted Lip Oil', 'Beauty', 'Nykaa', 'https://nykaa.com/example17', '399', '599'],
  ['18', 'Canvas Sling Bag', 'Bags', 'Myntra', 'https://myntra.com/example18', '699', '1399'],
  ['19', 'Espadrille Flats', 'Footwear', 'Ajio', 'https://ajio.com/example19', '899', '1599'],
  ['20', 'Non-Stick Dosa Tawa', 'Kitchen', 'Amazon', 'https://amazon.in/dp/example20', '799', '1199'],
  ['21', 'Charging Stand — 3-in-1', 'Electronics', 'Flipkart', 'https://flipkart.com/example21', '999', '1999'],
  ['22', 'Chiffon Printed Dupatta', 'Fashion', 'Meesho', 'https://meesho.com/example22', '249', '499'],
  ['23', 'Layered Anklet Set', 'Jewellery', 'Amazon', 'https://amazon.in/dp/example23', '179', '399'],
  ['24', 'Woven Table Runner', 'Home', 'Amazon', 'https://amazon.in/dp/example24', '349', '649'],
  ['25', 'Compact Setting Powder', 'Beauty', 'Nykaa', 'https://nykaa.com/example25', '299', ''],
  ['26', 'Quilted Crossbody Bag', 'Bags', 'Myntra', 'https://myntra.com/example26', '899', '1799'],
  ['27', 'Platform Block Heels', 'Footwear', 'Ajio', 'https://ajio.com/example27', '1199', '2299'],
  ['28', 'Insulated Water Bottle 1L', 'Kitchen', 'Amazon', 'https://amazon.in/dp/example28', '499', '899'],
  ['29', 'Wired Neckband — Bass+', 'Electronics', 'Amazon', 'https://amazon.in/dp/example29', '599', '1199'],
  ['30', 'Linen Blend Shirt Dress', 'Fashion', 'Myntra', 'https://myntra.com/example30', '1299', '2499'],
];

for (const [id, title, category, platform, link, price, mrp] of more) {
  rows.push(
    r({
      Id: id, Title: title, Category: category, Platform: platform, Affiliate_Link: link, Price: price, MRP: mrp ?? '',
      Note: LONG_NOTE(`One of my favourite recent finds — it photographs beautifully and has genuinely held up to daily use, which is the only test that matters to me.`),
      Description: `${title} — a small everyday find worth a second look.`,
      Pic_1: img(id, 1), Pic_2: img(id, 2),
    }),
  );
}

export const fixtureProductsGrid: ValueGrid = [productHeaders as unknown as string[], ...rows];

export const fixtureCategoriesGrid: ValueGrid = [
  ['Name', 'Slug', 'Order', 'Cover', 'Blurb', 'Featured'],
  ['Fashion', 'fashion', '1', img('cat-fashion', 1), 'Considered everyday fashion that photographs as well off-duty as it does in a Reel.', 'true'],
  ['Jewellery', 'jewellery', '2', img('cat-jewellery', 1), 'Everyday gold-tone and layered pieces that don’t look cheap up close.', 'true'],
  ['Beauty', 'beauty', '3', img('cat-beauty', 1), 'Products I have actually finished a bottle of, not just tried once.', 'true'],
  ['Bags', 'bags', '4', img('cat-bags', 1), 'Totes, slings and everyday carries built to survive a real commute.', 'true'],
  ['Home', 'home', '5', img('cat-home', 1), 'Small pieces that make a rented room feel considered.', 'false'],
  ['Kitchen', 'kitchen', '6', img('cat-kitchen', 1), 'Kitchen finds I reach for often enough to actually recommend.', 'false'],
  ['Footwear', 'footwear', '7', img('cat-footwear', 1), 'Shoes tested on real walking days, not just a photo.', 'false'],
  ['Electronics', 'electronics', '8', img('cat-electronics', 1), 'Small electronics that earned a permanent spot in my bag.', 'false'],
];

export const fixtureCollectionsGrid: ValueGrid = [
  ['Name', 'Slug', 'Product_Ids', 'Caption', 'Cover'],
  ['Today’s Reel Picks', 'todays-reel-picks', '1,2,7,11', 'Everything from today’s reel, in one place.', img('coll-reel', 1)],
  ['Diwali Edit', 'diwali-edit', '1,6,10,14,23', 'What I am actually wearing this Diwali.', img('coll-diwali', 1)],
];
