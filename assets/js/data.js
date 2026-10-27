/* ==========================================================================
   A Beautiful California Florist — data.js
   The catalogue is the client's own: assets/data/client-catalogue.js is
   loaded first and everything here is derived from window.ABC_CATALOGUE.
   Names, prices and descriptions are the client's published values.
   Size upcharges are SAMPLE figures and are flagged in the UI.
   Photography is licensed stock (Pexels) matched to each product's copy —
   the client's originals are pending.
   ========================================================================== */
window.BW = window.BW || {};

(function () {
  var CAT = window.ABC_CATALOGUE || { business: {}, products: [], occasions: [] };

  BW.business = CAT.business;
  BW.catalogue = CAT;

  /* ---- size tiers, taken from the catalogue, never hand-typed ---------- */
  var sample = (CAT.products && CAT.products[0]) || { sizes: ['Standard'], sampleSizeDeltas: [0] };
  var notes = [
    'The arrangement as photographed',
    'More stems, the same palette',
    'The fullest version we send'
  ];
  BW.SIZES = sample.sizes.map(function (label, i) {
    return {
      key: label.toLowerCase(),
      label: label,
      delta: (sample.sampleSizeDeltas && sample.sampleSizeDeltas[i]) || 0,
      desc: notes[i] || ''
    };
  });
  BW.DEFAULT_SIZE = BW.SIZES[0].key;

  /* ---- the curated twelve (a selection of the 17 verified products) ----

     Occasion tags are the client's own. Three of the twelve carry the shop's
     "Sympathy and Funeral" occasion as well: they were chosen because their
     published descriptions fit sympathy work (soft pink and white roses,
     hydrangea, orchid, "I'm thinking of you"), not because a name was invented.
     No product name, price or description is altered below.                */

  BW.PRODUCTS = [
 {
  "id": "autumn-blaze",
  "no": "01",
  "name": "Autumn Blaze",
  "price": 64.99,
  "occasions": [
   "autumn",
   "thanksgiving"
  ],
  "occasionsLabel": [
   "Autumn",
   "Thanksgiving"
  ],
  "tags": [
   "best seller"
  ],
  "blurb": "Ignite the spirit of the season with our \"Autumn Blaze\" Mixed Fall Flower Arrangement from A Beautiful California Florist in Long Beach!",
  "palette": "Coral · amber · cream",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/coral-bouquet-white.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "A coral and orange bouquet of seasonal blooms above a white table"
   },
   {
    "src": "assets/img/coral-ranunculus-held.jpg",
    "w": 1400,
    "h": 2100,
    "alt": "A hand holding a small coral ranunculus posy"
   },
   {
    "src": "assets/img/terracotta-bouquet-kraft.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Terracotta and peach roses wrapped in kraft paper"
   }
  ]
 },
 {
  "id": "belmont",
  "no": "02",
  "name": "Belmont",
  "price": 74.99,
  "occasions": [
   "birthday",
   "just because"
  ],
  "occasionsLabel": [
   "Birthday",
   "Just Because"
  ],
  "tags": [
   "best seller"
  ],
  "blurb": "Sure to brighten anyone's day and bring smiles, joy and laughter. This arrangement is a collection of bright roses, pastel flowering stalk and premium accent blooms, lush greens in a clear vase.",
  "palette": "Blush · cream · green",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/pink-cream-peonies-vase.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Pink and cream blooms arranged in a clear glass vase"
   },
   {
    "src": "assets/img/cream-peonies-wood.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Cream and cerise peonies on warm wood in soft light"
   },
   {
    "src": "assets/img/blush-roses-closeup.jpg",
    "w": 1400,
    "h": 933,
    "alt": "A close cluster of blush and white roses"
   }
  ]
 },
 {
  "id": "artisan-wrapped-bouquet",
  "no": "03",
  "name": "Artisan Wrapped Bouquet",
  "price": 76.99,
  "occasions": [
   "just because",
   "thank you"
  ],
  "occasionsLabel": [
   "Just Because",
   "Thank You"
  ],
  "tags": [
   "best seller"
  ],
  "blurb": "Beautifully wrapped assortment of colorful blooms chosen by our house Artisan/Florist will be made with todays fresh flowers delivered to us direct from the huge LA Flower Market.",
  "palette": "Market mix · kraft wrap",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/wrapped-bouquet-held.jpg",
    "w": 1400,
    "h": 2100,
    "alt": "A cream bouquet wrapped in paper and ribbon, held"
   },
   {
    "src": "assets/img/kraft-bundle-detail.jpg",
    "w": 1200,
    "h": 1800,
    "alt": "Detail of a kraft-wrapped bundle and its paper texture"
   },
   {
    "src": "assets/img/coral-ranunculus-held.jpg",
    "w": 1400,
    "h": 2100,
    "alt": "Coral ranunculus carried in a paper wrap"
   }
  ]
 },
 {
  "id": "the-emma",
  "no": "04",
  "name": "The Emma",
  "price": 79.99,
  "occasions": [
   "anniversary",
   "love and romance",
   "sympathy"
  ],
  "occasionsLabel": [
   "Anniversary",
   "Love & Romance",
   "Sympathy and Funeral"
  ],
  "tags": [],
  "blurb": "The Emma, a beautiful arrangement of pink roses, cymbidium orchid, hydrangea, verdant cremon, lisianthus and accented by lush wintergreens (which impart strength, vibrant health and luck in the New Year).",
  "palette": "Pink · white · wintergreen",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/blush-roses-white-wall.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "A soft pink bouquet held against a white wall"
   },
   {
    "src": "assets/img/blush-roses-closeup.jpg",
    "w": 1400,
    "h": 933,
    "alt": "Blush and white roses packed close"
   },
   {
    "src": "assets/img/mauve-peony-macro.jpg",
    "w": 1600,
    "h": 2844,
    "alt": "A single mauve peony photographed close"
   }
  ]
 },
 {
  "id": "autumn-pumpkin",
  "no": "05",
  "name": "Autumn Pumpkin",
  "price": 89.99,
  "occasions": [
   "autumn",
   "thanksgiving"
  ],
  "occasionsLabel": [
   "Autumn",
   "Thanksgiving"
  ],
  "tags": [
   "best seller"
  ],
  "blurb": "Bring the beauty of fall indoors with this stunning autumn floral arrangement, perfect for the fall season and Thanksgiving centerpieces. A variety of fresh fall flowers are artfully arranged in a charming 7-inch ceramic pumpkin container.",
  "palette": "Terracotta · amber · russet",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/terracotta-bouquet-kraft.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Terracotta, lilac and apricot blooms gathered in a warm vessel"
   },
   {
    "src": "assets/img/coral-bouquet-white.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Coral and amber seasonal blooms"
   },
   {
    "src": "assets/img/kraft-bundle-detail.jpg",
    "w": 1200,
    "h": 1800,
    "alt": "Kraft paper tied around a seasonal bundle"
   }
  ]
 },
 {
  "id": "lovely-you",
  "no": "06",
  "name": "Lovely You",
  "price": 97.0,
  "occasions": [
   "love and romance",
   "anniversary"
  ],
  "occasionsLabel": [
   "Love & Romance",
   "Anniversary"
  ],
  "tags": [
   "best seller"
  ],
  "blurb": "Large size lush mix of pink lilies, red roses, and tall snapdragons in a pink textured glass vase, fuller height and volume with more flowers added.",
  "palette": "Pink · red · snapdragon",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/hero-blush-peonies-in-arms.jpg",
    "w": 2000,
    "h": 2667,
    "alt": "An armful of blush peonies held in soft daylight"
   },
   {
    "src": "assets/img/blush-roses-white-wall.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "A tall pink bouquet held upright"
   },
   {
    "src": "assets/img/mauve-peony-macro.jpg",
    "w": 1600,
    "h": 2844,
    "alt": "Macro detail of a mauve peony's petals"
   }
  ]
 },
 {
  "id": "autumn-shades",
  "no": "07",
  "name": "Autumn Shades",
  "price": 99.99,
  "occasions": [
   "autumn"
  ],
  "occasionsLabel": [
   "Autumn"
  ],
  "tags": [],
  "blurb": "The change of seasons is upon us. Autumn Shades in fall colors and textures burst forth in this beautiful Fall arrangement.",
  "palette": "Coral · russet · gold",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/coral-ranunculus-white.jpg",
    "w": 1600,
    "h": 1067,
    "alt": "Coral and red blooms photographed on white"
   },
   {
    "src": "assets/img/terracotta-bouquet-kraft.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Terracotta roses wrapped in kraft paper"
   },
   {
    "src": "assets/img/coral-bouquet-white.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "A warm coral and orange bouquet"
   }
  ]
 },
 {
  "id": "box-of-autumn",
  "no": "08",
  "name": "Box of Autumn",
  "price": 99.99,
  "occasions": [
   "autumn",
   "thank you"
  ],
  "occasionsLabel": [
   "Autumn",
   "Thank You"
  ],
  "tags": [],
  "blurb": "Wouldn’t life be more convenient if seasons came in boxes? We already have boxed wine, boxed lunches, and boxing matches. Seasons need to catch up. Now they have. Introducing the Box of Autumn.",
  "palette": "Autumn mix · kraft box",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/kraft-bundle-detail.jpg",
    "w": 1200,
    "h": 1800,
    "alt": "A kraft box of cream and gold blooms"
   },
   {
    "src": "assets/img/wrapped-bouquet-held.jpg",
    "w": 1400,
    "h": 2100,
    "alt": "A wrapped seasonal bouquet held"
   },
   {
    "src": "assets/img/terracotta-bouquet-kraft.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Terracotta roses in a kraft box"
   }
  ]
 },
 {
  "id": "long-beach-charms",
  "no": "09",
  "name": "Long Beach Charms",
  "price": 129.0,
  "occasions": [
   "love and romance",
   "birthday",
   "sympathy"
  ],
  "occasionsLabel": [
   "Love & Romance",
   "Birthday",
   "Sympathy and Funeral"
  ],
  "tags": [],
  "blurb": "A cluster of soft pink roses and pale pink alstroemeria creates a romantic, gently textured centerpiece perfect for a birthday bouquet, mother's day gift, anniversary flowers, or a thoughtful \"I'm thinking of you\" gift.",
  "palette": "Soft pink · pale pink",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/blush-berries-bowls.jpg",
    "w": 1200,
    "h": 1600,
    "alt": "Bowls of soft blush blooms in warm cloth"
   },
   {
    "src": "assets/img/blush-roses-closeup.jpg",
    "w": 1400,
    "h": 933,
    "alt": "Soft pink and white roses packed close"
   },
   {
    "src": "assets/img/pink-cream-peonies-vase.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Pink blooms in a clear glass vase"
   }
  ]
 },
 {
  "id": "wonderful-world",
  "no": "10",
  "name": "Wonderful World",
  "price": 129.99,
  "occasions": [
   "congrats",
   "thank you"
  ],
  "occasionsLabel": [
   "Congrats",
   "Thank You"
  ],
  "tags": [],
  "blurb": "\"The colors of the rainbow So pretty in the sky Are also on the faces Of people going by I see friends shaking hands, saying, \"How do you do?\" They're really saying, \"I love you\" \" - Louis Armstrong Wonderful World is an arrangement of…",
  "palette": "Cream · cerise · violet",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/cream-peonies-wood.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "A multicolour mix of cream, pink and cerise peonies in a vase"
   },
   {
    "src": "assets/img/white-ranunculus-dark.jpg",
    "w": 1600,
    "h": 1067,
    "alt": "White ranunculus against a dark ground"
   },
   {
    "src": "assets/img/pink-cream-peonies-vase.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "Pink and cream blooms in a glass vase"
   }
  ]
 },
 {
  "id": "enchanting",
  "no": "11",
  "name": "Enchanting",
  "price": 144.99,
  "occasions": [
   "love and romance",
   "anniversary"
  ],
  "occasionsLabel": [
   "Love & Romance",
   "Anniversary"
  ],
  "tags": [],
  "blurb": "Vivid red roses paired with soft pink lilies create a romantic, celebratory bouquet made to make the person you're thinking of feel deeply adored.",
  "palette": "Vivid red · blush pink",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/crimson-ranunculus-field.jpg",
    "w": 2200,
    "h": 3300,
    "alt": "Deep red blooms photographed in saturated light"
   },
   {
    "src": "assets/img/burgundy-dahlia-dark.jpg",
    "w": 1600,
    "h": 2845,
    "alt": "A burgundy dahlia in a dark vase, low key"
   },
   {
    "src": "assets/img/mauve-peony-macro.jpg",
    "w": 1600,
    "h": 2844,
    "alt": "A mauve peony opening, petal edges lit"
   }
  ]
 },
 {
  "id": "lush-life",
  "no": "12",
  "name": "Lush Life",
  "price": 179.99,
  "occasions": [
   "just because",
   "get well",
   "sympathy"
  ],
  "occasionsLabel": [
   "Just Because",
   "Get Well",
   "Sympathy and Funeral"
  ],
  "tags": [],
  "blurb": "Lush Life This is a low and lush floral arrangement of pink and white roses, hydrangeas, orchids, and succulents. Arranged in a 6\" clear cylinder vase, overall size is 13\" T x 13\" W.",
  "palette": "Ivory · pink · hydrangea",
  "sourceUrl": "",
  "gallery": [
   {
    "src": "assets/img/white-hydrangea-wooden-bowl.jpg",
    "w": 1600,
    "h": 2133,
    "alt": "White hydrangeas arranged low in a wooden bowl"
   },
   {
    "src": "assets/img/white-peonies-greenery.jpg",
    "w": 1600,
    "h": 2400,
    "alt": "White blooms with green stems in bright light"
   },
   {
    "src": "assets/img/white-bloom-dark-water.jpg",
    "w": 2000,
    "h": 1333,
    "alt": "A single white bloom floating on dark water"
   }
  ]
 }
];

  /* ---- helpers --------------------------------------------------------- */
  BW.byId = function (id) {
    for (var i = 0; i < BW.PRODUCTS.length; i++) {
      if (BW.PRODUCTS[i].id === id) return BW.PRODUCTS[i];
    }
    return null;
  };

  BW.sizeByKey = function (key) {
    for (var i = 0; i < BW.SIZES.length; i++) {
      if (BW.SIZES[i].key === key) return BW.SIZES[i];
    }
    return BW.SIZES[0];
  };

  /* price = the client's published base price + the sample size delta */
  BW.priceFor = function (product, sizeKey) {
    var size = BW.sizeByKey(sizeKey);
    var base = product && typeof product.price === 'number' ? product.price : 0;
    return Math.round((base + size.delta) * 100) / 100;
  };

  BW.money = function (n) {
    var v = typeof n === 'number' ? n : parseFloat(n) || 0;
    return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  BW.occasionLabel = function (key) {
    for (var i = 0; i < BW.PRODUCTS.length; i++) {
      var p = BW.PRODUCTS[i];
      for (var j = 0; j < p.occasions.length; j++) {
        if (p.occasions[j] === key) return p.occasionsLabel[j];
      }
    }
    return key;
  };

  /* ---- responsive imagery ----------------------------------------------
     The masters in assets/img/_master are 3000px and are NOT shipped. The
     pre-encoded variants in assets/img/resp are what the page loads:
       {base}-800.webp | -1600.webp | -2560.webp | -3000.webp | -1600.jpg
     Two masters top out below 3000px, so their width lists stop at 1600 —
     srcset never points at a file that does not exist.
     ------------------------------------------------------------------- */
  var RESP_FULL = [800, 1600, 2560, 3000];
  var RESP_SHORT = [800, 1600];
  var SHORT_BASES = { 'burgundy-dahlia-dark': 1, 'mauve-peony-macro': 1 };

  /* accepts both assets/img/foo.jpg and assets/img/resp/foo-1600.webp */
  function baseOf(src) {
    var m = /assets\/img\/(?:resp\/)?([a-z0-9-]+?)(?:-\d{3,4})?\.(?:jpe?g|webp)$/i.exec(String(src || ''));
    return m ? m[1] : null;
  }
  function widthsFor(base) { return SHORT_BASES[base] ? RESP_SHORT : RESP_FULL; }
  function respUrl(base, w, fmt) { return 'assets/img/resp/' + base + '-' + w + '.' + fmt; }
  function srcsetFor(base, list, fmt) {
    return list.map(function (w) { return respUrl(base, w, fmt) + ' ' + w + 'w'; }).join(', ');
  }
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  BW.imgBase = baseOf;

  /* the widest variant that exists — lightbox and modal stage */
  BW.fullSrc = function (img) {
    var base = baseOf(img && img.src);
    if (!base) return (img && img.src) || '';
    var list = widthsFor(base);
    var widest = list[list.length - 1];
    return respUrl(base, widest >= 2560 ? 2560 : widest, 'webp');
  };

  /* small variant for drawer line items and modal thumbnails */
  BW.thumbSrc = function (img) {
    var base = baseOf(img && img.src);
    return base ? respUrl(base, 800, 'webp') : ((img && img.src) || '');
  };

  /* <picture>: WebP srcset across the widths that exist, JPEG fallback in the
     img. The img keeps its own class, width/height and alt, so every existing
     CSS rule, the parallax layer and the FLIP lightbox still target it. */
  BW.picture = function (img, opts) {
    opts = opts || {};
    var base = baseOf(img.src);
    var attrs = '';
    if (opts.cls) attrs += ' class="' + escAttr(opts.cls) + '"';
    attrs += ' width="' + (img.w || 1600) + '" height="' + (img.h || 2133) + '"';
    attrs += ' alt="' + escAttr(img.alt || '') + '"';
    attrs += opts.priority
      ? ' fetchpriority="high"'
      : ' loading="' + (opts.loading || 'lazy') + '" decoding="async"';
    if (opts.extra) attrs += ' ' + opts.extra;

    if (!base) return '<img src="' + escAttr(img.src) + '"' + attrs + '>';

    var list = widthsFor(base);
    return '<picture>' +
      '<source type="image/webp" srcset="' + srcsetFor(base, list, 'webp') +
        '" sizes="' + escAttr(opts.sizes || '100vw') + '">' +
      '<img' + attrs + ' src="' + respUrl(base, 1600, 'jpg') + '">' +
      '</picture>';
  };

  /* Repaint an existing <picture>-wrapped <img> after the JS swaps the
     photograph (modal stage, lightbox, rail hover preview). Both the <source>
     ladder and the JPEG fallback have to move, otherwise the browser keeps
     painting the previously selected candidate. */
  BW.repaint = function (img, src, opts) {
    opts = opts || {};
    if (!img) return;
    var base = baseOf(src || img.src);
    if (!base) return;
    var list = widthsFor(base);
    var pic = img.closest ? img.closest('picture') : null;
    var source = pic ? pic.querySelector('source[type="image/webp"]') : null;
    if (source) {
      source.setAttribute('srcset', srcsetFor(base, list, 'webp'));
      source.setAttribute('sizes', opts.sizes || source.getAttribute('sizes') || '100vw');
    } else {
      img.setAttribute('srcset', srcsetFor(base, list, 'webp'));
      img.setAttribute('sizes', opts.sizes || '100vw');
    }
    img.setAttribute('src', respUrl(base, 1600, 'jpg'));
    if (opts.width) img.setAttribute('width', opts.width);
    if (opts.height) img.setAttribute('height', opts.height);
  };

  BW.imgPath = function (p) { return p.src; };
})();
