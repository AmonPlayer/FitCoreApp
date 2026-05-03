import Constants from 'expo-constants';
import { FoodItem } from '@/types';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function getApiKey(): string {
  return Constants.expoConfig?.extra?.usdaApiKey ?? 'DEMO_KEY';
}

function getNutrient(nutrients: Array<{ nutrientId: number; value: number }>, id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function mapToFoodItem(item: Record<string, unknown>): FoodItem {
  const nutrients = (item.foodNutrients as Array<{ nutrientId: number; value: number }>) ?? [];
  return {
    id: `usda-${item.fdcId}`,
    name: (item.description as string) ?? '',
    brand: item.brandOwner as string | undefined,
    servingSizeG: (item.servingSize as number) ?? 100,
    calories: Math.round(getNutrient(nutrients, 1008)),
    proteinG: Math.round(getNutrient(nutrients, 1003) * 10) / 10,
    carbsG: Math.round(getNutrient(nutrients, 1005) * 10) / 10,
    fatG: Math.round(getNutrient(nutrients, 1004) * 10) / 10,
    source: 'usda',
  };
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);
  const data = (await res.json()) as { foods?: Record<string, unknown>[] };
  return (data.foods ?? []).map(mapToFoodItem);
}

export async function getFoodById(fdcId: string): Promise<FoodItem> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/food/${fdcId}?api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA getFoodById failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return mapToFoodItem(data);
}
