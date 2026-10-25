import { describe, expect, it } from "vitest";
import { productSeed, categoryList } from "./catalog";

describe("MC Hosting catalogue", () => {
  it("contains the four editable Minecraft hosting plans", () => {
    expect(productSeed.map(product => `${product.name} ${product.packSize} ${product.price}`)).toEqual([
      "Stone Starter 2 GB RAM · 10 slots 499",
      "Iron Survival 4 GB RAM · 25 slots 899",
      "Diamond Network 8 GB RAM · 60 slots 1699",
      "Nether Pro 16 GB RAM · 120 slots 2999",
    ]);
  });

  it("contains hosting categories and all plans are available", () => {
    expect(categoryList.map(category => category.name)).toEqual(["Minecraft Hosting", "Server Management"]);
    expect(productSeed.every(product => product.available)).toBe(true);
  });
});
