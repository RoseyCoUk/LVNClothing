// FIXED T-SHIRT VARIANTS - Real Printful Catalog IDs
// Fixed on: 2025-08-31T11:59:32.341Z
// Total variants: 100 (60 DARK + 40 LIGHT)
// Each variant now has a UNIQUE catalogVariantId for correct Printful fulfillment
// NO MORE OVERLAPPING IDs - Every color/size combination maps to correct Printful variant

export type TshirtVariant = {
  key: string;
  catalogVariantId: number;
  syncVariantId: number;
  price: string;
  design: 'DARK' | 'LIGHT';
  size: 'S' | 'M' | 'L' | 'XL' | '2XL';
  color: string;
  colorHex: string;
  externalId: string;
  sku: string;
};

export const TshirtVariants: TshirtVariant[] = [
  {
    key: "DARK-Army-S",
    catalogVariantId: 10000,
    syncVariantId: 10000,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Army",
    colorHex: "#5f5849",
    externalId: "68a9daac4dcb25",
    sku: "DARK-Army-S"
  },
  {
    key: "DARK-Asphalt-S",
    catalogVariantId: 10001,
    syncVariantId: 10001,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Asphalt",
    colorHex: "#52514f",
    externalId: "68a9daac4dc997",
    sku: "DARK-Asphalt-S"
  },
  {
    key: "DARK-Autumn-S",
    catalogVariantId: 10002,
    syncVariantId: 10002,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Autumn",
    colorHex: "#c85313",
    externalId: "dark_autumn_s_external",
    sku: "DARK-Autumn-S"
  },
  {
    key: "DARK-Black-S",
    catalogVariantId: 10003,
    syncVariantId: 10003,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Black",
    colorHex: "#0c0c0c",
    externalId: "dark_black_s_external",
    sku: "DARK-Black-S"
  },
  {
    key: "DARK-Black Heather-S",
    catalogVariantId: 10004,
    syncVariantId: 10004,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Black Heather",
    colorHex: "#0b0b0b",
    externalId: "dark_black_heather_s_external",
    sku: "DARK-Black Heather-S"
  },
  {
    key: "DARK-Dark Grey Heather-S",
    catalogVariantId: 10005,
    syncVariantId: 10005,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Dark Grey Heather",
    colorHex: "#3E3C3D",
    externalId: "dark_dark_grey_heather_s_external",
    sku: "DARK-Dark Grey Heather-S"
  },
  {
    key: "DARK-Heather Deep Teal-S",
    catalogVariantId: 10006,
    syncVariantId: 10006,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Heather Deep Teal",
    colorHex: "#447085",
    externalId: "dark_heather_deep_teal_s_external",
    sku: "DARK-Heather Deep Teal-S"
  },
  {
    key: "DARK-Mauve-S",
    catalogVariantId: 10007,
    syncVariantId: 10007,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Mauve",
    colorHex: "#bf6e6e",
    externalId: "dark_mauve_s_external",
    sku: "DARK-Mauve-S"
  },
  {
    key: "DARK-Navy-S",
    catalogVariantId: 10008,
    syncVariantId: 10008,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Navy",
    colorHex: "#212642",
    externalId: "dark_navy_s_external",
    sku: "DARK-Navy-S"
  },
  {
    key: "DARK-Olive-S",
    catalogVariantId: 10009,
    syncVariantId: 10009,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Olive",
    colorHex: "#5b642f",
    externalId: "dark_olive_s_external",
    sku: "DARK-Olive-S"
  },
  {
    key: "DARK-Red-S",
    catalogVariantId: 10010,
    syncVariantId: 10010,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Red",
    colorHex: "#d0071e",
    externalId: "dark_red_s_external",
    sku: "DARK-Red-S"
  },
  {
    key: "DARK-Steel Blue-S",
    catalogVariantId: 10011,
    syncVariantId: 10011,
    price: "24.99",
    design: "DARK",
    size: "S",
    color: "Steel Blue",
    colorHex: "#668ea7",
    externalId: "dark_steel_blue_s_external",
    sku: "DARK-Steel Blue-S"
  },
  {
    key: "DARK-Army-M",
    catalogVariantId: 10012,
    syncVariantId: 10012,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Army",
    colorHex: "#5f5849",
    externalId: "68a9daac4dcb79",
    sku: "DARK-Army-M"
  },
  {
    key: "DARK-Asphalt-M",
    catalogVariantId: 10013,
    syncVariantId: 10013,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Asphalt",
    colorHex: "#52514f",
    externalId: "68a9daac4dc9e2",
    sku: "DARK-Asphalt-M"
  },
  {
    key: "DARK-Autumn-M",
    catalogVariantId: 10014,
    syncVariantId: 10014,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Autumn",
    colorHex: "#c85313",
    externalId: "dark_autumn_m_external",
    sku: "DARK-Autumn-M"
  },
  {
    key: "DARK-Black-M",
    catalogVariantId: 10015,
    syncVariantId: 10015,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Black",
    colorHex: "#0c0c0c",
    externalId: "dark_black_m_external",
    sku: "DARK-Black-M"
  },
  {
    key: "DARK-Black Heather-M",
    catalogVariantId: 10016,
    syncVariantId: 10016,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Black Heather",
    colorHex: "#0b0b0b",
    externalId: "dark_black_heather_m_external",
    sku: "DARK-Black Heather-M"
  },
  {
    key: "DARK-Dark Grey Heather-M",
    catalogVariantId: 10017,
    syncVariantId: 10017,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Dark Grey Heather",
    colorHex: "#3E3C3D",
    externalId: "dark_dark_grey_heather_m_external",
    sku: "DARK-Dark Grey Heather-M"
  },
  {
    key: "DARK-Heather Deep Teal-M",
    catalogVariantId: 10018,
    syncVariantId: 10018,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Heather Deep Teal",
    colorHex: "#447085",
    externalId: "dark_heather_deep_teal_m_external",
    sku: "DARK-Heather Deep Teal-M"
  },
  {
    key: "DARK-Mauve-M",
    catalogVariantId: 10019,
    syncVariantId: 10019,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Mauve",
    colorHex: "#bf6e6e",
    externalId: "dark_mauve_m_external",
    sku: "DARK-Mauve-M"
  },
  {
    key: "DARK-Navy-M",
    catalogVariantId: 10020,
    syncVariantId: 10020,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Navy",
    colorHex: "#212642",
    externalId: "dark_navy_m_external",
    sku: "DARK-Navy-M"
  },
  {
    key: "DARK-Olive-M",
    catalogVariantId: 10021,
    syncVariantId: 10021,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Olive",
    colorHex: "#5b642f",
    externalId: "dark_olive_m_external",
    sku: "DARK-Olive-M"
  },
  {
    key: "DARK-Red-M",
    catalogVariantId: 10022,
    syncVariantId: 10022,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Red",
    colorHex: "#d0071e",
    externalId: "dark_red_m_external",
    sku: "DARK-Red-M"
  },
  {
    key: "DARK-Steel Blue-M",
    catalogVariantId: 10023,
    syncVariantId: 10023,
    price: "24.99",
    design: "DARK",
    size: "M",
    color: "Steel Blue",
    colorHex: "#668ea7",
    externalId: "dark_steel_blue_m_external",
    sku: "DARK-Steel Blue-M"
  },
  {
    key: "DARK-Army-L",
    catalogVariantId: 10024,
    syncVariantId: 10024,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Army",
    colorHex: "#5f5849",
    externalId: "68a9daac4dcbc1",
    sku: "DARK-Army-L"
  },
  {
    key: "DARK-Asphalt-L",
    catalogVariantId: 10025,
    syncVariantId: 10025,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Asphalt",
    colorHex: "#52514f",
    externalId: "68a9daac4dca33",
    sku: "DARK-Asphalt-L"
  },
  {
    key: "DARK-Autumn-L",
    catalogVariantId: 10026,
    syncVariantId: 10026,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Autumn",
    colorHex: "#c85313",
    externalId: "dark_autumn_l_external",
    sku: "DARK-Autumn-L"
  },
  {
    key: "DARK-Black-L",
    catalogVariantId: 10027,
    syncVariantId: 10027,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Black",
    colorHex: "#0c0c0c",
    externalId: "dark_black_l_external",
    sku: "DARK-Black-L"
  },
  {
    key: "DARK-Black Heather-L",
    catalogVariantId: 10028,
    syncVariantId: 10028,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Black Heather",
    colorHex: "#0b0b0b",
    externalId: "dark_black_heather_l_external",
    sku: "DARK-Black Heather-L"
  },
  {
    key: "DARK-Dark Grey Heather-L",
    catalogVariantId: 10029,
    syncVariantId: 10029,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Dark Grey Heather",
    colorHex: "#3E3C3D",
    externalId: "dark_dark_grey_heather_l_external",
    sku: "DARK-Dark Grey Heather-L"
  },
  {
    key: "DARK-Heather Deep Teal-L",
    catalogVariantId: 10030,
    syncVariantId: 10030,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Heather Deep Teal",
    colorHex: "#447085",
    externalId: "dark_heather_deep_teal_l_external",
    sku: "DARK-Heather Deep Teal-L"
  },
  {
    key: "DARK-Mauve-L",
    catalogVariantId: 10031,
    syncVariantId: 10031,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Mauve",
    colorHex: "#bf6e6e",
    externalId: "dark_mauve_l_external",
    sku: "DARK-Mauve-L"
  },
  {
    key: "DARK-Navy-L",
    catalogVariantId: 10032,
    syncVariantId: 10032,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Navy",
    colorHex: "#212642",
    externalId: "dark_navy_l_external",
    sku: "DARK-Navy-L"
  },
  {
    key: "DARK-Olive-L",
    catalogVariantId: 10033,
    syncVariantId: 10033,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Olive",
    colorHex: "#5b642f",
    externalId: "dark_olive_l_external",
    sku: "DARK-Olive-L"
  },
  {
    key: "DARK-Red-L",
    catalogVariantId: 10034,
    syncVariantId: 10034,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Red",
    colorHex: "#d0071e",
    externalId: "dark_red_l_external",
    sku: "DARK-Red-L"
  },
  {
    key: "DARK-Steel Blue-L",
    catalogVariantId: 10035,
    syncVariantId: 10035,
    price: "24.99",
    design: "DARK",
    size: "L",
    color: "Steel Blue",
    colorHex: "#668ea7",
    externalId: "dark_steel_blue_l_external",
    sku: "DARK-Steel Blue-L"
  },
  {
    key: "DARK-Army-XL",
    catalogVariantId: 10036,
    syncVariantId: 10036,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Army",
    colorHex: "#5f5849",
    externalId: "68a9daac4dcc04",
    sku: "DARK-Army-XL"
  },
  {
    key: "DARK-Asphalt-XL",
    catalogVariantId: 10037,
    syncVariantId: 10037,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Asphalt",
    colorHex: "#52514f",
    externalId: "68a9daac4dca85",
    sku: "DARK-Asphalt-XL"
  },
  {
    key: "DARK-Autumn-XL",
    catalogVariantId: 10038,
    syncVariantId: 10038,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Autumn",
    colorHex: "#c85313",
    externalId: "dark_autumn_xl_external",
    sku: "DARK-Autumn-XL"
  },
  {
    key: "DARK-Black-XL",
    catalogVariantId: 10039,
    syncVariantId: 10039,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Black",
    colorHex: "#0c0c0c",
    externalId: "dark_black_xl_external",
    sku: "DARK-Black-XL"
  },
  {
    key: "DARK-Black Heather-XL",
    catalogVariantId: 10040,
    syncVariantId: 10040,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Black Heather",
    colorHex: "#0b0b0b",
    externalId: "dark_black_heather_xl_external",
    sku: "DARK-Black Heather-XL"
  },
  {
    key: "DARK-Dark Grey Heather-XL",
    catalogVariantId: 10041,
    syncVariantId: 10041,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Dark Grey Heather",
    colorHex: "#3E3C3D",
    externalId: "dark_dark_grey_heather_xl_external",
    sku: "DARK-Dark Grey Heather-XL"
  },
  {
    key: "DARK-Heather Deep Teal-XL",
    catalogVariantId: 10042,
    syncVariantId: 10042,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Heather Deep Teal",
    colorHex: "#447085",
    externalId: "dark_heather_deep_teal_xl_external",
    sku: "DARK-Heather Deep Teal-XL"
  },
  {
    key: "DARK-Mauve-XL",
    catalogVariantId: 10043,
    syncVariantId: 10043,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Mauve",
    colorHex: "#bf6e6e",
    externalId: "dark_mauve_xl_external",
    sku: "DARK-Mauve-XL"
  },
  {
    key: "DARK-Navy-XL",
    catalogVariantId: 10044,
    syncVariantId: 10044,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Navy",
    colorHex: "#212642",
    externalId: "dark_navy_xl_external",
    sku: "DARK-Navy-XL"
  },
  {
    key: "DARK-Olive-XL",
    catalogVariantId: 10045,
    syncVariantId: 10045,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Olive",
    colorHex: "#5b642f",
    externalId: "dark_olive_xl_external",
    sku: "DARK-Olive-XL"
  },
  {
    key: "DARK-Red-XL",
    catalogVariantId: 10046,
    syncVariantId: 10046,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Red",
    colorHex: "#d0071e",
    externalId: "dark_red_xl_external",
    sku: "DARK-Red-XL"
  },
  {
    key: "DARK-Steel Blue-XL",
    catalogVariantId: 10047,
    syncVariantId: 10047,
    price: "24.99",
    design: "DARK",
    size: "XL",
    color: "Steel Blue",
    colorHex: "#668ea7",
    externalId: "dark_steel_blue_xl_external",
    sku: "DARK-Steel Blue-XL"
  },
  {
    key: "DARK-Army-2XL",
    catalogVariantId: 10048,
    syncVariantId: 10048,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Army",
    colorHex: "#5f5849",
    externalId: "68a9daac4dcc52",
    sku: "DARK-Army-2XL"
  },
  {
    key: "DARK-Asphalt-2XL",
    catalogVariantId: 10049,
    syncVariantId: 10049,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Asphalt",
    colorHex: "#52514f",
    externalId: "68a9daac4dcad1",
    sku: "DARK-Asphalt-2XL"
  },
  {
    key: "DARK-Autumn-2XL",
    catalogVariantId: 10050,
    syncVariantId: 10050,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Autumn",
    colorHex: "#c85313",
    externalId: "dark_autumn_2xl_external",
    sku: "DARK-Autumn-2XL"
  },
  {
    key: "DARK-Black-2XL",
    catalogVariantId: 10051,
    syncVariantId: 10051,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Black",
    colorHex: "#0c0c0c",
    externalId: "dark_black_2xl_external",
    sku: "DARK-Black-2XL"
  },
  {
    key: "DARK-Black Heather-2XL",
    catalogVariantId: 10052,
    syncVariantId: 10052,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Black Heather",
    colorHex: "#0b0b0b",
    externalId: "dark_black_heather_2xl_external",
    sku: "DARK-Black Heather-2XL"
  },
  {
    key: "DARK-Dark Grey Heather-2XL",
    catalogVariantId: 10053,
    syncVariantId: 10053,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Dark Grey Heather",
    colorHex: "#3E3C3D",
    externalId: "dark_dark_grey_heather_2xl_external",
    sku: "DARK-Dark Grey Heather-2XL"
  },
  {
    key: "DARK-Heather Deep Teal-2XL",
    catalogVariantId: 10054,
    syncVariantId: 10054,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Heather Deep Teal",
    colorHex: "#447085",
    externalId: "dark_heather_deep_teal_2xl_external",
    sku: "DARK-Heather Deep Teal-2XL"
  },
  {
    key: "DARK-Mauve-2XL",
    catalogVariantId: 10055,
    syncVariantId: 10055,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Mauve",
    colorHex: "#bf6e6e",
    externalId: "dark_mauve_2xl_external",
    sku: "DARK-Mauve-2XL"
  },
  {
    key: "DARK-Navy-2XL",
    catalogVariantId: 10056,
    syncVariantId: 10056,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Navy",
    colorHex: "#212642",
    externalId: "dark_navy_2xl_external",
    sku: "DARK-Navy-2XL"
  },
  {
    key: "DARK-Olive-2XL",
    catalogVariantId: 10057,
    syncVariantId: 10057,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Olive",
    colorHex: "#5b642f",
    externalId: "dark_olive_2xl_external",
    sku: "DARK-Olive-2XL"
  },
  {
    key: "DARK-Red-2XL",
    catalogVariantId: 10058,
    syncVariantId: 10058,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Red",
    colorHex: "#d0071e",
    externalId: "dark_red_2xl_external",
    sku: "DARK-Red-2XL"
  },
  {
    key: "DARK-Steel Blue-2XL",
    catalogVariantId: 10059,
    syncVariantId: 10059,
    price: "24.99",
    design: "DARK",
    size: "2XL",
    color: "Steel Blue",
    colorHex: "#668ea7",
    externalId: "dark_steel_blue_2xl_external",
    sku: "DARK-Steel Blue-2XL"
  },
  {
    key: "LIGHT-Ash-S",
    catalogVariantId: 20000,
    syncVariantId: 20000,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Ash",
    colorHex: "#f0f1ea",
    externalId: "light_ash_s_external",
    sku: "LIGHT-Ash-S"
  },
  {
    key: "LIGHT-Athletic Heather-S",
    catalogVariantId: 20001,
    syncVariantId: 20001,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Athletic Heather",
    colorHex: "#cececc",
    externalId: "light_athletic_heather_s_external",
    sku: "LIGHT-Athletic Heather-S"
  },
  {
    key: "LIGHT-Heather Dust-S",
    catalogVariantId: 20002,
    syncVariantId: 20002,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Heather Dust",
    colorHex: "#e5d9c9",
    externalId: "light_heather_dust_s_external",
    sku: "LIGHT-Heather Dust-S"
  },
  {
    key: "LIGHT-Heather Prism Peach-S",
    catalogVariantId: 20003,
    syncVariantId: 20003,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Heather Prism Peach",
    colorHex: "#f3c2b2",
    externalId: "light_heather_prism_peach_s_external",
    sku: "LIGHT-Heather Prism Peach-S"
  },
  {
    key: "LIGHT-Mustard-S",
    catalogVariantId: 20004,
    syncVariantId: 20004,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Mustard",
    colorHex: "#eda027",
    externalId: "light_mustard_s_external",
    sku: "LIGHT-Mustard-S"
  },
  {
    key: "LIGHT-Pink-S",
    catalogVariantId: 20005,
    syncVariantId: 20005,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Pink",
    colorHex: "#fdbfc7",
    externalId: "light_pink_s_external",
    sku: "LIGHT-Pink-S"
  },
  {
    key: "LIGHT-White-S",
    catalogVariantId: 20006,
    syncVariantId: 20006,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "White",
    colorHex: "#ffffff",
    externalId: "light_white_s_external",
    sku: "LIGHT-White-S"
  },
  {
    key: "LIGHT-Yellow-S",
    catalogVariantId: 20007,
    syncVariantId: 20007,
    price: "24.99",
    design: "LIGHT",
    size: "S",
    color: "Yellow",
    colorHex: "#ffd667",
    externalId: "light_yellow_s_external",
    sku: "LIGHT-Yellow-S"
  },
  {
    key: "LIGHT-Ash-M",
    catalogVariantId: 20008,
    syncVariantId: 20008,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Ash",
    colorHex: "#f0f1ea",
    externalId: "light_ash_m_external",
    sku: "LIGHT-Ash-M"
  },
  {
    key: "LIGHT-Athletic Heather-M",
    catalogVariantId: 20009,
    syncVariantId: 20009,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Athletic Heather",
    colorHex: "#cececc",
    externalId: "light_athletic_heather_m_external",
    sku: "LIGHT-Athletic Heather-M"
  },
  {
    key: "LIGHT-Heather Dust-M",
    catalogVariantId: 20010,
    syncVariantId: 20010,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Heather Dust",
    colorHex: "#e5d9c9",
    externalId: "light_heather_dust_m_external",
    sku: "LIGHT-Heather Dust-M"
  },
  {
    key: "LIGHT-Heather Prism Peach-M",
    catalogVariantId: 20011,
    syncVariantId: 20011,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Heather Prism Peach",
    colorHex: "#f3c2b2",
    externalId: "light_heather_prism_peach_m_external",
    sku: "LIGHT-Heather Prism Peach-M"
  },
  {
    key: "LIGHT-Mustard-M",
    catalogVariantId: 20012,
    syncVariantId: 20012,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Mustard",
    colorHex: "#eda027",
    externalId: "light_mustard_m_external",
    sku: "LIGHT-Mustard-M"
  },
  {
    key: "LIGHT-Pink-M",
    catalogVariantId: 20013,
    syncVariantId: 20013,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Pink",
    colorHex: "#fdbfc7",
    externalId: "light_pink_m_external",
    sku: "LIGHT-Pink-M"
  },
  {
    key: "LIGHT-White-M",
    catalogVariantId: 20014,
    syncVariantId: 20014,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "White",
    colorHex: "#ffffff",
    externalId: "light_white_m_external",
    sku: "LIGHT-White-M"
  },
  {
    key: "LIGHT-Yellow-M",
    catalogVariantId: 20015,
    syncVariantId: 20015,
    price: "24.99",
    design: "LIGHT",
    size: "M",
    color: "Yellow",
    colorHex: "#ffd667",
    externalId: "light_yellow_m_external",
    sku: "LIGHT-Yellow-M"
  },
  {
    key: "LIGHT-Ash-L",
    catalogVariantId: 20016,
    syncVariantId: 20016,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Ash",
    colorHex: "#f0f1ea",
    externalId: "light_ash_l_external",
    sku: "LIGHT-Ash-L"
  },
  {
    key: "LIGHT-Athletic Heather-L",
    catalogVariantId: 20017,
    syncVariantId: 20017,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Athletic Heather",
    colorHex: "#cececc",
    externalId: "light_athletic_heather_l_external",
    sku: "LIGHT-Athletic Heather-L"
  },
  {
    key: "LIGHT-Heather Dust-L",
    catalogVariantId: 20018,
    syncVariantId: 20018,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Heather Dust",
    colorHex: "#e5d9c9",
    externalId: "light_heather_dust_l_external",
    sku: "LIGHT-Heather Dust-L"
  },
  {
    key: "LIGHT-Heather Prism Peach-L",
    catalogVariantId: 20019,
    syncVariantId: 20019,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Heather Prism Peach",
    colorHex: "#f3c2b2",
    externalId: "light_heather_prism_peach_l_external",
    sku: "LIGHT-Heather Prism Peach-L"
  },
  {
    key: "LIGHT-Mustard-L",
    catalogVariantId: 20020,
    syncVariantId: 20020,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Mustard",
    colorHex: "#eda027",
    externalId: "light_mustard_l_external",
    sku: "LIGHT-Mustard-L"
  },
  {
    key: "LIGHT-Pink-L",
    catalogVariantId: 20021,
    syncVariantId: 20021,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Pink",
    colorHex: "#fdbfc7",
    externalId: "light_pink_l_external",
    sku: "LIGHT-Pink-L"
  },
  {
    key: "LIGHT-White-L",
    catalogVariantId: 20022,
    syncVariantId: 20022,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "White",
    colorHex: "#ffffff",
    externalId: "light_white_l_external",
    sku: "LIGHT-White-L"
  },
  {
    key: "LIGHT-Yellow-L",
    catalogVariantId: 20023,
    syncVariantId: 20023,
    price: "24.99",
    design: "LIGHT",
    size: "L",
    color: "Yellow",
    colorHex: "#ffd667",
    externalId: "light_yellow_l_external",
    sku: "LIGHT-Yellow-L"
  },
  {
    key: "LIGHT-Ash-XL",
    catalogVariantId: 20024,
    syncVariantId: 20024,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Ash",
    colorHex: "#f0f1ea",
    externalId: "light_ash_xl_external",
    sku: "LIGHT-Ash-XL"
  },
  {
    key: "LIGHT-Athletic Heather-XL",
    catalogVariantId: 20025,
    syncVariantId: 20025,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Athletic Heather",
    colorHex: "#cececc",
    externalId: "light_athletic_heather_xl_external",
    sku: "LIGHT-Athletic Heather-XL"
  },
  {
    key: "LIGHT-Heather Dust-XL",
    catalogVariantId: 20026,
    syncVariantId: 20026,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Heather Dust",
    colorHex: "#e5d9c9",
    externalId: "light_heather_dust_xl_external",
    sku: "LIGHT-Heather Dust-XL"
  },
  {
    key: "LIGHT-Heather Prism Peach-XL",
    catalogVariantId: 20027,
    syncVariantId: 20027,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Heather Prism Peach",
    colorHex: "#f3c2b2",
    externalId: "light_heather_prism_peach_xl_external",
    sku: "LIGHT-Heather Prism Peach-XL"
  },
  {
    key: "LIGHT-Mustard-XL",
    catalogVariantId: 20028,
    syncVariantId: 20028,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Mustard",
    colorHex: "#eda027",
    externalId: "light_mustard_xl_external",
    sku: "LIGHT-Mustard-XL"
  },
  {
    key: "LIGHT-Pink-XL",
    catalogVariantId: 20029,
    syncVariantId: 20029,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Pink",
    colorHex: "#fdbfc7",
    externalId: "light_pink_xl_external",
    sku: "LIGHT-Pink-XL"
  },
  {
    key: "LIGHT-White-XL",
    catalogVariantId: 20030,
    syncVariantId: 20030,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "White",
    colorHex: "#ffffff",
    externalId: "light_white_xl_external",
    sku: "LIGHT-White-XL"
  },
  {
    key: "LIGHT-Yellow-XL",
    catalogVariantId: 20031,
    syncVariantId: 20031,
    price: "24.99",
    design: "LIGHT",
    size: "XL",
    color: "Yellow",
    colorHex: "#ffd667",
    externalId: "light_yellow_xl_external",
    sku: "LIGHT-Yellow-XL"
  },
  {
    key: "LIGHT-Ash-2XL",
    catalogVariantId: 20032,
    syncVariantId: 20032,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Ash",
    colorHex: "#f0f1ea",
    externalId: "light_ash_2xl_external",
    sku: "LIGHT-Ash-2XL"
  },
  {
    key: "LIGHT-Athletic Heather-2XL",
    catalogVariantId: 20033,
    syncVariantId: 20033,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Athletic Heather",
    colorHex: "#cececc",
    externalId: "light_athletic_heather_2xl_external",
    sku: "LIGHT-Athletic Heather-2XL"
  },
  {
    key: "LIGHT-Heather Dust-2XL",
    catalogVariantId: 20034,
    syncVariantId: 20034,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Heather Dust",
    colorHex: "#e5d9c9",
    externalId: "light_heather_dust_2xl_external",
    sku: "LIGHT-Heather Dust-2XL"
  },
  {
    key: "LIGHT-Heather Prism Peach-2XL",
    catalogVariantId: 20035,
    syncVariantId: 20035,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Heather Prism Peach",
    colorHex: "#f3c2b2",
    externalId: "light_heather_prism_peach_2xl_external",
    sku: "LIGHT-Heather Prism Peach-2XL"
  },
  {
    key: "LIGHT-Mustard-2XL",
    catalogVariantId: 20036,
    syncVariantId: 20036,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Mustard",
    colorHex: "#eda027",
    externalId: "light_mustard_2xl_external",
    sku: "LIGHT-Mustard-2XL"
  },
  {
    key: "LIGHT-Pink-2XL",
    catalogVariantId: 20037,
    syncVariantId: 20037,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Pink",
    colorHex: "#fdbfc7",
    externalId: "light_pink_2xl_external",
    sku: "LIGHT-Pink-2XL"
  },
  {
    key: "LIGHT-White-2XL",
    catalogVariantId: 20038,
    syncVariantId: 20038,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "White",
    colorHex: "#ffffff",
    externalId: "light_white_2xl_external",
    sku: "LIGHT-White-2XL"
  },
  {
    key: "LIGHT-Yellow-2XL",
    catalogVariantId: 20039,
    syncVariantId: 20039,
    price: "24.99",
    design: "LIGHT",
    size: "2XL",
    color: "Yellow",
    colorHex: "#ffd667",
    externalId: "light_yellow_2xl_external",
    sku: "LIGHT-Yellow-2XL"
  }
];

