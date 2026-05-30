// All values per 100g | Sources: USDA FoodData Central & ICMR Nutritive Value of Indian Foods
export const FOODS = [
  // ── Grains & Staples ──
  { id: 1,  name: "White rice (cooked)",       cal: 130, pro: 2.7, car: 28.2, fat: 0.3,  category: "grains" },
  { id: 2,  name: "Brown rice (cooked)",        cal: 123, pro: 2.6, car: 25.6, fat: 0.9,  category: "grains" },
  { id: 3,  name: "Basmati rice (cooked)",      cal: 121, pro: 3.5, car: 25.2, fat: 0.4,  category: "grains" },
  { id: 4,  name: "Roti / chapati (plain)",     cal: 297, pro: 9.0, car: 53.7, fat: 5.4,  category: "grains" },
  { id: 5,  name: "Whole wheat bread",          cal: 247, pro: 13,  car: 41,   fat: 3.4,  category: "grains" },
  { id: 6,  name: "White bread",                cal: 265, pro: 9.0, car: 49,   fat: 3.2,  category: "grains" },
  { id: 7,  name: "Oats (raw / rolled)",        cal: 389, pro: 17,  car: 66,   fat: 7.0,  category: "grains" },
  { id: 8,  name: "Pasta (cooked)",             cal: 131, pro: 5.0, car: 25,   fat: 1.1,  category: "grains" },
  { id: 9,  name: "Poha / flattened rice",      cal: 130, pro: 2.1, car: 28,   fat: 0.3,  category: "grains" },
  { id: 10, name: "Upma (cooked)",              cal: 118, pro: 3.0, car: 21,   fat: 3.0,  category: "grains" },
  { id: 11, name: "Quinoa (cooked)",            cal: 120, pro: 4.4, car: 21.3, fat: 1.9,  category: "grains" },
  { id: 12, name: "Corn / maize (boiled)",      cal: 96,  pro: 3.4, car: 21,   fat: 1.5,  category: "grains" },

  // ── Proteins: Meat & Eggs ──
  { id: 13, name: "Chicken breast (cooked)",    cal: 165, pro: 31,  car: 0,    fat: 3.6,  category: "protein" },
  { id: 14, name: "Chicken thigh (cooked)",     cal: 209, pro: 26,  car: 0,    fat: 10.9, category: "protein" },
  { id: 15, name: "Mutton / lamb (cooked)",     cal: 258, pro: 25.6, car: 0,   fat: 16.5, category: "protein" },
  { id: 16, name: "Beef / keema (cooked)",      cal: 250, pro: 26,  car: 0,    fat: 15,   category: "protein" },
  { id: 17, name: "Salmon (cooked)",            cal: 208, pro: 20,  car: 0,    fat: 13,   category: "protein" },
  { id: 18, name: "Tuna (canned in water)",     cal: 109, pro: 25,  car: 0,    fat: 0.8,  category: "protein" },
  { id: 19, name: "Whole egg (boiled)",         cal: 155, pro: 13,  car: 1.1,  fat: 11,   category: "protein" },
  { id: 20, name: "Egg white (raw)",            cal: 52,  pro: 11,  car: 0.7,  fat: 0.2,  category: "protein" },
  { id: 56, name: "Fried egg",                  cal: 196, pro: 13.6, car: 0.8,  fat: 14.8, category: "protein" },

  // ── Proteins: Dairy ──
  { id: 21, name: "Paneer (raw)",               cal: 265, pro: 18,  car: 3.4,  fat: 20,   category: "dairy" },
  { id: 22, name: "Tofu (firm)",                cal: 76,  pro: 8.0, car: 1.9,  fat: 4.8,  category: "dairy" },
  { id: 23, name: "Milk (full fat)",            cal: 61,  pro: 3.2, car: 4.8,  fat: 3.3,  category: "dairy" },
  { id: 24, name: "Milk (toned / low fat)",     cal: 47,  pro: 3.4, car: 4.9,  fat: 1.5,  category: "dairy" },
  { id: 25, name: "Curd / yogurt (full fat)",   cal: 98,  pro: 3.5, car: 4.7,  fat: 4.3,  category: "dairy" },
  { id: 26, name: "Greek yogurt (plain)",       cal: 59,  pro: 10,  car: 3.6,  fat: 0.4,  category: "dairy" },
  { id: 27, name: "Whey protein powder",        cal: 350, pro: 80,  car: 5,    fat: 3,    category: "dairy" },
  { id: 28, name: "Cottage cheese (low fat)",   cal: 72,  pro: 12.4, car: 2.7, fat: 1.0,  category: "dairy" },

  // ── Legumes & Pulses ──
  { id: 29, name: "Toor / arhar dal (cooked)",  cal: 116, pro: 7.0, car: 20,   fat: 0.4,  category: "legumes" },
  { id: 30, name: "Masoor dal (cooked)",        cal: 116, pro: 9.0, car: 20,   fat: 0.4,  category: "legumes" },
  { id: 31, name: "Chana dal (cooked)",         cal: 164, pro: 8.9, car: 27.4, fat: 2.7,  category: "legumes" },
  { id: 32, name: "Moong dal (cooked)",         cal: 105, pro: 7.0, car: 19.2, fat: 0.4,  category: "legumes" },
  { id: 33, name: "Rajma / kidney beans",       cal: 127, pro: 8.7, car: 22.8, fat: 0.5,  category: "legumes" },
  { id: 34, name: "Chole / chickpeas (cooked)", cal: 164, pro: 8.9, car: 27.4, fat: 2.6,  category: "legumes" },
  { id: 35, name: "Soya chunks (dry)",          cal: 345, pro: 52,  car: 33,   fat: 0.5,  category: "legumes" },
  { id: 36, name: "Edamame (boiled)",           cal: 121, pro: 11.9, car: 8.9, fat: 5.2,  category: "legumes" },

  // ── Vegetables ──
  { id: 37, name: "Potato (boiled)",            cal: 87,  pro: 1.9, car: 20,   fat: 0.1,  category: "vegetables" },
  { id: 38, name: "Sweet potato (boiled)",      cal: 86,  pro: 1.6, car: 20,   fat: 0.1,  category: "vegetables" },
  { id: 39, name: "Spinach (raw)",              cal: 23,  pro: 2.9, car: 3.6,  fat: 0.4,  category: "vegetables" },
  { id: 40, name: "Broccoli (raw)",             cal: 34,  pro: 2.8, car: 7.0,  fat: 0.4,  category: "vegetables" },
  { id: 41, name: "Sambar (cooked)",            cal: 55,  pro: 2.7, car: 8.0,  fat: 1.4,  category: "vegetables" },

  // ── Fruits ──
  { id: 42, name: "Banana",                     cal: 89,  pro: 1.1, car: 23,   fat: 0.3,  category: "fruits" },
  { id: 43, name: "Apple",                      cal: 52,  pro: 0.3, car: 14,   fat: 0.2,  category: "fruits" },
  { id: 44, name: "Mango",                      cal: 60,  pro: 0.8, car: 15,   fat: 0.4,  category: "fruits" },
  { id: 45, name: "Grapes",                     cal: 69,  pro: 0.7, car: 18,   fat: 0.2,  category: "fruits" },
  { id: 46, name: "Orange",                     cal: 47,  pro: 0.9, car: 12,   fat: 0.1,  category: "fruits" },

  // ── Nuts & Fats ──
  { id: 47, name: "Peanuts (raw)",              cal: 567, pro: 26,  car: 16,   fat: 49,   category: "fats" },
  { id: 48, name: "Peanut butter (natural)",    cal: 588, pro: 25,  car: 20,   fat: 50,   category: "fats" },
  { id: 49, name: "Almonds",                    cal: 579, pro: 21,  car: 22,   fat: 50,   category: "fats" },
  { id: 50, name: "Cashews",                    cal: 553, pro: 18,  car: 30,   fat: 44,   category: "fats" },
  { id: 51, name: "Olive oil",                  cal: 884, pro: 0,   car: 0,    fat: 100,  category: "fats" },
  { id: 52, name: "Ghee",                       cal: 900, pro: 0,   car: 0,    fat: 99.7, category: "fats" },
  { id: 53, name: "Butter",                     cal: 717, pro: 0.9, car: 0.1,  fat: 81,   category: "fats" },

  // ── South Indian ──
  { id: 54, name: "Idli (1 piece ~40g)",        cal: 39,  pro: 1.9, car: 8.2,  fat: 0.2,  category: "grains" },
  { id: 55, name: "Dosa (plain, ~70g)",         cal: 133, pro: 3.1, car: 19.7, fat: 3.7,  category: "grains" },
];

export function searchFoods(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  return FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8);
}
