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

  // ========================================
  // WATER JET CUTTING CONFIGURATOR
  // ========================================

  const waterjetConfigurator = await prisma.configurator.create({
    data: {
      clientId: client.id,
      themeId: theme.id,
      name: "Industrial Water Jet Cutting Service",
      description:
        "Configure your custom water jet cutting project with precision material selection",
      slug: "waterjet-cutting",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      metaTitle: "Water Jet Cutting Service | Precision Industrial Cutting",
      metaDescription:
        "Get custom water jet cutting services for metal, stone, glass, and composite materials with precision tolerance",
    },
  });

  console.log("✅ Created Water Jet configurator");

  // Category 1: Material Type
  const wjMaterialCategory = await prisma.category.create({
    data: {
      configuratorId: waterjetConfigurator.id,
      name: "Material Type",
      categoryType: "MATERIAL",
      description: "Select the material to be cut",
      isPrimary: true,
      isRequired: true,
      orderIndex: 1,
      icon: "🔩",
    },
  });

  const wjMaterials = await prisma.option.createMany({
    data: [
      {
        categoryId: wjMaterialCategory.id,
        label: "Stainless Steel 304",
        description: "Corrosion-resistant stainless steel",
        price: 150.0,
        cost: 75.0,
        sku: "WJ-SS304",
        materialType: "Metal",
        orderIndex: 1,
        isDefault: true,
        attributeValues: {
          density: "7.9 g/cm³",
          hardness: "Medium",
          maxThickness: "50mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Aluminum 6061",
        description: "Lightweight aerospace-grade aluminum",
        price: 120.0,
        cost: 60.0,
        sku: "WJ-AL6061",
        materialType: "Metal",
        orderIndex: 2,
        isPopular: true,
        attributeValues: {
          density: "2.7 g/cm³",
          hardness: "Medium",
          maxThickness: "75mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Mild Steel",
        description: "Carbon steel for structural applications",
        price: 100.0,
        cost: 50.0,
        sku: "WJ-MS",
        materialType: "Metal",
        orderIndex: 3,
        attributeValues: {
          density: "7.85 g/cm³",
          hardness: "Medium",
          maxThickness: "50mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Titanium Grade 5",
        description: "High-strength titanium alloy",
        price: 450.0,
        cost: 225.0,
        sku: "WJ-TI5",
        materialType: "Metal",
        orderIndex: 4,
        attributeValues: {
          density: "4.43 g/cm³",
          hardness: "High",
          maxThickness: "25mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Granite",
        description: "Natural stone for countertops and tiles",
        price: 200.0,
        cost: 100.0,
        sku: "WJ-GRANITE",
        materialType: "Stone",
        orderIndex: 5,
        attributeValues: {
          density: "2.7 g/cm³",
          hardness: "Very High",
          maxThickness: "50mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Tempered Glass",
        description: "Safety glass for architectural applications",
        price: 180.0,
        cost: 90.0,
        sku: "WJ-GLASS",
        materialType: "Glass",
        orderIndex: 6,
        attributeValues: {
          density: "2.5 g/cm³",
          hardness: "High",
          maxThickness: "19mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Carbon Fiber Composite",
        description: "Lightweight high-performance composite",
        price: 350.0,
        cost: 175.0,
        sku: "WJ-CARBON",
        materialType: "Composite",
        orderIndex: 7,
        attributeValues: {
          density: "1.6 g/cm³",
          hardness: "High",
          maxThickness: "12mm",
        },
      },
      {
        categoryId: wjMaterialCategory.id,
        label: "Copper",
        description: "Conductive copper for electrical applications",
        price: 220.0,
        cost: 110.0,
        sku: "WJ-COPPER",
        materialType: "Metal",
        orderIndex: 8,
        attributeValues: {
          density: "8.96 g/cm³",
          hardness: "Soft",
          maxThickness: "25mm",
        },
      },
    ],
  });

  console.log("✅ Created Material Type category with 8 options");

  // Get material option IDs for incompatibility setup
  const materials = await prisma.option.findMany({
    where: { categoryId: wjMaterialCategory.id },
  });
  const ss304 = materials.find((m) => m.sku === "WJ-SS304")!;
  const aluminum = materials.find((m) => m.sku === "WJ-AL6061")!;
  const mildSteel = materials.find((m) => m.sku === "WJ-MS")!;
  const titanium = materials.find((m) => m.sku === "WJ-TI5")!;
  const granite = materials.find((m) => m.sku === "WJ-GRANITE")!;
  const glass = materials.find((m) => m.sku === "WJ-GLASS")!;
  const carbon = materials.find((m) => m.sku === "WJ-CARBON")!;
  const copper = materials.find((m) => m.sku === "WJ-COPPER")!;

  // Category 2: Material Thickness
  const wjThicknessCategory = await prisma.category.create({
    data: {
      configuratorId: waterjetConfigurator.id,
      name: "Material Thickness",
      categoryType: "DIMENSION",
      description: "Specify the thickness of your material",
      isPrimary: false,
      isRequired: true,
      orderIndex: 2,
      icon: "📏",
    },
  });

  const wjThickness = await prisma.option.createMany({
    data: [
      {
        categoryId: wjThicknessCategory.id,
        label: '1/8" (3mm)',
        description: "Thin sheet - fastest cutting",
        price: 50.0,
        cost: 25.0,
        sku: "WJ-T3MM",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { thickness: "3mm", cuttingTime: "Fast" },
      },
      {
        categoryId: wjThicknessCategory.id,
        label: '1/4" (6mm)',
        description: "Standard thickness",
        price: 75.0,
        cost: 37.5,
        sku: "WJ-T6MM",
        orderIndex: 2,
        isPopular: true,
        attributeValues: { thickness: "6mm", cuttingTime: "Medium" },
      },
      {
        categoryId: wjThicknessCategory.id,
        label: '1/2" (12mm)',
        description: "Medium thickness",
        price: 120.0,
        cost: 60.0,
        sku: "WJ-T12MM",
        orderIndex: 3,
        attributeValues: { thickness: "12mm", cuttingTime: "Medium" },
      },
      {
        categoryId: wjThicknessCategory.id,
        label: '3/4" (19mm)',
        description: "Thick material",
        price: 180.0,
        cost: 90.0,
        sku: "WJ-T19MM",
        orderIndex: 4,
        attributeValues: { thickness: "19mm", cuttingTime: "Slow" },
      },
      {
        categoryId: wjThicknessCategory.id,
        label: '1" (25mm)',
        description: "Very thick material",
        price: 250.0,
        cost: 125.0,
        sku: "WJ-T25MM",
        orderIndex: 5,
        attributeValues: { thickness: "25mm", cuttingTime: "Very Slow" },
      },
      {
        categoryId: wjThicknessCategory.id,
        label: '2" (50mm)',
        description: "Extra thick - maximum capacity for most materials",
        price: 400.0,
        cost: 200.0,
        sku: "WJ-T50MM",
        orderIndex: 6,
        attributeValues: { thickness: "50mm", cuttingTime: "Very Slow" },
      },
    ],
  });

  console.log("✅ Created Thickness category with 6 options");

  const thicknesses = await prisma.option.findMany({
    where: { categoryId: wjThicknessCategory.id },
  });
  const t3mm = thicknesses.find((t) => t.sku === "WJ-T3MM")!;
  const t6mm = thicknesses.find((t) => t.sku === "WJ-T6MM")!;
  const t12mm = thicknesses.find((t) => t.sku === "WJ-T12MM")!;
  const t19mm = thicknesses.find((t) => t.sku === "WJ-T19MM")!;
  const t25mm = thicknesses.find((t) => t.sku === "WJ-T25MM")!;
  const t50mm = thicknesses.find((t) => t.sku === "WJ-T50MM")!;

  // Category 3: Cutting Precision
  const wjPrecisionCategory = await prisma.category.create({
    data: {
      configuratorId: waterjetConfigurator.id,
      name: "Cutting Precision",
      categoryType: "FEATURE",
      description: "Select the required tolerance level",
      isPrimary: false,
      isRequired: true,
      orderIndex: 3,
      icon: "🎯",
    },
  });

  const wjPrecision = await prisma.option.createMany({
    data: [
      {
        categoryId: wjPrecisionCategory.id,
        label: "Standard (±0.1mm)",
        description: "Good for general purposes",
        price: 0,
        cost: 0,
        sku: "WJ-PREC-STD",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { tolerance: "±0.1mm", quality: "Standard" },
      },
      {
        categoryId: wjPrecisionCategory.id,
        label: "High (±0.05mm)",
        description: "Precise cutting for detailed work",
        price: 100.0,
        cost: 50.0,
        sku: "WJ-PREC-HIGH",
        orderIndex: 2,
        isPopular: true,
        attributeValues: { tolerance: "±0.05mm", quality: "High" },
      },
      {
        categoryId: wjPrecisionCategory.id,
        label: "Ultra (±0.025mm)",
        description: "Maximum precision for critical applications",
        price: 250.0,
        cost: 125.0,
        sku: "WJ-PREC-ULTRA",
        orderIndex: 3,
        attributeValues: { tolerance: "±0.025mm", quality: "Ultra" },
      },
    ],
  });

  console.log("✅ Created Precision category with 3 options");

  const precisions = await prisma.option.findMany({
    where: { categoryId: wjPrecisionCategory.id },
  });
  const precStd = precisions.find((p) => p.sku === "WJ-PREC-STD")!;
  const precHigh = precisions.find((p) => p.sku === "WJ-PREC-HIGH")!;
  const precUltra = precisions.find((p) => p.sku === "WJ-PREC-ULTRA")!;

  // Category 4: Edge Finishing
  const wjFinishCategory = await prisma.category.create({
    data: {
      configuratorId: waterjetConfigurator.id,
      name: "Edge Finishing",
      categoryType: "FINISH",
      description: "Post-cutting edge treatment",
      isPrimary: false,
      isRequired: true,
      orderIndex: 4,
      icon: "✨",
    },
  });

  const wjFinish = await prisma.option.createMany({
    data: [
      {
        categoryId: wjFinishCategory.id,
        label: "As-Cut",
        description: "No additional finishing - raw cut edge",
        price: 0,
        cost: 0,
        sku: "WJ-FIN-RAW",
        finishType: "Raw",
        orderIndex: 1,
        isDefault: true,
        attributeValues: { finish: "As-Cut", smoothness: "Medium" },
      },
      {
        categoryId: wjFinishCategory.id,
        label: "Deburred",
        description: "Remove sharp edges and burrs",
        price: 50.0,
        cost: 25.0,
        sku: "WJ-FIN-DEBUR",
        finishType: "Deburred",
        orderIndex: 2,
        attributeValues: { finish: "Deburred", smoothness: "Good" },
      },
      {
        categoryId: wjFinishCategory.id,
        label: "Sanded Smooth",
        description: "Machine sanded for smooth finish",
        price: 120.0,
        cost: 60.0,
        sku: "WJ-FIN-SAND",
        finishType: "Sanded",
        orderIndex: 3,
        isPopular: true,
        attributeValues: { finish: "Sanded", smoothness: "Very Good" },
      },
      {
        categoryId: wjFinishCategory.id,
        label: "Polished",
        description: "High-polish mirror finish (metals only)",
        price: 200.0,
        cost: 100.0,
        sku: "WJ-FIN-POLISH",
        finishType: "Polished",
        orderIndex: 4,
        attributeValues: { finish: "Polished", smoothness: "Excellent" },
      },
    ],
  });

  console.log("✅ Created Edge Finishing category with 4 options");

  const finishes = await prisma.option.findMany({
    where: { categoryId: wjFinishCategory.id },
  });
  const finRaw = finishes.find((f) => f.sku === "WJ-FIN-RAW")!;
  const finDebur = finishes.find((f) => f.sku === "WJ-FIN-DEBUR")!;
  const finSand = finishes.find((f) => f.sku === "WJ-FIN-SAND")!;
  const finPolish = finishes.find((f) => f.sku === "WJ-FIN-POLISH")!;

  // Category 5: Additional Services
  const wjServicesCategory = await prisma.category.create({
    data: {
      configuratorId: waterjetConfigurator.id,
      name: "Additional Services",
      categoryType: "ACCESSORY",
      description: "Optional add-on services",
      isPrimary: false,
      isRequired: false,
      orderIndex: 5,
      icon: "⚙️",
      minSelections: 0,
      maxSelections: 5,
    },
  });

  const wjServices = await prisma.option.createMany({
    data: [
      {
        categoryId: wjServicesCategory.id,
        label: "CAD File Conversion",
        description: "Convert your design files to cutting-ready format",
        price: 50.0,
        cost: 25.0,
        sku: "WJ-SRV-CAD",
        orderIndex: 1,
        attributeValues: { service: "CAD Conversion" },
      },
      {
        categoryId: wjServicesCategory.id,
        label: "Rush Processing (24hr)",
        description: "Priority processing and cutting",
        price: 300.0,
        cost: 150.0,
        sku: "WJ-SRV-RUSH",
        orderIndex: 2,
        attributeValues: { service: "Rush", turnaround: "24 hours" },
      },
      {
        categoryId: wjServicesCategory.id,
        label: "Protective Coating",
        description: "Apply anti-corrosion coating (metals)",
        price: 100.0,
        cost: 50.0,
        sku: "WJ-SRV-COAT",
        orderIndex: 3,
        attributeValues: { service: "Coating" },
      },
      {
        categoryId: wjServicesCategory.id,
        label: "Quality Inspection Report",
        description: "Detailed dimensional inspection certificate",
        price: 75.0,
        cost: 37.5,
        sku: "WJ-SRV-QC",
        orderIndex: 4,
        attributeValues: { service: "Quality Control" },
      },
      {
        categoryId: wjServicesCategory.id,
        label: "Custom Packaging",
        description: "Foam padding and protective crating",
        price: 80.0,
        cost: 40.0,
        sku: "WJ-SRV-PKG",
        orderIndex: 5,
        attributeValues: { service: "Packaging" },
      },
    ],
  });

  console.log("✅ Created Additional Services category with 5 options");

  const services = await prisma.option.findMany({
    where: { categoryId: wjServicesCategory.id },
  });
  const srvCoat = services.find((s) => s.sku === "WJ-SRV-COAT")!;
  const srvRush = services.find((s) => s.sku === "WJ-SRV-RUSH")!;

  // ========================================
  // CREATE INCOMPATIBILITIES
  // ========================================

  // Glass can't be thicker than 19mm
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: glass.id,
        incompatibleOptionId: t25mm.id,
        severity: "error",
        message: "Tempered glass cannot exceed 19mm thickness",
      },
      {
        optionId: glass.id,
        incompatibleOptionId: t50mm.id,
        severity: "error",
        message: "Tempered glass cannot exceed 19mm thickness",
      },
    ],
  });

  // Carbon fiber can't be thicker than 12mm
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: carbon.id,
        incompatibleOptionId: t19mm.id,
        severity: "error",
        message: "Carbon fiber composite limited to 12mm maximum thickness",
      },
      {
        optionId: carbon.id,
        incompatibleOptionId: t25mm.id,
        severity: "error",
        message: "Carbon fiber composite limited to 12mm maximum thickness",
      },
      {
        optionId: carbon.id,
        incompatibleOptionId: t50mm.id,
        severity: "error",
        message: "Carbon fiber composite limited to 12mm maximum thickness",
      },
    ],
  });

  // Titanium and Copper can't be thicker than 25mm
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: titanium.id,
        incompatibleOptionId: t50mm.id,
        severity: "error",
        message: "Titanium cutting limited to 25mm maximum thickness",
      },
      {
        optionId: copper.id,
        incompatibleOptionId: t50mm.id,
        severity: "error",
        message: "Copper cutting limited to 25mm maximum thickness",
      },
    ],
  });

  // Polished finish only works with metals
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: finPolish.id,
        incompatibleOptionId: granite.id,
        severity: "error",
        message: "Polished finish only available for metal materials",
      },
      {
        optionId: finPolish.id,
        incompatibleOptionId: glass.id,
        severity: "error",
        message: "Polished finish only available for metal materials",
      },
      {
        optionId: finPolish.id,
        incompatibleOptionId: carbon.id,
        severity: "error",
        message: "Polished finish only available for metal materials",
      },
    ],
  });

  // Protective coating only for metals
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: srvCoat.id,
        incompatibleOptionId: granite.id,
        severity: "warning",
        message: "Protective coating designed for metal materials",
      },
      {
        optionId: srvCoat.id,
        incompatibleOptionId: glass.id,
        severity: "warning",
        message: "Protective coating designed for metal materials",
      },
    ],
  });

  // Ultra precision with thick materials takes too long
  await prisma.optionIncompatibility.createMany({
    data: [
      {
        optionId: precUltra.id,
        incompatibleOptionId: t50mm.id,
        severity: "warning",
        message:
          "Ultra precision with 50mm thickness results in very long cutting times",
      },
    ],
  });

  console.log("✅ Created 17 incompatibility rules");

  // ========================================
  // CREATE DEPENDENCIES
  // ========================================

  // Rush processing requires Standard or High precision (not Ultra - too slow)
  await prisma.optionDependency.create({
    data: {
      optionId: srvRush.id,
      dependsOnOptionId: precStd.id,
      dependencyType: "requires_one_of",
    },
  });

  console.log("✅ Created dependencies");

  // Create a sample quote for water jet
  const wjQuote = await prisma.quote.create({
    data: {
      clientId: client.id,
      configuratorId: waterjetConfigurator.id,
      customerEmail: "engineer@manufacturing.com",
      customerName: "Sarah Johnson",
      customerPhone: "+1-555-0199",
      customerCompany: "Precision Manufacturing Inc.",
      title: "Custom Bracket Parts - Stainless Steel",
      selectedOptions: {
        material: "Stainless Steel 304",
        thickness: '1/2" (12mm)',
        precision: "High (±0.05mm)",
        finish: "Sanded Smooth",
        services: ["CAD File Conversion", "Quality Inspection Report"],
      },
      totalPrice: 545.0,
      subtotal: 545.0,
      status: "PENDING",
      customerNotes:
        "Need 20 pieces of custom mounting brackets. Will send DXF files upon confirmation.",
    },
  });

  console.log("✅ Created water jet sample quote:", wjQuote.quoteCode);

  console.log("🎉 Seed completed successfully!");
  console.log("📊 Summary:");
  console.log("- 1 Client (demo@example.com / password123)");
  console.log("- 1 Theme (Modern Light Theme)");
  console.log("- 2 Configurators (Custom Sofa + Water Jet Cutting)");
  console.log("- Sofa: 6 Categories, 28 Options");
  console.log(
    "- Water Jet: 5 Categories, 26 Options, 17 Incompatibilities, 1 Dependency"
  );
  console.log("- 2 Sample Quotes");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
