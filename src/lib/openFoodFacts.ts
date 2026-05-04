import { FoodItem } from '@/types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  brands?: string;
  code?: string;
  nutriments?: OFFNutriments;
  serving_quantity?: number;
}

function mapProduct(product: OFFProduct): FoodItem {
  const n = product.nutriments ?? {};
  return {
    id: `off-${product.code ?? Math.random()}`,
    name: product.product_name ?? 'Unknown',
    brand: product.brands,
    barcode: product.code,
    servingSizeG: product.serving_quantity ?? 100,
    calories: Math.round(n['energy-kcal_100g'] ?? 0),
    proteinG: Math.round((n.proteins_100g ?? 0) * 10) / 10,
    carbsG: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
    fatG: Math.round((n.fat_100g ?? 0) * 10) / 10,
    source: 'off',
  };
}

export async function searchByBarcode(barcode: string): Promise<FoodItem | null> {
  const url = `${BASE_URL}/product/${barcode}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { status: number; product?: OFFProduct };
  if (data.status === 0 || !data.product) return null;
  return mapProduct(data.product);
}

export async function searchByName(query: string): Promise<FoodItem[]> {
  const url = `${BASE_URL}/search?search_terms=${encodeURIComponent(query)}&sort_by=unique_scans_n&json=1&page_size=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OFFProduct[] };
  return (data.products ?? [])
    .map(mapProduct)
    .filter((item) => item.name && item.name !== 'Unknown' && item.calories > 0);
}
