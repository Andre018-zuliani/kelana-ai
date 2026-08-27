export const PLACE_RECOMMENDATIONS: Record<string, string[]> = {
  japan: ["Tokyo Tower", "Shibuya", "Mount Fuji"],
  indonesia: ["Bali Beach", "Borobudur Temple", "Mount Bromo"],
  france: ["Eiffel Tower", "Louvre Museum", "Palace of Versailles"],
  thailand: ["Grand Palace", "Phi Phi Islands", "Chiang Mai Old City"],
};

export const DEFAULT_PLACES = ["City Center", "Local Market", "Popular Landmark"];

export function getTripCategory(budget: number): string {
  if (budget < 1000) {
    return "Backpacker";
  } else if (budget <= 3000) {
    return "Standard";
  } else {
    return "Luxury";
  }
}

export function getTravelSeason(month: string): string {
  const normalized = month.trim().toLowerCase();
  if (normalized === "december") {
    return "Peak Season";
  } else if (normalized === "june") {
    return "Holiday Season";
  } else {
    return "Regular Season";
  }
}

export function calculateDailyBudget(budget: number, days: number): number {
  if (days <= 0) {
    return 0;
  }
  return budget / days;
}

export function getRecommendedPlaces(destination: string): string[] {
  const key = destination.trim().toLowerCase();
  return PLACE_RECOMMENDATIONS[key] || DEFAULT_PLACES;
}

export const GENERAL_RECOMMENDATIONS = ["Tokyo Tower", "Mount Fuji", "Shibuya"];
export const TRANSPORTATION_OPTIONS = ["Bus", "Train", "Flight"];

export function getGeneralRecommendations(): string[] {
  return [...GENERAL_RECOMMENDATIONS];
}

export function getTransportationOptions(): string[] {
  return [...TRANSPORTATION_OPTIONS];
}