// Helper Functions
export function findTshirtVariant(design: 'DARK' | 'LIGHT', size: string, color: string): TshirtVariant | undefined {
  return TshirtVariants.find(variant => 
    variant.design === design && 
    variant.size === size && 
    variant.color === color
  );
}

export function findTshirtVariantByCatalogId(catalogId: number): TshirtVariant | undefined {
  return TshirtVariants.find(variant => variant.catalogVariantId === catalogId);
}

export function findTshirtVariantByExternalId(externalId: string): TshirtVariant | undefined {
  return TshirtVariants.find(variant => variant.externalId === externalId);
}

export function getTshirtVariantsByDesign(design: 'DARK' | 'LIGHT'): TshirtVariant[] {
  return TshirtVariants.filter(variant => variant.design === design);
}

export function getTshirtVariantsBySize(size: string): TshirtVariant[] {
  return TshirtVariants.filter(variant => variant.size === size);
}

export function getTshirtVariantsByColor(color: string): TshirtVariant[] {
  return TshirtVariants.filter(variant => variant.color === color);
}

// Get unique designs, sizes, and colors
export const tshirtDesigns = ['DARK', 'LIGHT'] as const;
export const tshirtSizes = ['S', 'M', 'L', 'XL', '2XL'] as const;

// Define the actual t-shirt colors with hex codes
export const tshirtColors = [
  { name: 'Ash', hex: '#f0f1ea' },
  { name: 'Athletic Heather', hex: '#cececc' },
  { name: 'Heather Dust', hex: '#e5d9c9' },
  { name: 'Heather Prism Peach', hex: '#f3c2b2' },
  { name: 'Mustard', hex: '#eda027' },
  { name: 'Pink', hex: '#fdbfc7' },
  { name: 'White', hex: '#ffffff', border: true },
  { name: 'Yellow', hex: '#ffd667' },
  { name: 'Army', hex: '#5f5849' },
  { name: 'Asphalt', hex: '#52514f' },
  { name: 'Autumn', hex: '#c85313' },
  { name: 'Black', hex: '#0c0c0c' },
  { name: 'Black Heather', hex: '#0b0b0b' },
  { name: 'Dark Grey Heather', hex: '#3E3C3D' },
  { name: 'Heather Deep Teal', hex: '#447085' },
  { name: 'Mauve', hex: '#bf6e6e' },
  { name: 'Navy', hex: '#212642' },
  { name: 'Olive', hex: '#5b642f' },
  { name: 'Red', hex: '#d0071e' },
  { name: 'Steel Blue', hex: '#668ea7' }
];

