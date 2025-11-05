import {
  PrismaClient,
  SubscriptionStatus,
  SubscriptionDuration,
  CategoryType,
  QuoteStatus,
  FileType,
  AnalyticsEventType,
  TextColorMode,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed with real file URLs...");

  // ========================================
  // CREATE SINGLE CLIENT
  // ========================================

  const client = await prisma.client.create({
    data: {
      email: "test@gmail.com",
      passwordHash: await hash("password123", 10),
      name: "Alex Johnson",
      companyName: "Tech Solutions Inc.",
      emailVerified: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionDuration: SubscriptionDuration.MONTHLY,
      stripeCustomerId: "cus_tech_solutions_001",
      stripeSubscriptionId: "sub_tech_solutions_001",
      stripePriceId: "price_monthly_99",
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      apiKey: "sk_live_tech_solutions_001",
      publicKey: "pk_live_tech_solutions_001",
      domain: "tech-solutions.com",
      allowedDomains: ["tech-solutions.com", "www.tech-solutions.com"],
      monthlyRequests: 850,
      requestLimit: 10000,
      phone: "+1-555-0100",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      monthlyPrice: 99.0,
      yearlyPrice: 999.0,
    },
  });

  // Create User for client (for Next-Auth)
  await prisma.user.create({
    data: {
      email: client.email,
      name: client.name,
      emailVerified: new Date(),
      clientId: client.id,
      image: client.avatarUrl,
    },
  });

  console.log("✅ Created Client: Alex Johnson (ACTIVE - MONTHLY)");

  // ========================================
  // CREATE THEME
  // ========================================

  const theme = await prisma.theme.create({
    data: {
      clientId: client.id,
      name: "Professional Blue",
      description: "Clean professional theme with blue accents",
      isDefault: true,
      isActive: true,
      primaryColor: "210 100% 50%",
      secondaryColor: "340 70% 50%",
      accentColor: "160 80% 40%",
      backgroundColor: "0 0% 100%",
      surfaceColor: "0 0% 98%",
      textColor: "0 0% 10%",
      textColorMode: TextColorMode.AUTO,
      fontFamily: "Inter, sans-serif",
      borderRadius: "0.5rem",
      spacingUnit: "1rem",
      maxWidth: "1200px",
    },
  });

  console.log("✅ Created theme: Professional Blue");

  // ========================================
  // CREATE SINGLE CONFIGURATOR - CUSTOM GAMING PC BUILDER
  // ========================================

  const gamingPC = await prisma.configurator.create({
    data: {
      clientId: client.id,
      themeId: theme.id,
      name: "Custom Gaming PC Builder",
      description:
        "Build your ultimate gaming PC with premium components and real-time compatibility checking",
      slug: "custom-gaming-pc",
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      currency: "USD",
      currencySymbol: "$",
      language: "en",
      timezone: "UTC",
      metaTitle: "Custom Gaming PC Builder | Tech Solutions Inc.",
      metaDescription:
        "Design your dream gaming PC with our interactive configurator. Choose CPUs, GPUs, RAM, storage and more.",
      ogImage:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=630&fit=crop",
      allowQuotes: true,
      requireEmail: true,
      autoPricing: true,
      showTotal: true,
      accessToken: "config_token_gaming_pc_001",
    },
  });

  console.log("✅ Created Configurator: Custom Gaming PC Builder");

  // ========================================
  // GAMING PC CONFIGURATOR - 5 CATEGORIES
  // ========================================

  // Category 1: Processor (CPU) - REQUIRED
  const cpuCategory = await prisma.category.create({
    data: {
      configuratorId: gamingPC.id,
      name: "Processor (CPU)",
      categoryType: CategoryType.POWER,
      description: "Select the brain of your gaming PC",
      helpText:
        "Higher core counts and clock speeds improve gaming performance",
      isPrimary: true,
      isRequired: true,
      orderIndex: 1,
      icon: "⚡",
      imageUrl:
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=400&fit=crop",
      minSelections: 1,
      maxSelections: 1,
      attributesTemplate: [
        {
          name: "brand",
          type: "SELECT",
          label: "Brand",
          options: ["Intel", "AMD"],
        },
        {
          name: "cores",
          type: "NUMBER",
          label: "Core Count",
        },
        {
          name: "threads",
          type: "NUMBER",
          label: "Thread Count",
        },
        {
          name: "socket",
          type: "SELECT",
          label: "Socket Type",
          options: ["LGA1700", "AM5"],
        },
        {
          name: "tdp",
          type: "NUMBER",
          label: "TDP (W)",
        },
      ],
    },
  });

  // CPU Options
  const cpuOptions = await Promise.all([
    prisma.option.create({
      data: {
        categoryId: cpuCategory.id,
        label: "Intel Core i5-13600K",
        description: "6P+8E cores, up to 5.1GHz - Excellent value for gaming",
        price: 299.99,
        cost: 220.0,
        sku: "CPU-INTEL-I5-13600K",
        orderIndex: 1,
        isActive: true,
        isDefault: true,
        isPopular: true,
        inStock: true,
        stockQuantity: 45,
        attributeValues: {
          brand: "Intel",
          cores: "6P+8E",
          threads: 20,
          baseClock: "3.5GHz",
          boostClock: "5.1GHz",
          cache: "24MB",
          socket: "LGA1700",
          tdp: 125,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=400&fit=crop",
        ],
      },
    }),
    prisma.option.create({
      data: {
        categoryId: cpuCategory.id,
        label: "AMD Ryzen 7 7800X3D",
        description: "8 cores, 3D V-Cache technology - Best for gaming",
        price: 449.99,
        cost: 350.0,
        sku: "CPU-AMD-R7-7800X3D",
        orderIndex: 2,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 32,
        attributeValues: {
          brand: "AMD",
          cores: 8,
          threads: 16,
          baseClock: "4.2GHz",
          boostClock: "5.0GHz",
          cache: "96MB",
          socket: "AM5",
          tdp: 120,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: cpuCategory.id,
        label: "Intel Core i9-14900K",
        description: "8P+16E cores, up to 6.0GHz - Ultimate performance",
        price: 589.99,
        cost: 480.0,
        sku: "CPU-INTEL-I9-14900K",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 18,
        attributeValues: {
          brand: "Intel",
          cores: "8P+16E",
          threads: 32,
          baseClock: "3.2GHz",
          boostClock: "6.0GHz",
          cache: "36MB",
          socket: "LGA1700",
          tdp: 125,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: cpuCategory.id,
        label: "AMD Ryzen 5 7600X",
        description: "6 cores, AM5 platform - Great budget gaming option",
        price: 229.99,
        cost: 180.0,
        sku: "CPU-AMD-R5-7600X",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 60,
        attributeValues: {
          brand: "AMD",
          cores: 6,
          threads: 12,
          baseClock: "4.7GHz",
          boostClock: "5.3GHz",
          cache: "32MB",
          socket: "AM5",
          tdp: 105,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
  ]);

  // Category 2: Graphics Card (GPU) - REQUIRED
  const gpuCategory = await prisma.category.create({
    data: {
      configuratorId: gamingPC.id,
      name: "Graphics Card (GPU)",
      categoryType: CategoryType.POWER,
      description: "Choose your graphics card for stunning visuals",
      helpText:
        "Higher VRAM and clock speeds deliver better gaming performance",
      isPrimary: true,
      isRequired: true,
      orderIndex: 2,
      icon: "🎮",
      imageUrl:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=400&fit=crop",
      minSelections: 1,
      maxSelections: 1,
      attributesTemplate: [
        {
          name: "brand",
          type: "SELECT",
          label: "Brand",
          options: ["NVIDIA", "AMD"],
        },
        {
          name: "vram",
          type: "TEXT",
          label: "VRAM Capacity",
        },
        {
          name: "powerRequirement",
          type: "TEXT",
          label: "Minimum PSU",
        },
        {
          name: "length",
          type: "NUMBER",
          label: "Length (mm)",
        },
      ],
    },
  });

  // GPU Options
  const gpuOptions = await Promise.all([
    prisma.option.create({
      data: {
        categoryId: gpuCategory.id,
        label: "NVIDIA RTX 4060 8GB",
        description: "Great 1080p gaming with DLSS 3 support",
        price: 299.99,
        cost: 240.0,
        sku: "GPU-NVIDIA-RTX4060-8G",
        orderIndex: 1,
        isActive: true,
        isDefault: true,
        isPopular: true,
        inStock: true,
        stockQuantity: 55,
        attributeValues: {
          brand: "NVIDIA",
          vram: "8GB",
          memoryType: "GDDR6",
          coreClock: "1830MHz",
          boostClock: "2460MHz",
          powerRequirement: "550W",
          length: 240,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&h=150&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&h=400&fit=crop",
        ],
      },
    }),
    prisma.option.create({
      data: {
        categoryId: gpuCategory.id,
        label: "AMD RX 7700 XT 12GB",
        description: "Excellent 1440p gaming performance",
        price: 449.99,
        cost: 380.0,
        sku: "GPU-AMD-RX7700XT-12G",
        orderIndex: 2,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 38,
        attributeValues: {
          brand: "AMD",
          vram: "12GB",
          memoryType: "GDDR6",
          coreClock: "1700MHz",
          boostClock: "2600MHz",
          powerRequirement: "600W",
          length: 267,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: gpuCategory.id,
        label: "NVIDIA RTX 4070 SUPER 12GB",
        description: "Premium 1440p and entry 4K gaming",
        price: 599.99,
        cost: 520.0,
        sku: "GPU-NVIDIA-RTX4070S-12G",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 25,
        attributeValues: {
          brand: "NVIDIA",
          vram: "12GB",
          memoryType: "GDDR6X",
          coreClock: "1980MHz",
          boostClock: "2475MHz",
          powerRequirement: "650W",
          length: 245,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: gpuCategory.id,
        label: "AMD RX 7900 XTX 24GB",
        description: "4K gaming beast with massive VRAM",
        price: 949.99,
        cost: 850.0,
        sku: "GPU-AMD-RX7900XTX-24G",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 15,
        attributeValues: {
          brand: "AMD",
          vram: "24GB",
          memoryType: "GDDR6",
          coreClock: "1900MHz",
          boostClock: "2500MHz",
          powerRequirement: "800W",
          length: 287,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: gpuCategory.id,
        label: "NVIDIA RTX 4090 24GB",
        description: "Ultimate gaming performance for 4K and beyond",
        price: 1599.99,
        cost: 1450.0,
        sku: "GPU-NVIDIA-RTX4090-24G",
        orderIndex: 5,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 8,
        attributeValues: {
          brand: "NVIDIA",
          vram: "24GB",
          memoryType: "GDDR6X",
          coreClock: "2235MHz",
          boostClock: "2520MHz",
          powerRequirement: "850W",
          length: 304,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=200&h=150&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=400&fit=crop",
        ],
      },
    }),
  ]);

  // Category 3: Memory (RAM) - REQUIRED
  const ramCategory = await prisma.category.create({
    data: {
      configuratorId: gamingPC.id,
      name: "Memory (RAM)",
      categoryType: CategoryType.POWER,
      description: "Select your system memory",
      helpText: "Higher speed and lower latency improve gaming performance",
      isPrimary: false,
      isRequired: true,
      orderIndex: 3,
      icon: "💾",
      imageUrl:
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=400&fit=crop",
      minSelections: 1,
      maxSelections: 1,
      attributesTemplate: [
        {
          name: "capacity",
          type: "TEXT",
          label: "Total Capacity",
        },
        {
          name: "type",
          type: "SELECT",
          label: "Memory Type",
          options: ["DDR4", "DDR5"],
        },
        {
          name: "speed",
          type: "TEXT",
          label: "Speed",
        },
        {
          name: "latency",
          type: "TEXT",
          label: "CAS Latency",
        },
      ],
    },
  });

  // RAM Options
  const ramOptions = await Promise.all([
    prisma.option.create({
      data: {
        categoryId: ramCategory.id,
        label: "16GB DDR5 5600MHz",
        description: "16GB (2x8GB) DDR5 - Good for gaming and multitasking",
        price: 89.99,
        cost: 65.0,
        sku: "RAM-16G-DDR5-5600",
        orderIndex: 1,
        isActive: true,
        isDefault: true,
        isPopular: true,
        inStock: true,
        stockQuantity: 120,
        attributeValues: {
          capacity: "16GB",
          type: "DDR5",
          speed: "5600MHz",
          latency: "CL36",
          modules: "2x8GB",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: ramCategory.id,
        label: "32GB DDR5 6000MHz",
        description: "32GB (2x16GB) DDR5 - Sweet spot for gaming",
        price: 129.99,
        cost: 95.0,
        sku: "RAM-32G-DDR5-6000",
        orderIndex: 2,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 85,
        attributeValues: {
          capacity: "32GB",
          type: "DDR5",
          speed: "6000MHz",
          latency: "CL30",
          modules: "2x16GB",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: ramCategory.id,
        label: "64GB DDR5 6400MHz",
        description: "64GB (2x32GB) DDR5 - For streaming and content creation",
        price: 249.99,
        cost: 190.0,
        sku: "RAM-64G-DDR5-6400",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 45,
        attributeValues: {
          capacity: "64GB",
          type: "DDR5",
          speed: "6400MHz",
          latency: "CL32",
          modules: "2x32GB",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: ramCategory.id,
        label: "32GB DDR4 3600MHz",
        description: "32GB (2x16GB) DDR4 - Budget friendly option",
        price: 79.99,
        cost: 55.0,
        sku: "RAM-32G-DDR4-3600",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 95,
        attributeValues: {
          capacity: "32GB",
          type: "DDR4",
          speed: "3600MHz",
          latency: "CL18",
          modules: "2x16GB",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
  ]);

  // Category 4: Storage - NOT REQUIRED
  const storageCategory = await prisma.category.create({
    data: {
      configuratorId: gamingPC.id,
      name: "Storage",
      categoryType: CategoryType.FEATURE,
      description: "Choose your storage solution",
      helpText: "SSD for speed, HDD for capacity",
      isPrimary: false,
      isRequired: false,
      orderIndex: 4,
      icon: "💽",
      imageUrl:
        "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=400&fit=crop",
      minSelections: 0,
      maxSelections: 2,
      attributesTemplate: [
        {
          name: "type",
          type: "SELECT",
          label: "Storage Type",
          options: ["NVMe SSD", "SATA SSD", "HDD"],
        },
        {
          name: "capacity",
          type: "TEXT",
          label: "Capacity",
        },
        {
          name: "speed",
          type: "TEXT",
          label: "Read/Write Speed",
        },
      ],
    },
  });

  // Storage Options
  const storageOptions = await Promise.all([
    prisma.option.create({
      data: {
        categoryId: storageCategory.id,
        label: "500GB NVMe SSD",
        description: "Ultra-fast NVMe storage for OS and applications",
        price: 59.99,
        cost: 40.0,
        sku: "STORAGE-NVME-500GB",
        orderIndex: 1,
        isActive: true,
        isDefault: true,
        inStock: true,
        stockQuantity: 200,
        attributeValues: {
          type: "NVMe SSD",
          capacity: "500GB",
          speed: "3500MB/s read, 2300MB/s write",
          interface: "PCIe 4.0",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: storageCategory.id,
        label: "1TB NVMe SSD",
        description: "Fast NVMe storage for games and applications",
        price: 99.99,
        cost: 70.0,
        sku: "STORAGE-NVME-1TB",
        orderIndex: 2,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 150,
        attributeValues: {
          type: "NVMe SSD",
          capacity: "1TB",
          speed: "5000MB/s read, 4000MB/s write",
          interface: "PCIe 4.0",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: storageCategory.id,
        label: "2TB NVMe SSD",
        description: "Large capacity NVMe for extensive game library",
        price: 169.99,
        cost: 130.0,
        sku: "STORAGE-NVME-2TB",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 80,
        attributeValues: {
          type: "NVMe SSD",
          capacity: "2TB",
          speed: "5000MB/s read, 4500MB/s write",
          interface: "PCIe 4.0",
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: storageCategory.id,
        label: "4TB HDD",
        description: "High capacity hard drive for media and backups",
        price: 89.99,
        cost: 60.0,
        sku: "STORAGE-HDD-4TB",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 100,
        attributeValues: {
          type: "HDD",
          capacity: "4TB",
          speed: "180MB/s",
          rpm: 7200,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&h=150&fit=crop",
      },
    }),
  ]);

  // Category 5: Cooling Solution - NOT REQUIRED
  const coolingCategory = await prisma.category.create({
    data: {
      configuratorId: gamingPC.id,
      name: "CPU Cooling",
      categoryType: CategoryType.ACCESSORY,
      description: "Upgrade your CPU cooling for better performance",
      helpText:
        "Liquid cooling provides better temperatures and quieter operation",
      isPrimary: false,
      isRequired: false,
      orderIndex: 5,
      icon: "❄️",
      imageUrl:
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=400&fit=crop",
      minSelections: 0,
      maxSelections: 1,
      attributesTemplate: [
        {
          name: "type",
          type: "SELECT",
          label: "Cooling Type",
          options: ["Air", "Liquid"],
        },
        {
          name: "noiseLevel",
          type: "SELECT",
          label: "Noise Level",
          options: ["Low", "Medium", "High"],
        },
        {
          name: "tdpRating",
          type: "NUMBER",
          label: "Max TDP Support",
        },
      ],
    },
  });

  // Cooling Options
  const coolingOptions = await Promise.all([
    prisma.option.create({
      data: {
        categoryId: coolingCategory.id,
        label: "Stock Air Cooler (Included)",
        description:
          "Basic air cooler included with CPU - adequate for most uses",
        price: 0,
        sku: "COOLER-AIR-BASIC",
        orderIndex: 1,
        isActive: true,
        isDefault: true,
        inStock: true,
        attributeValues: {
          type: "Air",
          noiseLevel: "Medium",
          tdpRating: 95,
          rgb: false,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: coolingCategory.id,
        label: "Premium Air Cooler",
        description: "High-performance air cooler with dual towers",
        price: 89.99,
        cost: 60.0,
        sku: "COOLER-AIR-PREMIUM",
        orderIndex: 2,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 65,
        attributeValues: {
          type: "Air",
          noiseLevel: "Low",
          tdpRating: 250,
          rgb: true,
          height: 160,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
    prisma.option.create({
      data: {
        categoryId: coolingCategory.id,
        label: "240mm Liquid Cooler",
        description: "All-in-one liquid cooler with RGB lighting",
        price: 129.99,
        cost: 95.0,
        sku: "COOLER-LIQUID-240",
        orderIndex: 3,
        isActive: true,
        isDefault: false,
        isPopular: true,
        inStock: true,
        stockQuantity: 42,
        attributeValues: {
          type: "Liquid",
          radiatorSize: "240mm",
          noiseLevel: "Low",
          tdpRating: 300,
          rgb: true,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=400&fit=crop",
        ],
      },
    }),
    prisma.option.create({
      data: {
        categoryId: coolingCategory.id,
        label: "360mm Liquid Cooler",
        description: "Premium liquid cooling with large radiator",
        price: 179.99,
        cost: 140.0,
        sku: "COOLER-LIQUID-360",
        orderIndex: 4,
        isActive: true,
        isDefault: false,
        inStock: true,
        stockQuantity: 28,
        attributeValues: {
          type: "Liquid",
          radiatorSize: "360mm",
          noiseLevel: "Low",
          tdpRating: 400,
          rgb: true,
        },
        imageUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&h=150&fit=crop",
      },
    }),
  ]);

  console.log(
    "✅ Created Gaming PC configurator with 5 categories and 21 options"
  );

  // ========================================
  // CREATE INCOMPATIBILITIES
  // ========================================

  // Get option IDs for creating incompatibilities
  const intelI9 = cpuOptions[2].id; // Intel i9-14900K
  const amdRyzen7 = cpuOptions[1].id; // AMD Ryzen 7 7800X3D
  const rtx4090 = gpuOptions[4].id; // RTX 4090
  const rx7900xtx = gpuOptions[3].id; // RX 7900 XTX
  const ram64gb = ramOptions[2].id; // 64GB DDR5
  const basicCooler = coolingOptions[0].id; // Stock Air Cooler
  const premiumAirCooler = coolingOptions[1].id; // Premium Air Cooler
  const liquid360 = coolingOptions[3].id; // 360mm Liquid Cooler
  const hdd4tb = storageOptions[3].id; // 4TB HDD

  // Create incompatibilities
  await prisma.optionIncompatibility.createMany({
    data: [
      // Intel i9 incompatible with basic cooler
      {
        optionId: intelI9,
        incompatibleOptionId: basicCooler,
        severity: "error",
        message: "Intel Core i9 requires better cooling than the stock cooler",
      },
      // AMD Ryzen 7 incompatible with 360mm liquid cooler (socket compatibility)
      {
        optionId: amdRyzen7,
        incompatibleOptionId: liquid360,
        severity: "warning",
        message:
          "This liquid cooler may require additional mounting hardware for AM5 socket",
      },
      // RTX 4090 incompatible with 4TB HDD (space constraints)
      {
        optionId: rtx4090,
        incompatibleOptionId: hdd4tb,
        severity: "warning",
        message: "Large GPU may interfere with HDD mounting locations",
      },
      // RX 7900 XTX incompatible with 4TB HDD (space constraints)
      {
        optionId: rx7900xtx,
        incompatibleOptionId: hdd4tb,
        severity: "warning",
        message: "Large GPU may interfere with HDD mounting locations",
      },
      // 64GB RAM incompatible with premium air cooler (height clearance)
      {
        optionId: ram64gb,
        incompatibleOptionId: premiumAirCooler,
        severity: "error",
        message: "Tall RAM modules may not fit under this large air cooler",
      },
    ],
  });

  console.log("✅ Created 5 option incompatibilities");

  // ========================================
  // CREATE EMAIL TEMPLATES
  // ========================================

  await prisma.emailTemplate.createMany({
    data: [
      {
        clientId: client.id,
        name: "PC Quote Confirmation",
        subject: "Your Custom Gaming PC Quote - {{quoteCode}}",
        body: `<h1>Your Dream Gaming PC Awaits!</h1>
<p>Hi {{customerName}},</p>
<p>Thank you for building your custom gaming PC with us. Here's your configuration:</p>
<h2>PC Configuration Summary</h2>
{{configurationDetails}}
<h2>Total Price: {{totalPrice}}</h2>
<p>This quote is valid for 14 days. Our team will review your configuration for compatibility and contact you within 24 hours.</p>
<p>Ready to order? Reply to this email or call us at +1-555-0100.</p>`,
        previewText: "Your custom gaming PC quote is ready",
        templateType: "quote",
        isDefault: true,
        isActive: true,
        inheritThemeColors: true,
      },
      {
        clientId: client.id,
        name: "Order Confirmation",
        subject: "Gaming PC Order Confirmed - {{orderNumber}}",
        body: `<h1>Order Confirmed - Let the Gaming Begin!</h1>
<p>Hi {{customerName}},</p>
<p>Great news! Your custom gaming PC order has been confirmed and our build team is getting started.</p>
<h2>Order Details</h2>
{{orderDetails}}
<p>Estimated build time: 3-5 business days</p>
<p>We'll send you updates throughout the build process.</p>`,
        templateType: "order",
        isDefault: false,
        isActive: true,
        inheritThemeColors: true,
      },
    ],
  });

  console.log("✅ Created 2 email templates");

  // ========================================
  // CREATE SAMPLE QUOTES
  // ========================================

  await prisma.quote.createMany({
    data: [
      {
        clientId: client.id,
        configuratorId: gamingPC.id,
        customerEmail: "gamer.john@email.com",
        customerName: "John Smith",
        customerPhone: "+1-555-1001",
        title: "Mid-Range Gaming PC Build",
        selectedOptions: {
          processor: "AMD Ryzen 7 7800X3D",
          graphicsCard: "AMD RX 7700 XT 12GB",
          memory: "32GB DDR5 6000MHz",
          storage: ["1TB NVMe SSD"],
          cooling: "240mm Liquid Cooler",
        },
        totalPrice: 1429.95,
        subtotal: 1429.95,
        status: QuoteStatus.PENDING,
        quoteCode: "QT-GAMING-001",
        customerNotes:
          "Looking for a solid 1440p gaming setup. Please confirm compatibility.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client.id,
        configuratorId: gamingPC.id,
        customerEmail: "pro.streamer@email.com",
        customerName: "Sarah Johnson",
        customerPhone: "+1-555-1002",
        customerCompany: "StreamPro Gaming",
        title: "High-End Streaming PC",
        selectedOptions: {
          processor: "Intel Core i9-14900K",
          graphicsCard: "NVIDIA RTX 4090 24GB",
          memory: "64GB DDR5 6400MHz",
          storage: ["2TB NVMe SSD", "4TB HDD"],
          cooling: "360mm Liquid Cooler",
        },
        totalPrice: 3229.95,
        subtotal: 3229.95,
        status: QuoteStatus.SENT,
        quoteCode: "QT-GAMING-002",
        emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        openCount: 3,
        lastOpenedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        customerNotes:
          "Need this for professional streaming. Must handle 4K encoding smoothly.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client.id,
        configuratorId: gamingPC.id,
        customerEmail: "budget.gamer@email.com",
        customerName: "Mike Chen",
        title: "Budget Gaming Build",
        selectedOptions: {
          processor: "AMD Ryzen 5 7600X",
          graphicsCard: "NVIDIA RTX 4060 8GB",
          memory: "16GB DDR5 5600MHz",
          storage: ["500GB NVMe SSD"],
          cooling: "Stock Air Cooler (Included)",
        },
        totalPrice: 809.96,
        subtotal: 809.96,
        status: QuoteStatus.ACCEPTED,
        quoteCode: "QT-GAMING-003",
        emailSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        openCount: 2,
        lastOpenedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        customerNotes: "First gaming PC build. Excited to get started!",
        adminNotes: "Customer confirmed order. Ready for build.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Created 3 sample quotes");

  // ========================================
  // CREATE ANALYTICS EVENTS
  // ========================================

  const sessionIds = [
    "sess_pc_builder_001",
    "sess_pc_builder_002",
    "sess_pc_builder_003",
    "sess_pc_builder_004",
  ];

  const events = [];
  const now = Date.now();

  // Generate 50 analytics events for the gaming PC configurator
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const randomSession =
      sessionIds[Math.floor(Math.random() * sessionIds.length)];

    events.push({
      clientId: client.id,
      configuratorId: gamingPC.id,
      eventType: [
        AnalyticsEventType.CONFIGURATOR_VIEW,
        AnalyticsEventType.CONFIGURATOR_INTERACTION,
        AnalyticsEventType.QUOTE_REQUEST,
      ][Math.floor(Math.random() * 3)],
      eventName: [
        "page_view",
        "option_selected",
        "category_changed",
        "price_updated",
        "quote_submitted",
      ][Math.floor(Math.random() * 5)],
      sessionId: randomSession,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      country: ["US", "CA", "GB", "DE", "AU"][Math.floor(Math.random() * 5)],
      region: ["California", "Ontario", "London", "Bavaria", "New South Wales"][
        Math.floor(Math.random() * 5)
      ],
      city: ["Los Angeles", "Toronto", "London", "Munich", "Sydney"][
        Math.floor(Math.random() * 5)
      ],
      path: `/configurator/${gamingPC.slug}`,
      referrer: [
        "https://google.com",
        "https://youtube.com",
        "direct",
        "https://reddit.com",
      ][Math.floor(Math.random() * 4)],
      domain: client.domain,
      metadata: {
        device: ["desktop", "mobile", "tablet"][Math.floor(Math.random() * 3)],
        browser: "Chrome",
        viewportWidth: 1920,
        viewportHeight: 1080,
      },
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.analyticsEvent.createMany({ data: events });

  console.log("✅ Created 50 analytics events");

  // ========================================
  // CREATE FILES WITH REAL URLS
  // ========================================

  await prisma.file.createMany({
    data: [
      {
        clientId: client.id,
        filename: "gaming-pc-hero.jpg",
        originalName: "custom-gaming-pc-main.jpg",
        fileType: FileType.IMAGE,
        mimeType: "image/jpeg",
        size: 2458000,
        key: "uploads/tech-solutions/gaming-pc-hero.jpg",
        url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&h=1080&fit=crop",
        altText: "Custom gaming PC with RGB lighting on a modern desk",
        caption: "Hero image for gaming PC configurator",
        isPublic: true,
        metadata: { width: 1920, height: 1080, format: "JPEG" },
      },
      {
        clientId: client.id,
        filename: "pc-build-showcase.jpg",
        originalName: "gaming-pc-showcase.jpg",
        fileType: FileType.IMAGE,
        mimeType: "image/jpeg",
        size: 1890000,
        key: "uploads/tech-solutions/pc-showcase.jpg",
        url: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&h=800&fit=crop",
        altText: "High-end gaming PC with liquid cooling and RGB lighting",
        caption: "Premium gaming PC showcase",
        isPublic: true,
        metadata: { width: 1200, height: 800, format: "JPEG" },
      },
      {
        clientId: client.id,
        filename: "build-process-guide.pdf",
        originalName: "PC Build Process Guide.pdf",
        fileType: FileType.DOCUMENT,
        mimeType: "application/pdf",
        size: 1250000,
        key: "uploads/tech-solutions/build-guide.pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        caption: "Step-by-step PC building process",
        isPublic: true,
        metadata: { pages: 8, fileType: "PDF Guide" },
      },
      {
        clientId: client.id,
        filename: "warranty-terms.pdf",
        originalName: "Warranty Terms and Conditions.pdf",
        fileType: FileType.DOCUMENT,
        mimeType: "application/pdf",
        size: 890000,
        key: "uploads/tech-solutions/warranty.pdf",
        url: "https://www.africau.edu/images/default/sample.pdf",
        altText: "Warranty terms and conditions document",
        isPublic: false,
        metadata: { pages: 6, documentType: "Legal" },
      },
      {
        clientId: client.id,
        filename: "component-compatibility.jpg",
        originalName: "compatibility-chart.jpg",
        fileType: FileType.IMAGE,
        mimeType: "image/jpeg",
        size: 1560000,
        key: "uploads/tech-solutions/compatibility.jpg",
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&h=800&fit=crop",
        altText: "PC component compatibility chart",
        caption: "Component compatibility reference guide",
        isPublic: true,
        metadata: { width: 1000, height: 800, format: "JPEG" },
      },
      {
        clientId: client.id,
        filename: "rgb-lighting-demo.mp4",
        originalName: "RGB Lighting Demo.mp4",
        fileType: FileType.ASSET,
        mimeType: "video/mp4",
        size: 15600000,
        key: "uploads/tech-solutions/rgb-demo.mp4",
        url: "https://assets.mixkit.co/videos/preview/mixkit-pc-with-led-lights-while-running-44427-large.mp4",
        altText: "RGB lighting demonstration video",
        caption: "Custom RGB lighting effects showcase",
        isPublic: true,
        metadata: {
          duration: "30s",
          resolution: "1080p",
          fileType: "Video Demo",
        },
      },
    ],
  });

  console.log("✅ Created 6 file uploads with real URLs");

  // ========================================
  // CREATE API LOGS
  // ========================================

  const apiLogs = [];
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const methods = ["GET", "POST", "PUT"];
    const paths = [
      "/api/configurator/gaming-pc",
      "/api/quote/create",
      "/api/option/list",
      "/api/analytics/events",
    ];
    const statuses = [200, 200, 200, 201, 400, 404];

    apiLogs.push({
      clientId: client.id,
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      statusCode: statuses[Math.floor(Math.random() * statuses.length)],
      userAgent: "Mozilla/5.0",
      ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      responseTime: Math.floor(Math.random() * 300) + 50,
      requestSize: Math.floor(Math.random() * 5000),
      responseSize: Math.floor(Math.random() * 25000),
      apiKeyId: client.apiKey,
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.apiLog.createMany({ data: apiLogs });

  console.log("✅ Created 25 API logs");

  // ========================================
  // FINAL SUMMARY
  // ========================================

  console.log("\n🎉 SEED COMPLETED WITH REAL FILE URLs! 🎉\n");
  console.log("=".repeat(50));
  console.log("📊 DATABASE SUMMARY:");
  console.log("=".repeat(50));
  console.log(`✅ Client: 1 (Tech Solutions Inc.)`);
  console.log(`   - tech.solutions@example.com - password123`);
  console.log(`\n✅ Configurator: 1 (Custom Gaming PC Builder)`);
  console.log(`\n✅ Categories: 5`);
  console.log(`   1. Processor (CPU) - REQUIRED - 4 options`);
  console.log(`   2. Graphics Card (GPU) - REQUIRED - 5 options`);
  console.log(`   3. Memory (RAM) - REQUIRED - 4 options`);
  console.log(`   4. Storage - OPTIONAL - 4 options`);
  console.log(`   5. CPU Cooling - OPTIONAL - 4 options`);
  console.log(`\n✅ Total Options: 21 with realistic pricing`);
  console.log(`\n✅ Incompatibilities: 5 cross-category relationships`);
  console.log(`\n✅ Real File URLs:`);
  console.log(`   - 6 files with real Unsplash images and sample PDFs`);
  console.log(`   - Multiple image sizes (thumbnails, galleries)`);
  console.log(`   - Sample video file for demonstrations`);
  console.log(`\n✅ Additional Data:`);
  console.log(`   - Email Templates: 2`);
  console.log(`   - Sample Quotes: 3`);
  console.log(`   - Analytics Events: 50`);
  console.log(`   - API Logs: 25`);
  console.log("=".repeat(50));
  console.log("\n🚀 Ready to test! Login with: tech.solutions@example.com");
  console.log("🖼️ All images and files now use real URLs from Unsplash");
  console.log(
    "🔧 Test the gaming PC configurator with real component incompatibilities!"
  );
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
