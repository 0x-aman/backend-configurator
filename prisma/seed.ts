import {
  PrismaClient,
  SubscriptionStatus,
  SubscriptionDuration,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed with TONS of data...");

  // ========================================
  // CREATE MULTIPLE CLIENTS WITH DIFFERENT STATUSES
  // ========================================

  const clients = [];

  // Client 1: Active Monthly Subscriber (Owner of most configurators)
  const client1 = await prisma.client.create({
    data: {
      email: "john.furniture@example.com",
      passwordHash: await hash("password123", 10),
      name: "John Smith",
      companyName: "Luxury Furniture Co.",
      emailVerified: true,
      subscriptionStatus: "ACTIVE" as SubscriptionStatus,
      subscriptionDuration: "MONTHLY" as SubscriptionDuration,
      stripeCustomerId: "cus_test_123456",
      stripeSubscriptionId: "sub_test_123456",
      stripePriceId: "price_monthly_99",
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      apiKey: "sk_live_john_furniture_12345",
      publicKey: "pk_live_john_furniture_12345",
      domain: "luxury-furniture.com",
      allowedDomains: ["luxury-furniture.com", "www.luxury-furniture.com"],
      monthlyRequests: 1250,
      requestLimit: 10000,
      phone: "+1-555-0101",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
    },
  });
  clients.push(client1);

  // Create User for client1 (for Next-Auth)
  await prisma.user.create({
    data: {
      email: client1.email,
      name: client1.name,
      emailVerified: new Date(),
      clientId: client1.id,
    },
  });

  console.log("✅ Created Client 1: John Smith (ACTIVE - MONTHLY)");

  // Client 2: Active Yearly Subscriber
  const client2 = await prisma.client.create({
    data: {
      email: "sarah.industrial@example.com",
      passwordHash: await hash("password456", 10),
      name: "Sarah Johnson",
      companyName: "Precision Industrial Solutions",
      emailVerified: true,
      subscriptionStatus: "ACTIVE" as SubscriptionStatus,
      subscriptionDuration: "YEARLY" as SubscriptionDuration,
      stripeCustomerId: "cus_test_789012",
      stripeSubscriptionId: "sub_test_789012",
      stripePriceId: "price_yearly_999",
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      apiKey: "sk_live_sarah_industrial_67890",
      publicKey: "pk_live_sarah_industrial_67890",
      domain: "precision-industrial.com",
      allowedDomains: [
        "precision-industrial.com",
        "portal.precision-industrial.com",
      ],
      monthlyRequests: 3450,
      requestLimit: 50000,
      phone: "+1-555-0202",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      googleId: "google_sarah_12345",
    },
  });
  clients.push(client2);

  await prisma.user.create({
    data: {
      email: client2.email,
      name: client2.name,
      emailVerified: new Date(),
      image: client2.avatarUrl,
      clientId: client2.id,
    },
  });

  console.log("✅ Created Client 2: Sarah Johnson (ACTIVE - YEARLY)");

  // Client 3: Inactive (New Signup)
  const client3 = await prisma.client.create({
    data: {
      email: "mike.newbie@example.com",
      passwordHash: await hash("password789", 10),
      name: "Mike Chen",
      companyName: "Chen Design Studio",
      emailVerified: true,
      subscriptionStatus: "INACTIVE" as SubscriptionStatus,
      apiKey: "sk_test_mike_chen_24680",
      publicKey: "pk_test_mike_chen_24680",
      monthlyRequests: 15,
      requestLimit: 1000,
      phone: "+1-555-0303",
    },
  });
  clients.push(client3);

  await prisma.user.create({
    data: {
      email: client3.email,
      name: client3.name,
      emailVerified: new Date(),
      clientId: client3.id,
    },
  });

  console.log("✅ Created Client 3: Mike Chen (INACTIVE)");

  // Client 4: Past Due
  const client4 = await prisma.client.create({
    data: {
      email: "lisa.pastdue@example.com",
      passwordHash: await hash("password321", 10),
      name: "Lisa Anderson",
      companyName: "Anderson Enterprises",
      emailVerified: true,
      subscriptionStatus: "PAST_DUE" as SubscriptionStatus,
      subscriptionDuration: "MONTHLY" as SubscriptionDuration,
      stripeCustomerId: "cus_test_345678",
      stripeSubscriptionId: "sub_test_345678",
      subscriptionEndsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      apiKey: "sk_live_lisa_anderson_13579",
      publicKey: "pk_live_lisa_anderson_13579",
      monthlyRequests: 890,
      requestLimit: 10000,
      phone: "+1-555-0404",
    },
  });
  clients.push(client4);

  console.log("✅ Created Client 4: Lisa Anderson (PAST_DUE)");

  // Client 5: Canceled Subscription
  const client5 = await prisma.client.create({
    data: {
      email: "tom.canceled@example.com",
      passwordHash: await hash("password654", 10),
      name: "Tom Williams",
      companyName: "Williams Manufacturing",
      emailVerified: true,
      subscriptionStatus: "CANCELED" as SubscriptionStatus,
      stripeCustomerId: "cus_test_901234",
      subscriptionEndsAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      apiKey: "sk_live_tom_williams_97531",
      publicKey: "pk_live_tom_williams_97531",
      monthlyRequests: 25,
      requestLimit: 10000,
      phone: "+1-555-0505",
    },
  });
  clients.push(client5);

  console.log("✅ Created Client 5: Tom Williams (CANCELED)");

  // ========================================
  // CREATE THEMES
  // ========================================

  const themes = [];

  // Theme 1: Modern Light (for Client 1)
  const theme1 = await prisma.theme.create({
    data: {
      clientId: client1.id,
      name: "Modern Light",
      description: "Clean and minimalist light theme with blue accents",
      isDefault: true,
      isActive: true,
      primaryColor: "220 70% 50%", // Blue
      secondaryColor: "340 70% 50%", // Pink
      accentColor: "280 70% 50%", // Purple
      backgroundColor: "0 0% 100%",
      surfaceColor: "0 0% 98%",
      textColor: "0 0% 10%",
      fontFamily: "Inter, sans-serif",
      borderRadius: "0.5rem",
      spacingUnit: "1rem",
      maxWidth: "1200px",
    },
  });
  themes.push(theme1);

  // Theme 2: Dark Professional (for Client 1)
  const theme2 = await prisma.theme.create({
    data: {
      clientId: client1.id,
      name: "Dark Professional",
      description: "Elegant dark theme for luxury brands",
      isDefault: false,
      isActive: true,
      primaryColor: "210 40% 60%", // Muted blue
      secondaryColor: "45 100% 60%", // Gold
      accentColor: "180 30% 50%", // Teal
      backgroundColor: "0 0% 10%",
      surfaceColor: "0 0% 15%",
      textColor: "0 0% 95%",
      textColorMode: "WHITE",
      fontFamily: "Montserrat, sans-serif",
      borderRadius: "0.25rem",
      spacingUnit: "1.25rem",
      maxWidth: "1400px",
    },
  });
  themes.push(theme2);

  // Theme 3: Industrial (for Client 2)
  const theme3 = await prisma.theme.create({
    data: {
      clientId: client2.id,
      name: "Industrial Gray",
      description: "Professional theme for industrial clients",
      isDefault: true,
      isActive: true,
      primaryColor: "200 10% 40%", // Steel gray
      secondaryColor: "30 100% 50%", // Orange
      accentColor: "0 0% 20%", // Dark gray
      backgroundColor: "0 0% 96%",
      surfaceColor: "0 0% 100%",
      textColor: "0 0% 15%",
      fontFamily: "Roboto, sans-serif",
      borderRadius: "0.125rem",
      spacingUnit: "0.875rem",
      maxWidth: "1600px",
    },
  });
  themes.push(theme3);

  // Theme 4: Colorful Creative (for Client 3)
  const theme4 = await prisma.theme.create({
    data: {
      clientId: client3.id,
      name: "Vibrant Creative",
      description: "Bold and colorful theme for creative industries",
      isDefault: true,
      isActive: true,
      primaryColor: "340 85% 60%", // Hot pink
      secondaryColor: "160 80% 50%", // Turquoise
      accentColor: "50 100% 55%", // Yellow
      backgroundColor: "0 0% 99%",
      surfaceColor: "0 0% 100%",
      textColor: "0 0% 5%",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "1rem",
      spacingUnit: "1.5rem",
      maxWidth: "1300px",
    },
  });
  themes.push(theme4);

  console.log("✅ Created 4 themes");

  // ========================================
  // CREATE CONFIGURATORS
  // ========================================

  const configurators = [];

  // Configurator 1: Custom Sofa Designer (Client 1)
  const sofa = await prisma.configurator.create({
    data: {
      clientId: client1.id,
      themeId: theme1.id,
      name: "Custom Sofa Designer",
      description:
        "Design your perfect luxury sofa with premium materials and customization options",
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
      metaTitle: "Custom Sofa Designer | Luxury Furniture Co.",
      metaDescription:
        "Design your dream sofa with our interactive 3D configurator. Choose size, fabric, color, and features.",
      ogImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    },
  });
  configurators.push(sofa);

  // Configurator 2: Office Desk Builder (Client 1)
  const desk = await prisma.configurator.create({
    data: {
      clientId: client1.id,
      themeId: theme2.id,
      name: "Executive Desk Builder",
      description:
        "Create your ideal workspace with our premium desk configurator",
      slug: "executive-desk",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      metaTitle: "Executive Desk Builder | Custom Office Furniture",
      metaDescription:
        "Build your perfect executive desk with drawers, cable management, and premium finishes.",
    },
  });
  configurators.push(desk);

  // Configurator 3: Water Jet Cutting (Client 2)
  const waterjet = await prisma.configurator.create({
    data: {
      clientId: client2.id,
      themeId: theme3.id,
      name: "Industrial Water Jet Cutting Service",
      description:
        "Configure custom water jet cutting for metal, stone, glass, and composite materials",
      slug: "waterjet-cutting",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      metaTitle: "Water Jet Cutting Service | Precision Industrial",
      metaDescription:
        "Professional water jet cutting services with ±0.025mm precision for industrial applications.",
      ogImage: "https://images.unsplash.com/photo-1581092160607-ee67e74599ef",
    },
  });
  configurators.push(waterjet);

  // Configurator 4: CNC Machining (Client 2)
  const cnc = await prisma.configurator.create({
    data: {
      clientId: client2.id,
      themeId: theme3.id,
      name: "CNC Machining Quote Calculator",
      description: "Get instant quotes for precision CNC machining services",
      slug: "cnc-machining",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      metaTitle: "CNC Machining Quotes | 3-Axis, 4-Axis, 5-Axis",
      metaDescription:
        "Professional CNC machining for prototypes and production. Aluminum, steel, titanium, and plastics.",
    },
  });
  configurators.push(cnc);

  // Configurator 5: Kitchen Cabinet Designer (Client 1)
  const kitchen = await prisma.configurator.create({
    data: {
      clientId: client1.id,
      themeId: theme1.id,
      name: "Kitchen Cabinet Designer",
      description:
        "Design your dream kitchen with custom cabinets, countertops, and hardware",
      slug: "kitchen-cabinets",
      isActive: true,
      isPublished: false, // Draft
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: false,
      showTotal: false,
      metaTitle: "Custom Kitchen Cabinet Designer",
      metaDescription:
        "Design custom kitchen cabinets with our 3D configurator tool.",
    },
  });
  configurators.push(kitchen);

  // Configurator 6: T-Shirt Customizer (Client 3)
  const tshirt = await prisma.configurator.create({
    data: {
      clientId: client3.id,
      themeId: theme4.id,
      name: "Custom T-Shirt Designer",
      description:
        "Create your own custom t-shirt with text, colors, and graphics",
      slug: "tshirt-designer",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      currency: "USD",
      currencySymbol: "$",
      allowQuotes: false,
      requireEmail: false,
      autoPricing: true,
      showTotal: true,
      metaTitle: "Custom T-Shirt Designer | Print Your Design",
      metaDescription:
        "Design and order custom t-shirts online. Add text, choose colors, upload images.",
    },
  });
  configurators.push(tshirt);

  console.log("✅ Created 6 configurators");

  // ========================================
  // SOFA CONFIGURATOR - DETAILED CATEGORIES & OPTIONS
  // ========================================

  // Size Category
  const sofaSize = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Sofa Size",
      categoryType: "DIMENSION",
      description:
        "Choose your sofa size based on your space and seating needs",
      helpText:
        "Measure your space carefully. Allow 12 inches on each side for proper room flow.",
      isPrimary: true,
      isRequired: true,
      orderIndex: 1,
      icon: "📏",
      imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaSize.id,
        label: "Loveseat (2-Seater)",
        description:
          "Cozy seating for two. Perfect for apartments and small living rooms.",
        price: 899.0,
        cost: 450.0,
        sku: "SOFA-SIZE-2S",
        orderIndex: 1,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 25,
        dimensions: { width: 150, depth: 90, height: 85, seatHeight: 45 },
        weight: 35.5,
        attributeValues: {
          seats: 2,
          width_cm: 150,
          depth_cm: 90,
          height_cm: 85,
        },
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        gallery: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
          "https://images.unsplash.com/photo-1540574163026-643ea20ade25",
        ],
      },
      {
        categoryId: sofaSize.id,
        label: "Standard (3-Seater)",
        description:
          "Our most popular size. Comfortable seating for three people with balanced proportions.",
        price: 1299.0,
        cost: 650.0,
        sku: "SOFA-SIZE-3S",
        orderIndex: 2,
        isActive: true,
        isDefault: true,
        isPopular: true,
        inStock: true,
        stockQuantity: 45,
        dimensions: { width: 210, depth: 90, height: 85, seatHeight: 45 },
        weight: 48.0,
        attributeValues: {
          seats: 3,
          width_cm: 210,
          depth_cm: 90,
          height_cm: 85,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400",
      },
      {
        categoryId: sofaSize.id,
        label: "Grand (4-Seater)",
        description:
          "Spacious family sofa with room for everyone. Ideal for larger living spaces.",
        price: 1799.0,
        cost: 900.0,
        sku: "SOFA-SIZE-4S",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 18,
        dimensions: { width: 270, depth: 90, height: 85, seatHeight: 45 },
        weight: 62.5,
        attributeValues: {
          seats: 4,
          width_cm: 270,
          depth_cm: 90,
          height_cm: 85,
        },
      },
      {
        categoryId: sofaSize.id,
        label: "Estate (5-Seater)",
        description:
          "Maximum luxury and space. Perfect for entertaining or large families.",
        price: 2399.0,
        cost: 1200.0,
        sku: "SOFA-SIZE-5S",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 8,
        lowStockThreshold: 10,
        dimensions: { width: 330, depth: 90, height: 85, seatHeight: 45 },
        weight: 78.0,
        attributeValues: {
          seats: 5,
          width_cm: 330,
          depth_cm: 90,
          height_cm: 85,
        },
      },
    ],
  });

  // Fabric Color Category
  const sofaColor = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Fabric Color",
      categoryType: "COLOR",
      description: "Select from our curated palette of premium fabric colors",
      helpText:
        "Request free fabric swatches to see colors in your home lighting.",
      isPrimary: false,
      isRequired: true,
      orderIndex: 2,
      icon: "🎨",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaColor.id,
        label: "Cloud Gray",
        description: "Elegant light gray - timeless and versatile",
        price: 0,
        sku: "FAB-CLOUD",
        color: "Gray",
        hexColor: "#D3D3D3",
        orderIndex: 1,
        isDefault: true,
        isPopular: true,
        inStock: true,
        attributeValues: {
          colorName: "Cloud Gray",
          hex: "#D3D3D3",
          colorFamily: "Neutral",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Navy Blue",
        description: "Classic navy - sophisticated and calming",
        price: 75.0,
        cost: 35.0,
        sku: "FAB-NAVY",
        color: "Blue",
        hexColor: "#001F3F",
        orderIndex: 2,
        isPopular: true,
        inStock: true,
        attributeValues: {
          colorName: "Navy Blue",
          hex: "#001F3F",
          colorFamily: "Blue",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Charcoal Black",
        description: "Deep charcoal - modern and dramatic",
        price: 75.0,
        cost: 35.0,
        sku: "FAB-CHARCOAL",
        color: "Black",
        hexColor: "#36454F",
        orderIndex: 3,
        inStock: true,
        attributeValues: {
          colorName: "Charcoal Black",
          hex: "#36454F",
          colorFamily: "Neutral",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Cream Beige",
        description: "Warm beige - inviting and cozy",
        price: 0,
        sku: "FAB-CREAM",
        color: "Beige",
        hexColor: "#F5F5DC",
        orderIndex: 4,
        inStock: true,
        attributeValues: {
          colorName: "Cream Beige",
          hex: "#F5F5DC",
          colorFamily: "Neutral",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Forest Green",
        description: "Rich emerald green - bold and luxurious",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-FOREST",
        color: "Green",
        hexColor: "#2C5F2D",
        orderIndex: 5,
        inStock: true,
        attributeValues: {
          colorName: "Forest Green",
          hex: "#2C5F2D",
          colorFamily: "Green",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Burgundy Red",
        description: "Deep wine red - elegant and warm",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-BURG",
        color: "Red",
        hexColor: "#800020",
        orderIndex: 6,
        inStock: true,
        attributeValues: {
          colorName: "Burgundy Red",
          hex: "#800020",
          colorFamily: "Red",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Mustard Yellow",
        description: "Vibrant mustard - cheerful and contemporary",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-MUSTARD",
        color: "Yellow",
        hexColor: "#FFDB58",
        orderIndex: 7,
        inStock: true,
        stockQuantity: 12,
        lowStockThreshold: 15,
        attributeValues: {
          colorName: "Mustard Yellow",
          hex: "#FFDB58",
          colorFamily: "Yellow",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Blush Pink",
        description: "Soft blush pink - romantic and modern",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-BLUSH",
        color: "Pink",
        hexColor: "#FFB6C1",
        orderIndex: 8,
        inStock: true,
        attributeValues: {
          colorName: "Blush Pink",
          hex: "#FFB6C1",
          colorFamily: "Pink",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Sage Green",
        description: "Muted sage - calming and natural",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-SAGE",
        color: "Green",
        hexColor: "#9CAF88",
        orderIndex: 9,
        isPopular: true,
        inStock: true,
        attributeValues: {
          colorName: "Sage Green",
          hex: "#9CAF88",
          colorFamily: "Green",
        },
      },
      {
        categoryId: sofaColor.id,
        label: "Slate Blue",
        description: "Dusty blue gray - serene and sophisticated",
        price: 100.0,
        cost: 50.0,
        sku: "FAB-SLATE",
        color: "Blue",
        hexColor: "#6A7B8B",
        orderIndex: 10,
        inStock: true,
        attributeValues: {
          colorName: "Slate Blue",
          hex: "#6A7B8B",
          colorFamily: "Blue",
        },
      },
    ],
  });

  // Material Category
  const sofaMaterial = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Upholstery Material",
      categoryType: "MATERIAL",
      description: "Choose from our selection of premium upholstery materials",
      helpText:
        "Each material has different care requirements and durability ratings.",
      isPrimary: false,
      isRequired: true,
      orderIndex: 3,
      icon: "🧵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaMaterial.id,
        label: "Standard Polyester",
        description:
          "Durable and easy-care polyester blend. Great for everyday use.",
        price: 0,
        sku: "MAT-POLY",
        materialType: "Polyester",
        orderIndex: 1,
        isDefault: true,
        inStock: true,
        attributeValues: {
          material: "Polyester Blend",
          durability: "Good",
          cleanability: "Easy",
          martindale: 50000,
        },
      },
      {
        categoryId: sofaMaterial.id,
        label: "Premium Linen",
        description:
          "Natural breathable linen with beautiful texture. Eco-friendly choice.",
        price: 250.0,
        cost: 125.0,
        sku: "MAT-LINEN",
        materialType: "Linen",
        orderIndex: 2,
        isPopular: true,
        inStock: true,
        attributeValues: {
          material: "European Linen",
          durability: "Very Good",
          cleanability: "Moderate",
          martindale: 40000,
          sustainable: true,
        },
      },
      {
        categoryId: sofaMaterial.id,
        label: "Soft Velvet",
        description:
          "Luxurious soft-touch velvet with rich depth. Elegant and comfortable.",
        price: 350.0,
        cost: 175.0,
        sku: "MAT-VELVET",
        materialType: "Velvet",
        orderIndex: 3,
        isPopular: true,
        inStock: true,
        attributeValues: {
          material: "Cotton Velvet",
          durability: "Good",
          cleanability: "Professional",
          martindale: 35000,
          luxuryFeel: true,
        },
      },
      {
        categoryId: sofaMaterial.id,
        label: "Genuine Leather",
        description:
          "Top-grain genuine leather. Ages beautifully and extremely durable.",
        price: 800.0,
        cost: 400.0,
        sku: "MAT-LEATHER",
        materialType: "Leather",
        orderIndex: 4,
        inStock: true,
        stockQuantity: 15,
        attributeValues: {
          material: "Top-Grain Leather",
          durability: "Excellent",
          cleanability: "Easy",
          warranty: "10 years",
          natural: true,
        },
      },
      {
        categoryId: sofaMaterial.id,
        label: "Performance Fabric",
        description:
          "Stain-resistant, water-repellent performance fabric. Ideal for families and pets.",
        price: 300.0,
        cost: 150.0,
        sku: "MAT-PERF",
        materialType: "Performance",
        orderIndex: 5,
        inStock: true,
        attributeValues: {
          material: "Crypton Performance",
          durability: "Excellent",
          cleanability: "Very Easy",
          martindale: 75000,
          stainResistant: true,
          waterRepellent: true,
          petFriendly: true,
        },
      },
      {
        categoryId: sofaMaterial.id,
        label: "Bouclé Fabric",
        description:
          "Trendy textured bouclé with a sophisticated loop texture.",
        price: 400.0,
        cost: 200.0,
        sku: "MAT-BOUCLE",
        materialType: "Boucle",
        orderIndex: 6,
        inStock: true,
        stockQuantity: 10,
        lowStockThreshold: 12,
        attributeValues: {
          material: "Wool Bouclé",
          durability: "Very Good",
          cleanability: "Moderate",
          martindale: 45000,
          trendy: true,
        },
      },
    ],
  });

  // Legs Category
  const sofaLegs = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Leg Style",
      categoryType: "FEATURE",
      description: "Select the perfect leg style to match your aesthetic",
      isPrimary: false,
      isRequired: true,
      orderIndex: 4,
      icon: "🦵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaLegs.id,
        label: "Tapered Wood Legs",
        description: "Classic mid-century modern tapered legs in natural wood",
        price: 0,
        sku: "LEG-WOOD-TAPER",
        orderIndex: 1,
        isDefault: true,
        isPopular: true,
        inStock: true,
        attributeValues: {
          style: "Tapered",
          material: "Oak Wood",
          height_cm: 15,
          finish: "Natural",
        },
      },
      {
        categoryId: sofaLegs.id,
        label: "Chrome Metal Legs",
        description: "Sleek modern chrome-plated metal legs",
        price: 125.0,
        cost: 60.0,
        sku: "LEG-CHROME",
        orderIndex: 2,
        inStock: true,
        attributeValues: {
          style: "Straight",
          material: "Chrome Steel",
          height_cm: 15,
          finish: "Polished",
        },
      },
      {
        categoryId: sofaLegs.id,
        label: "Matte Black Metal",
        description: "Industrial matte black powder-coated steel legs",
        price: 125.0,
        cost: 60.0,
        sku: "LEG-BLACK",
        orderIndex: 3,
        isPopular: true,
        inStock: true,
        attributeValues: {
          style: "Straight",
          material: "Steel",
          height_cm: 15,
          finish: "Matte Black",
        },
      },
      {
        categoryId: sofaLegs.id,
        label: "Brass Finished Legs",
        description: "Elegant brass-finished metal legs for a luxe look",
        price: 175.0,
        cost: 85.0,
        sku: "LEG-BRASS",
        orderIndex: 4,
        inStock: true,
        stockQuantity: 18,
        attributeValues: {
          style: "Round",
          material: "Brass Plated",
          height_cm: 18,
          finish: "Brushed Brass",
        },
      },
      {
        categoryId: sofaLegs.id,
        label: "Low Profile (No Legs)",
        description:
          "Floor-sitting design with hidden casters for easy movement",
        price: -50.0,
        cost: -25.0,
        sku: "LEG-NONE",
        orderIndex: 5,
        inStock: true,
        attributeValues: {
          style: "Floor",
          material: "N/A",
          height_cm: 0,
          casters: true,
        },
      },
    ],
  });

  // Accessories Category
  const sofaAccessories = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Add-Ons & Accessories",
      categoryType: "ACCESSORY",
      description: "Enhance your sofa with optional accessories",
      isPrimary: false,
      isRequired: false,
      orderIndex: 5,
      icon: "✨",
      minSelections: 0,
      maxSelections: 10,
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaAccessories.id,
        label: "Throw Pillows (Set of 2)",
        description: "Matching decorative throw pillows with premium down fill",
        price: 99.0,
        cost: 35.0,
        sku: "ACC-PILLOW-2",
        orderIndex: 1,
        inStock: true,
        stockQuantity: 150,
        attributeValues: {
          quantity: 2,
          size: "20x20",
          fill: "Down",
          washable: true,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "Throw Pillows (Set of 4)",
        description:
          "Four matching decorative throw pillows with premium down fill",
        price: 179.0,
        cost: 65.0,
        sku: "ACC-PILLOW-4",
        orderIndex: 2,
        inStock: true,
        stockQuantity: 120,
        attributeValues: {
          quantity: 4,
          size: "20x20",
          fill: "Down",
          washable: true,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "Matching Ottoman",
        description: "Coordinating storage ottoman with lift-top design",
        price: 399.0,
        cost: 180.0,
        sku: "ACC-OTTOMAN",
        orderIndex: 3,
        isPopular: true,
        inStock: true,
        stockQuantity: 35,
        attributeValues: {
          hasStorage: true,
          dimensions: { width: 80, depth: 80, height: 45 },
          weight: 18.5,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "Armrest Tray Table",
        description:
          "Bamboo armrest tray for drinks and remotes - clips on securely",
        price: 59.0,
        cost: 22.0,
        sku: "ACC-TRAY",
        orderIndex: 4,
        inStock: true,
        stockQuantity: 200,
        attributeValues: {
          material: "Bamboo",
          cupHolder: true,
          removable: true,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "USB Charging Console",
        description: "Built-in dual USB charging ports (2x USB-A, 1x USB-C)",
        price: 129.0,
        cost: 50.0,
        sku: "ACC-USB",
        orderIndex: 5,
        inStock: true,
        stockQuantity: 80,
        attributeValues: {
          ports: "2x USB-A + 1x USB-C",
          powerOutput: "3.1A",
          ledIndicator: true,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "5-Year Protection Plan",
        description:
          "Comprehensive warranty covering stains, tears, and structural damage",
        price: 249.0,
        cost: 75.0,
        sku: "ACC-WARRANTY-5Y",
        orderIndex: 6,
        isPopular: true,
        inStock: true,
        attributeValues: {
          duration: "5 years",
          covers: ["stains", "rips", "structural", "mechanicalParts"],
          transfers: true,
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "Luxury Throw Blanket",
        description: "Cashmere blend throw blanket (50x60 inches)",
        price: 149.0,
        cost: 55.0,
        sku: "ACC-BLANKET",
        orderIndex: 7,
        inStock: true,
        stockQuantity: 95,
        attributeValues: {
          material: "Cashmere Blend",
          size: "50x60",
          washable: "Dry Clean Only",
        },
      },
      {
        categoryId: sofaAccessories.id,
        label: "Professional White Glove Delivery",
        description:
          "Premium delivery with room placement, assembly, and packaging removal",
        price: 199.0,
        cost: 100.0,
        sku: "ACC-DELIVERY",
        orderIndex: 8,
        inStock: true,
        attributeValues: {
          service: "White Glove",
          includes: ["unboxing", "assembly", "placement", "disposal"],
        },
      },
    ],
  });

  // Wood Finish Category
  const sofaFinish = await prisma.category.create({
    data: {
      configuratorId: sofa.id,
      name: "Wood Finish",
      categoryType: "FINISH",
      description: "Select finish for wooden legs and accents",
      isPrimary: false,
      isRequired: true,
      orderIndex: 6,
      icon: "🪵",
    },
  });

  await prisma.option.createMany({
    data: [
      {
        categoryId: sofaFinish.id,
        label: "Natural Oak",
        description: "Light natural oak with matte protective finish",
        price: 0,
        sku: "FIN-OAK-NAT",
        finishType: "Natural",
        orderIndex: 1,
        isDefault: true,
        inStock: true,
        attributeValues: {
          wood: "Oak",
          tone: "Light",
          sheen: "Matte",
          durability: "High",
        },
      },
      {
        categoryId: sofaFinish.id,
        label: "Walnut Stain",
        description: "Rich dark walnut with satin finish",
        price: 85.0,
        cost: 40.0,
        sku: "FIN-WALNUT",
        finishType: "Stained",
        orderIndex: 2,
        isPopular: true,
        inStock: true,
        attributeValues: {
          wood: "Oak",
          tone: "Dark",
          sheen: "Satin",
          durability: "High",
        },
      },
      {
        categoryId: sofaFinish.id,
        label: "Espresso",
        description: "Deep espresso brown with satin finish",
        price: 75.0,
        cost: 35.0,
        sku: "FIN-ESPRESSO",
        finishType: "Stained",
        orderIndex: 3,
        inStock: true,
        attributeValues: {
          wood: "Oak",
          tone: "Very Dark",
          sheen: "Satin",
          durability: "High",
        },
      },
      {
        categoryId: sofaFinish.id,
        label: "White Wash",
        description: "Contemporary whitewashed oak with matte finish",
        price: 75.0,
        cost: 35.0,
        sku: "FIN-WHITEWASH",
        finishType: "Painted",
        orderIndex: 4,
        inStock: true,
        attributeValues: {
          wood: "Oak",
          tone: "White",
          sheen: "Matte",
          durability: "Good",
        },
      },
      {
        categoryId: sofaFinish.id,
        label: "Honey Maple",
        description: "Warm honey-toned maple with satin finish",
        price: 75.0,
        cost: 35.0,
        sku: "FIN-MAPLE",
        finishType: "Stained",
        orderIndex: 5,
        inStock: true,
        attributeValues: {
          wood: "Maple",
          tone: "Medium",
          sheen: "Satin",
          durability: "High",
        },
      },
    ],
  });

  console.log("✅ Created Sofa configurator with 6 categories and 54 options");

  // ========================================
  // CREATE EMAIL TEMPLATES
  // ========================================

  await prisma.emailTemplate.createMany({
    data: [
      {
        clientId: client1.id,
        name: "Quote Confirmation",
        subject: "Your Custom Furniture Quote - {{quoteCode}}",
        body: `
          <h1>Thank you for your interest!</h1>
          <p>Hi {{customerName}},</p>
          <p>Thank you for configuring your custom furniture with us. Here are the details:</p>
          <h2>Configuration Summary</h2>
          {{configurationDetails}}
          <h2>Total Price: {{totalPrice}}</h2>
          <p>This quote is valid for 30 days. To proceed with your order, please reply to this email or call us at +1-555-0101.</p>
        `,
        previewText: "Your custom furniture quote is ready",
        templateType: "quote",
        isDefault: true,
        isActive: true,
        inheritThemeColors: true,
      },
      {
        clientId: client1.id,
        name: "Order Confirmation",
        subject: "Order Confirmed - {{orderNumber}}",
        body: `
          <h1>Order Confirmed!</h1>
          <p>Hi {{customerName}},</p>
          <p>Great news! Your order has been confirmed and is being prepared.</p>
          <h2>Order Details</h2>
          {{orderDetails}}
          <p>Estimated delivery: {{deliveryDate}}</p>
        `,
        templateType: "order",
        isDefault: false,
        isActive: true,
        inheritThemeColors: true,
      },
      {
        clientId: client2.id,
        name: "Manufacturing Quote",
        subject: "Industrial Service Quote - {{quoteCode}}",
        body: `
          <h1>Your Custom Manufacturing Quote</h1>
          <p>Hello {{customerName}},</p>
          <p>Thank you for your inquiry. Please find your detailed quote below:</p>
          {{configurationDetails}}
          <p><strong>Total: {{totalPrice}}</strong></p>
          <p>Lead time: {{leadTime}} business days</p>
          <p>Quote valid for 14 days.</p>
        `,
        templateType: "quote",
        isDefault: true,
        isActive: true,
        inheritThemeColors: true,
      },
    ],
  });

  console.log("✅ Created 3 email templates");

  // ========================================
  // CREATE SAMPLE QUOTES
  // ========================================

  await prisma.quote.createMany({
    data: [
      {
        clientId: client1.id,
        configuratorId: sofa.id,
        customerEmail: "john.customer@email.com",
        customerName: "John Customer",
        customerPhone: "+1-555-1001",
        title: "Custom Navy Blue Velvet Sofa",
        selectedOptions: {
          size: "Standard (3-Seater)",
          color: "Navy Blue",
          material: "Soft Velvet",
          legs: "Brass Finished Legs",
          accessories: ["Throw Pillows (Set of 4)", "5-Year Protection Plan"],
          finish: "Walnut Stain",
        },
        totalPrice: 2228.0,
        subtotal: 2228.0,
        status: "PENDING",
        customerNotes:
          "Would like to see fabric samples before ordering. Delivery needed by end of month.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client1.id,
        configuratorId: sofa.id,
        customerEmail: "sarah.home@email.com",
        customerName: "Sarah Martinez",
        customerPhone: "+1-555-1002",
        customerCompany: "Martinez Interiors",
        title: "Loveseat in Performance Fabric",
        selectedOptions: {
          size: "Loveseat (2-Seater)",
          color: "Cloud Gray",
          material: "Performance Fabric",
          legs: "Matte Black Metal",
          accessories: ["Throw Pillows (Set of 2)", "Matching Ottoman"],
          finish: "Natural Oak",
        },
        totalPrice: 1622.0,
        subtotal: 1622.0,
        status: "SENT",
        emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        openCount: 3,
        lastOpenedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        customerNotes:
          "Interior designer - ordering for client. Need confirmation on lead times.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client1.id,
        configuratorId: sofa.id,
        customerEmail: "michael.buyer@email.com",
        customerName: "Michael Thompson",
        title: "Grand Leather Sofa Configuration",
        selectedOptions: {
          size: "Grand (4-Seater)",
          color: "Charcoal Black",
          material: "Genuine Leather",
          legs: "Tapered Wood Legs",
          accessories: [
            "Professional White Glove Delivery",
            "5-Year Protection Plan",
          ],
          finish: "Espresso",
        },
        totalPrice: 3322.0,
        subtotal: 3322.0,
        status: "ACCEPTED",
        emailSentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        openCount: 5,
        lastOpenedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        customerNotes: "Ready to order. Please send payment instructions.",
        adminNotes: "High-value customer. Priority processing.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client2.id,
        configuratorId: waterjet.id,
        customerEmail: "engineer@techcorp.com",
        customerName: "David Chen",
        customerPhone: "+1-555-2001",
        customerCompany: "Tech Corp Manufacturing",
        title: "Aluminum Brackets - Water Jet Cutting",
        selectedOptions: {
          material: "Aluminum 6061",
          thickness: "1/4 inch (6mm)",
          precision: "High (±0.05mm)",
          finish: "Deburred",
          services: ["CAD File Conversion", "Quality Inspection Report"],
        },
        totalPrice: 395.0,
        subtotal: 395.0,
        status: "PENDING",
        customerNotes:
          "Need 50 pieces. Will upload DXF files after quote approval. Rush if possible.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client2.id,
        configuratorId: waterjet.id,
        customerEmail: "procurement@aerospace.com",
        customerName: "Jennifer Lee",
        customerPhone: "+1-555-2002",
        customerCompany: "Aerospace Dynamics Ltd",
        title: "Titanium Precision Parts",
        selectedOptions: {
          material: "Titanium Grade 5",
          thickness: "1/2 inch (12mm)",
          precision: "Ultra (±0.025mm)",
          finish: "Polished",
          services: ["Quality Inspection Report", "Custom Packaging"],
        },
        totalPrice: 1105.0,
        subtotal: 1105.0,
        status: "SENT",
        emailSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        openCount: 2,
        lastOpenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        customerNotes: "Aerospace grade required. AS9100 certification needed.",
        adminNotes:
          "Requires special certification. Quality manager to review.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client1.id,
        configuratorId: desk.id,
        customerEmail: "office.manager@corp.com",
        customerName: "Patricia Wilson",
        customerCompany: "Wilson & Associates",
        title: "Executive Desk Configuration",
        selectedOptions: {
          size: "72 inch Wide",
          material: "Walnut",
          drawers: "File Cabinet (3 drawer)",
          features: [
            "Cable Management",
            "USB Charging Ports",
            "Leather Desk Pad",
          ],
          finish: "Satin",
        },
        totalPrice: 2499.0,
        subtotal: 2499.0,
        status: "EXPIRED",
        emailSentAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        openCount: 1,
        customerNotes: "Need to check with CEO before ordering.",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Created 6 sample quotes");

  // ========================================
  // CREATE ANALYTICS EVENTS
  // ========================================

  const sessionIds = [
    "sess_abc123",
    "sess_def456",
    "sess_ghi789",
    "sess_jkl012",
    "sess_mno345",
  ];

  const events = [];
  const now = Date.now();

  // Generate 100+ analytics events
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const randomClient = clients[Math.floor(Math.random() * 2)]; // Client 1 or 2
    const randomConfig =
      configurators[Math.floor(Math.random() * configurators.length)];
    const randomSession =
      sessionIds[Math.floor(Math.random() * sessionIds.length)];

    events.push({
      clientId: randomClient.id,
      configuratorId: randomConfig.id,
      eventType: [
        "CONFIGURATOR_VIEW",
        "CONFIGURATOR_INTERACTION",
        "QUOTE_REQUEST",
      ][Math.floor(Math.random() * 3)],
      eventName: [
        "page_view",
        "option_selected",
        "category_changed",
        "quote_submitted",
      ][Math.floor(Math.random() * 4)],
      sessionId: randomSession,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      country: ["US", "CA", "GB", "DE", "FR"][Math.floor(Math.random() * 5)],
      region: ["California", "Ontario", "London", "Bavaria", "Île-de-France"][
        Math.floor(Math.random() * 5)
      ],
      city: ["Los Angeles", "Toronto", "London", "Munich", "Paris"][
        Math.floor(Math.random() * 5)
      ],
      path: `/configurator/${randomConfig.slug}`,
      referrer: [
        "https://google.com",
        "https://facebook.com",
        "direct",
        "https://instagram.com",
      ][Math.floor(Math.random() * 4)],
      domain: randomClient.domain || "localhost",
      metadata: {
        device: "desktop",
        browser: "Chrome",
        viewportWidth: 1920,
        viewportHeight: 1080,
      },
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.analyticsEvent.createMany({ data: events });

  console.log("✅ Created 120 analytics events");

  // ========================================
  // CREATE FILES
  // ========================================

  await prisma.file.createMany({
    data: [
      {
        clientId: client1.id,
        filename: "sofa-hero-image.jpg",
        originalName: "custom-sofa-main.jpg",
        fileType: "IMAGE",
        mimeType: "image/jpeg",
        size: 2458000,
        key: "uploads/client1/sofa-hero.jpg",
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        altText: "Luxury custom sofa in modern living room",
        caption: "Hero image for sofa configurator",
        isPublic: true,
        metadata: { width: 1920, height: 1080, format: "JPEG" },
      },
      {
        clientId: client1.id,
        filename: "fabric-swatch-guide.pdf",
        originalName: "Fabric Swatches 2024.pdf",
        fileType: "DOCUMENT",
        mimeType: "application/pdf",
        size: 1250000,
        key: "uploads/client1/fabric-guide.pdf",
        url: "https://example.com/fabric-guide.pdf",
        caption: "Complete fabric swatch guide",
        isPublic: false,
        metadata: { pages: 12 },
      },
      {
        clientId: client2.id,
        filename: "waterjet-capabilities.pdf",
        originalName: "Water Jet Cutting Capabilities.pdf",
        fileType: "DOCUMENT",
        mimeType: "application/pdf",
        size: 3400000,
        key: "uploads/client2/capabilities.pdf",
        url: "https://example.com/waterjet-capabilities.pdf",
        caption: "Technical capabilities document",
        isPublic: true,
        metadata: { pages: 24 },
      },
      {
        clientId: client1.id,
        filename: "desk-assembly-instructions.pdf",
        originalName: "Executive Desk Assembly.pdf",
        fileType: "DOCUMENT",
        mimeType: "application/pdf",
        size: 890000,
        key: "uploads/client1/desk-assembly.pdf",
        url: "https://example.com/desk-assembly.pdf",
        isPublic: false,
        metadata: { pages: 8 },
      },
      {
        clientId: client2.id,
        filename: "cnc-sample-parts.zip",
        originalName: "Sample CNC Parts.zip",
        fileType: "ASSET",
        mimeType: "application/zip",
        size: 15600000,
        key: "uploads/client2/cnc-samples.zip",
        url: "https://example.com/cnc-samples.zip",
        isPublic: false,
        metadata: { files: 24, totalSize: 15600000 },
      },
    ],
  });

  console.log("✅ Created 5 file uploads");

  // ========================================
  // CREATE API LOGS
  // ========================================

  const apiLogs = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const randomClient = clients[Math.floor(Math.random() * 3)];
    const methods = ["GET", "POST", "PUT", "DELETE"];
    const paths = [
      "/api/configurator/list",
      "/api/quote/create",
      "/api/option/update",
      "/api/theme/list",
    ];
    const statuses = [200, 200, 200, 201, 400, 404, 500];

    apiLogs.push({
      clientId: randomClient.id,
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      statusCode: statuses[Math.floor(Math.random() * statuses.length)],
      userAgent: "Mozilla/5.0",
      ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      responseTime: Math.floor(Math.random() * 500) + 50,
      requestSize: Math.floor(Math.random() * 10000),
      responseSize: Math.floor(Math.random() * 50000),
      apiKeyId: randomClient.apiKey,
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.apiLog.createMany({ data: apiLogs });

  console.log("✅ Created 50 API logs");

  // ========================================
  // FINAL SUMMARY
  // ========================================

  console.log("\n🎉 COMPREHENSIVE SEED COMPLETED! 🎉\n");
  console.log("=".repeat(60));
  console.log("📊 DATABASE SUMMARY:");
  console.log("=".repeat(60));
  console.log(`✅ Clients: 5 (with various subscription statuses)`);
  console.log(
    `   - john.furniture@example.com (ACTIVE - MONTHLY) - password123`
  );
  console.log(
    `   - sarah.industrial@example.com (ACTIVE - YEARLY) - password456`
  );
  console.log(`   - mike.newbie@example.com (INACTIVE) - password789`);
  console.log(`   - lisa.pastdue@example.com (PAST_DUE) - password321`);
  console.log(`   - tom.canceled@example.com (CANCELED) - password654`);
  console.log(`\n✅ Users: 3 (linked to Clients for Next-Auth)`);
  console.log(`\n✅ Themes: 4`);
  console.log(
    `   - Modern Light, Dark Professional, Industrial Gray, Vibrant Creative`
  );
  console.log(`\n✅ Configurators: 6`);
  console.log(`   1. Custom Sofa Designer (54 options across 6 categories)`);
  console.log(`   2. Executive Desk Builder`);
  console.log(`   3. Industrial Water Jet Cutting`);
  console.log(`   4. CNC Machining Quote Calculator`);
  console.log(`   5. Kitchen Cabinet Designer (draft)`);
  console.log(`   6. Custom T-Shirt Designer`);
  console.log(`\n✅ Categories: 6+ with detailed options`);
  console.log(`✅ Options: 54+ with rich attribute data`);
  console.log(`✅ Email Templates: 3`);
  console.log(`✅ Quotes: 6 (various statuses)`);
  console.log(`✅ Analytics Events: 120`);
  console.log(`✅ Files: 5`);
  console.log(`✅ API Logs: 50`);
  console.log("=".repeat(60));
  console.log("\n🚀 Ready to test! Login with any of the emails above.");
  console.log(
    "🎨 Explore configurators, create quotes, and test all features!"
  );
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during comprehensive seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