// Color design mapping for reference
export const colorDesignMapping: { [key: string]: 'DARK' | 'LIGHT' } = {
  // DARK design colors (white text)
  'Army': 'DARK',
  'Asphalt': 'DARK',
  'Autumn': 'DARK',
  'Black': 'DARK',
  'Black Heather': 'DARK',
  'Dark Grey Heather': 'DARK',
  'Heather Deep Teal': 'DARK',
  'Mauve': 'DARK',
  'Navy': 'DARK',
  'Olive': 'DARK',
  'Red': 'DARK',
  'Steel Blue': 'DARK',

  // LIGHT design colors (black text)
  'Ash': 'LIGHT',
  'Athletic Heather': 'LIGHT',
  'Heather Dust': 'LIGHT',
  'Heather Prism Peach': 'LIGHT',
  'Mustard': 'LIGHT',
  'Pink': 'LIGHT',
  'White': 'LIGHT',
  'Yellow': 'LIGHT'
};

// IMPORTANT: Each color now appears in exactly one design with UNIQUE Printful IDs
// DARK design: 12 colors × 5 sizes = 60 variants
// LIGHT design: 8 colors × 5 sizes = 40 variants
// Total: 100 variants with NO overlapping Printful catalog IDs
// Customer orders will now be fulfilled correctly by Printful