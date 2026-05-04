import Constants from 'expo-constants';
import { FoodItem } from '@/types';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const DATA_TYPE_PRIORITY: Record<string, number> = {
  'Foundation': 0,
  'SR Legacy': 1,
  'Survey (FNDDS)': 2,
  'Branded': 3,
};

function getApiKey(): string {
  return Constants.expoConfig?.extra?.usdaApiKey ?? 'DEMO_KEY';
}

function getNutrient(nutrients: Array<{ nutrientId: number; value: number }>, id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function formatName(raw: string): string {
  const titled = raw.toLowerCase().replace(/(?:^|\s|,)\S/g, (c) => c.toUpperCase());
  const parts = titled.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : titled;
}

function mapToFoodItem(item: Record<string, unknown>): FoodItem {
  const nutrients = (item.foodNutrients as Array<{ nutrientId: number; value: number }>) ?? [];
  const dataType = (item.dataType as string) ?? '';
  return {
    id: `usda-${item.fdcId}`,
    name: formatName((item.description as string) ?? ''),
    brand: item.brandOwner as string | undefined,
    servingSizeG: (item.servingSize as number) ?? 100,
    calories: Math.round(getNutrient(nutrients, 1008)),
    proteinG: Math.round(getNutrient(nutrients, 1003) * 10) / 10,
    carbsG: Math.round(getNutrient(nutrients, 1005) * 10) / 10,
    fatG: Math.round(getNutrient(nutrients, 1004) * 10) / 10,
    source: 'usda',
    dataType,
  };
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    query,
    api_key: apiKey,
    pageSize: '25',
    sortBy: 'score',
    sortOrder: 'desc',
  });
  const url = `${BASE_URL}/foods/search?${params}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS),Branded`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);
  const data = (await res.json()) as { foods?: Record<string, unknown>[] };
  const items = (data.foods ?? []).map(mapToFoodItem);
  items.sort((a, b) => (DATA_TYPE_PRIORITY[a.dataType ?? ''] ?? 4) - (DATA_TYPE_PRIORITY[b.dataType ?? ''] ?? 4));
  return items.slice(0, 20);
}

export async function getFoodById(fdcId: string): Promise<FoodItem> {
  const apiKey = getApiKey();
  const res = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${apiKey}`);
  if (!res.ok) throw new Error(`USDA getFoodById failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return mapToFoodItem(data);
}
