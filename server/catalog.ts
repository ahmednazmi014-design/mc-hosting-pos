const plainImage = "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85";
const premiumImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85";
const networkImage = "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85";

export const productSeed = [
  { slug: "stone-starter", name: "Stone Starter", category: "Minecraft Hosting", description: "A reliable starter server for friends and small survival worlds.", imageUrl: plainImage, price: 499, packSize: "2 GB RAM · 10 slots", available: true, featured: true, popularity: 100 },
  { slug: "iron-survival", name: "Iron Survival", category: "Minecraft Hosting", description: "More memory and room for plugins, mods, and a growing community.", imageUrl: premiumImage, price: 899, packSize: "4 GB RAM · 25 slots", available: true, featured: true, popularity: 96 },
  { slug: "diamond-network", name: "Diamond Network", category: "Minecraft Hosting", description: "High-performance hosting for busy communities and modded servers.", imageUrl: networkImage, price: 1699, packSize: "8 GB RAM · 60 slots", available: true, featured: true, popularity: 92 },
  { slug: "nether-pro", name: "Nether Pro", category: "Minecraft Hosting", description: "Powerful hardware, priority support, and room to scale your network.", imageUrl: premiumImage, price: 2999, packSize: "16 GB RAM · 120 slots", available: true, featured: true, popularity: 88 },
];

export const categoryList = [
  { name: "Minecraft Hosting", short: "Fast, reliable servers for survival, SMP, modded, and network communities", image: premiumImage, accent: "violet" },
  { name: "Server Management", short: "Renewals, monitoring, support, and control for every delivery", image: networkImage, accent: "cyan" },
];

export const menuDetails = { phone: "support@mc-hosting.local", menuImage: premiumImage, highlights: ["DDoS protection", "NVMe storage", "Instant setup", "24/7 monitoring"] };
export const deliveryAreas = [
  { city: "Asia / Singapore", charge: 0, note: "Low-latency regional node" },
  { city: "Europe / Frankfurt", charge: 0, note: "High-performance EU node" },
  { city: "North America", charge: 0, note: "Reliable US node" },
  { city: "Custom location", charge: 0, note: "Ask support about availability" },
];
