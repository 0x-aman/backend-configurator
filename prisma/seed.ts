import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a demo client
  const client = await prisma.client.create({
    data: {
      email: "demo@example.com",
      passwordHash: await hash("password123", 10),
      name: "Demo Client",
      companyName: "Demo Furniture Co.",
      emailVerified: true,
      subscriptionStatus: "ACTIVE",
      subscriptionDuration: "MONTHLY",
      apiKey: "demo_api_key_123456789",
      publicKey: "demo_public_key_123456789",
      domain: "demo-furniture.com",
      allowedDomains: ["demo-furniture.com", "localhost:3000"],
      monthlyRequests: 0,
      requestLimit: 100000,
    },
  });

  console.log("✅ Created client:", client.email);

  // Create a theme
  const theme = await prisma.theme.create({
    data: {
      clientId: client.id,
      name: "Modern Light Theme",
      description: "Clean and modern light theme",
      isDefault: true,
      primaryColor: "220 70% 50%",
      secondaryColor: "340 70% 50%",
      accentColor: "280 70% 50%",
      backgroundColor: "0 0% 100%",
      surfaceColor: "0 0% 98%",
      textColor: "0 0% 10%",
      fontFamily: "Inter, sans-serif",
      borderRadius: "0.5rem",
    },
  });

  console.log("✅ Created theme:", theme.name);

  // Create a configurator
  const configurator = await prisma.configurator.create({
    data: {
      clientId: client.id,
      themeId: theme.id,
      name: "Custom Sofa Configurator",
      description: "Design your perfect custom sofa",
      slug: "custom-sofa",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      metaTitle: "Custom Sofa Designer | Demo Furniture",
      metaDescription:
        "Design your perfect custom sofa with our interactive configurator",
    },
  });

  console.log("✅ Created configurator:", configurator.name);

  // Create categories and options

  // Category 1: Size
  const sizeCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Sofa Size",
      categoryType: "DIMENSION",
      description: "Choose your sofa size",
      isPrimary: true,
      isRequired: true,
      orderIndex: 1,
      icon: "📏",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sizeCategory.id,
        label: "Small (2-Seater)",
        description: "Perfect for apartments and small spaces",
        price: 899.99,
        cost: 450.0,
        sku: "SOFA-SIZE-SM",
        orderIndex: 1,
        isDefault: false,
        dimensions: { width: 150, depth: 85, height: 85 },
        attributeValues: { seats: 2, width_cm: 150, depth_cm: 85 },
      },
      {
        categoryId: sizeCategory.id,
        label: "Medium (3-Seater)",
        description: "Most popular size for living rooms",
        price: 1199.99,
        cost: 600.0,
        sku: "SOFA-SIZE-MD",
        orderIndex: 2,
        isDefault: true,
        isPopular: true,
        dimensions: { width: 200, depth: 85, height: 85 },
        attributeValues: { seats: 3, width_cm: 200, depth_cm: 85 },
      },
      {
        categoryId: sizeCategory.id,
        label: "Large (4-Seater)",
        description: "Spacious seating for the whole family",
        price: 1599.99,
        cost: 800.0,
        sku: "SOFA-SIZE-LG",
        orderIndex: 3,
        isDefault: false,
        dimensions: { width: 250, depth: 85, height: 85 },
        attributeValues: { seats: 4, width_cm: 250, depth_cm: 85 },
      },
      {
        categoryId: sizeCategory.id,
        label: "Extra Large (5-Seater)",
        description: "Maximum comfort and space",
        price: 1999.99,
        cost: 1000.0,
        sku: "SOFA-SIZE-XL",
        orderIndex: 4,
        isDefault: false,
        dimensions: { width: 300, depth: 85, height: 85 },
        attributeValues: { seats: 5, width_cm: 300, depth_cm: 85 },
      },
    ],
  });

  console.log("✅ Created Size category with 4 options");

  // Category 2: Fabric Color
  const colorCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Fabric Color",
      categoryType: "COLOR",
      description: "Select your preferred fabric color",
      isPrimary: false,
      isRequired: true,
      orderIndex: 2,
      icon: "🎨",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: colorCategory.id,
        label: "Cloud Gray",
        description: "Elegant light gray",
        price: 0,
        cost: 0,
        sku: "FAB-GRAY",
        color: "Gray",
        hexColor: "#D3D3D3",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { color_name: "Cloud Gray", hex: "#D3D3D3" },
      },
      {
        categoryId: colorCategory.id,
        label: "Navy Blue",
        description: "Classic navy blue",
        price: 50,
        cost: 25,
        sku: "FAB-NAVY",
        color: "Blue",
        hexColor: "#000080",
        orderIndex: 2,
        isPopular: true,
        attributeValues: { color_name: "Navy Blue", hex: "#000080" },
      },
      {
        categoryId: colorCategory.id,
        label: "Charcoal Black",
        description: "Sophisticated black",
        price: 50,
        cost: 25,
        sku: "FAB-BLACK",
        color: "Black",
        hexColor: "#36454F",
        orderIndex: 3,
        attributeValues: { color_name: "Charcoal Black", hex: "#36454F" },
      },
      {
        categoryId: colorCategory.id,
        label: "Cream Beige",
        description: "Warm beige tone",
        price: 0,
        cost: 0,
        sku: "FAB-BEIGE",
        color: "Beige",
        hexColor: "#F5F5DC",
        orderIndex: 4,
        attributeValues: { color_name: "Cream Beige", hex: "#F5F5DC" },
      },
      {
        categoryId: colorCategory.id,
        label: "Forest Green",
        description: "Rich forest green",
        price: 75,
        cost: 35,
        sku: "FAB-GREEN",
        color: "Green",
        hexColor: "#228B22",
        orderIndex: 5,
        attributeValues: { color_name: "Forest Green", hex: "#228B22" },
      },
      {
        categoryId: colorCategory.id,
        label: "Burgundy Red",
        description: "Deep burgundy",
        price: 75,
        cost: 35,
        sku: "FAB-BURG",
        color: "Red",
        hexColor: "#800020",
        orderIndex: 6,
        attributeValues: { color_name: "Burgundy Red", hex: "#800020" },
      },
    ],
  });

  console.log("✅ Created Color category with 6 options");

  // Category 3: Material Type
  const materialCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Material",
      categoryType: "MATERIAL",
      description: "Choose your fabric material",
      isPrimary: false,
      isRequired: true,
      orderIndex: 3,
      icon: "🧵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: materialCategory.id,
        label: "Standard Fabric",
        description: "Durable polyester blend",
        price: 0,
        cost: 0,
        sku: "MAT-STD",
        materialType: "Polyester",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { material: "Polyester Blend", durability: "Medium" },
      },
      {
        categoryId: materialCategory.id,
        label: "Premium Linen",
        description: "Natural breathable linen",
        price: 200,
        cost: 100,
        sku: "MAT-LINEN",
        materialType: "Linen",
        orderIndex: 2,
        isPopular: true,
        attributeValues: { material: "Premium Linen", durability: "High" },
      },
      {
        categoryId: materialCategory.id,
        label: "Velvet",
        description: "Luxurious soft velvet",
        price: 300,
        cost: 150,
        sku: "MAT-VELVET",
        materialType: "Velvet",
        orderIndex: 3,
        attributeValues: { material: "Soft Velvet", durability: "Medium" },
      },
      {
        categoryId: materialCategory.id,
        label: "Leather",
        description: "Genuine leather upholstery",
        price: 500,
        cost: 250,
        sku: "MAT-LEATHER",
        materialType: "Leather",
        orderIndex: 4,
        attributeValues: {
          material: "Genuine Leather",
          durability: "Very High",
        },
      },
      {
        categoryId: materialCategory.id,
        label: "Performance Fabric",
        description: "Stain-resistant and easy to clean",
        price: 250,
        cost: 125,
        sku: "MAT-PERF",
        materialType: "Performance",
        orderIndex: 5,
        attributeValues: {
          material: "Performance Fabric",
          durability: "Very High",
          stain_resistant: true,
        },
      },
    ],
  });

  console.log("✅ Created Material category with 5 options");

  // Category 4: Leg Style
  const legCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Leg Style",
      categoryType: "FEATURE",
      description: "Select your preferred leg style",
      isPrimary: false,
      isRequired: true,
      orderIndex: 4,
      icon: "🦵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: legCategory.id,
        label: "Wooden Tapered",
        description: "Classic tapered wooden legs",
        price: 0,
        cost: 0,
        sku: "LEG-WOOD",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { style: "Tapered", material: "Wood", height_cm: 15 },
      },
      {
        categoryId: legCategory.id,
        label: "Metal Chrome",
        description: "Modern chrome metal legs",
        price: 100,
        cost: 50,
        sku: "LEG-CHROME",
        orderIndex: 2,
        attributeValues: {
          style: "Straight",
          material: "Chrome",
          height_cm: 15,
        },
      },
      {
        categoryId: legCategory.id,
        label: "Black Metal",
        description: "Industrial black metal legs",
        price: 100,
        cost: 50,
        sku: "LEG-BLACK",
        orderIndex: 3,
        attributeValues: {
          style: "Straight",
          material: "Black Metal",
          height_cm: 15,
        },
      },
      {
        categoryId: legCategory.id,
        label: "No Legs (Floor)",
        description: "Low profile, sits on floor",
        price: -50,
        cost: -25,
        sku: "LEG-NONE",
        orderIndex: 4,
        attributeValues: { style: "Floor", material: "None", height_cm: 0 },
      },
    ],
  });

  console.log("✅ Created Leg Style category with 4 options");

  // Category 5: Accessories
  const accessoryCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Add-ons",
      categoryType: "ACCESSORY",
      description: "Optional add-ons and accessories",
      isPrimary: false,
      isRequired: false,
      orderIndex: 5,
      icon: "✨",
      minSelections: 0,
      maxSelections: 5,
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: accessoryCategory.id,
        label: "Throw Pillows (Set of 2)",
        description: "Matching decorative pillows",
        price: 89.99,
        cost: 30,
        sku: "ACC-PILLOWS",
        orderIndex: 1,
        stockQuantity: 50,
        attributeValues: { quantity: 2, type: "decorative" },
      },
      {
        categoryId: accessoryCategory.id,
        label: "Ottoman",
        description: "Matching storage ottoman",
        price: 299.99,
        cost: 120,
        sku: "ACC-OTTOMAN",
        orderIndex: 2,
        stockQuantity: 20,
        attributeValues: {
          has_storage: true,
          dimensions: { width: 60, depth: 60, height: 45 },
        },
      },
      {
        categoryId: accessoryCategory.id,
        label: "Armrest Tray Table",
        description: "Convenient side tray for drinks",
        price: 49.99,
        cost: 20,
        sku: "ACC-TRAY",
        orderIndex: 3,
        stockQuantity: 100,
        attributeValues: { material: "Wood", type: "clip-on" },
      },
      {
        categoryId: accessoryCategory.id,
        label: "Furniture Protection Plan (5 Years)",
        description: "Extended warranty and stain protection",
        price: 199.99,
        cost: 50,
        sku: "ACC-WARRANTY",
        orderIndex: 4,
        inStock: true,
        attributeValues: {
          duration_years: 5,
          covers: ["stains", "rips", "structural"],
        },
      },
      {
        categoryId: accessoryCategory.id,
        label: "USB Charging Ports",
        description: "Built-in USB charging (2 ports)",
        price: 79.99,
        cost: 30,
        sku: "ACC-USB",
        orderIndex: 5,
        stockQuantity: 30,
        attributeValues: { port_count: 2, type: "USB-A" },
      },
    ],
  });

  console.log("✅ Created Accessories category with 5 options");

  // Category 6: Finish
  const finishCategory = await prisma.category.create({
    data: {
      configuratorId: configurator.id,
      name: "Wood Finish",
      categoryType: "FINISH",
      description: "Select the finish for wooden components",
      isPrimary: false,
      isRequired: true,
      orderIndex: 6,
      icon: "🪵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: finishCategory.id,
        label: "Natural Oak",
        description: "Light natural oak finish",
        price: 0,
        cost: 0,
        sku: "FIN-OAK",
        finishType: "Natural",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { wood: "Oak", tone: "Light", finish: "Matte" },
      },
      {
        categoryId: finishCategory.id,
        label: "Walnut",
        description: "Rich dark walnut finish",
        price: 75,
        cost: 35,
        sku: "FIN-WALNUT",
        finishType: "Stained",
        orderIndex: 2,
        isPopular: true,
        attributeValues: { wood: "Walnut", tone: "Dark", finish: "Satin" },
      },
      {
        categoryId: finishCategory.id,
        label: "Espresso",
        description: "Deep espresso brown",
        price: 50,
        cost: 25,
        sku: "FIN-ESP",
        finishType: "Stained",
        orderIndex: 3,
        attributeValues: { wood: "Oak", tone: "Dark", finish: "Satin" },
      },
      {
        categoryId: finishCategory.id,
        label: "White Wash",
        description: "Contemporary white wash",
        price: 50,
        cost: 25,
        sku: "FIN-WHITE",
        finishType: "Painted",
        orderIndex: 4,
        attributeValues: { wood: "Oak", tone: "White", finish: "Matte" },
      },
    ],
  });

  console.log("✅ Created Finish category with 4 options");

  // Create a sample quote
  const quote = await prisma.quote.create({
    data: {
      clientId: client.id,
      configuratorId: configurator.id,
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      customerPhone: "+1-555-0123",
      title: "Custom Sofa Configuration",
      selectedOptions: {
        size: "Medium (3-Seater)",
        color: "Navy Blue",
        material: "Premium Linen",
        legs: "Wooden Tapered",
        addons: ["Throw Pillows (Set of 2)", "Ottoman"],
        finish: "Walnut",
      },
      totalPrice: 1829.97,
      subtotal: 1829.97,
      status: "PENDING",
      customerNotes:
        "Please deliver before Christmas. Would like to see fabric samples first.",
    },
  });

  console.log("✅ Created sample quote:", quote.quoteCode);

  console.log("🎉 Seed completed successfully!");
  console.log("📊 Summary:");
  console.log("- 1 Client (demo@example.com / password123)");
  console.log("- 1 Theme (Modern Light Theme)");
  console.log("- 1 Configurator (Custom Sofa)");
  console.log(
    "- 6 Categories (Size, Color, Material, Legs, Accessories, Finish)"
  );
  console.log("- 28 Options total");
  console.log("- 1 Sample Quote");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
