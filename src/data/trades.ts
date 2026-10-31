export interface Trade {
  id: string;
  de: string;
  en: string;
  classification: 'A' | 'B1' | 'B2' | 'review';
}

// Renovation-related selection, not an exhaustive list of German crafts.
// Checked 2026-10-31 against HwO Anlagen A/B. Classification is not a legal approval.
export const tradeSources = {
  A: 'https://www.gesetze-im-internet.de/hwo/anlage_a.html',
  B: 'https://www.gesetze-im-internet.de/hwo/anlage_b.html',
  qualifications: 'https://www.gesetze-im-internet.de/hwo/__7.html',
};
export const trades: Trade[] = [
  { id: 'masonry', de: 'Maurer und Betonbauer', en: 'Masonry and concrete work', classification: 'A' },
  { id: 'carpentry', de: 'Zimmerer', en: 'Structural carpentry', classification: 'A' },
  { id: 'roofing', de: 'Dachdecker', en: 'Roofing', classification: 'A' },
  { id: 'insulation', de: 'Wärme-, Kälte- und Schallschutzisolierer', en: 'Thermal, cold and sound insulation', classification: 'A' },
  { id: 'stone', de: 'Steinmetzen und Steinbildhauer', en: 'Stonemasonry', classification: 'A' },
  { id: 'plastering', de: 'Stuckateure', en: 'Plastering and stucco', classification: 'A' },
  { id: 'painting', de: 'Maler und Lackierer', en: 'Painting and decorating', classification: 'A' },
  { id: 'scaffolding', de: 'Gerüstbauer', en: 'Scaffolding', classification: 'A' },
  { id: 'chimney', de: 'Schornsteinfeger', en: 'Chimney sweeping', classification: 'A' },
  { id: 'metal', de: 'Metallbauer', en: 'Metal construction', classification: 'A' },
  { id: 'refrigeration', de: 'Kälteanlagenbauer', en: 'Refrigeration systems', classification: 'A' },
  { id: 'sheet-metal', de: 'Klempner', en: 'Architectural sheet-metal work', classification: 'A' },
  { id: 'plumbing-heating', de: 'Installateur und Heizungsbauer', en: 'Plumbing and heating', classification: 'A' },
  { id: 'electrical', de: 'Elektrotechniker', en: 'Electrical installation', classification: 'A' },
  { id: 'joinery', de: 'Tischler', en: 'Joinery and cabinetmaking', classification: 'A' },
  { id: 'glazing', de: 'Glaser', en: 'Glazing', classification: 'A' },
  { id: 'tiling', de: 'Fliesen-, Platten- und Mosaikleger', en: 'Tile, slab and mosaic laying', classification: 'A' },
  { id: 'screed', de: 'Estrichleger', en: 'Screed laying', classification: 'A' },
  { id: 'parquet', de: 'Parkettleger', en: 'Parquet laying', classification: 'A' },
  { id: 'shutters', de: 'Rollladen- und Sonnenschutztechniker', en: 'Shutters and sun protection', classification: 'A' },
  { id: 'interior', de: 'Raumausstatter', en: 'Interior furnishing', classification: 'A' },
  { id: 'cleaning', de: 'Gebäudereiniger', en: 'Building cleaning', classification: 'B1' },
  { id: 'timber-protection', de: 'Holz- und Bautenschützer', en: 'Timber and building preservation', classification: 'B1' },
  { id: 'flooring', de: 'Bodenleger', en: 'Floor laying (excluding parquet trade)', classification: 'B2' },
  { id: 'other', de: 'Anderes Gewerk / unsicher', en: 'Other trade / not sure', classification: 'review' },
];

export function showsQualificationUpload(trade?: Trade) {
  return trade?.classification === 'A' || trade?.classification === 'review';
}
export function certificateError(file: Pick<File, 'name' | 'size' | 'type'>): 'type' | 'size' | null {
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name) || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return 'type';
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) return 'size';
  return null;
}
