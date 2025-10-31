"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Copy, Check, FileText } from "lucide-react";

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  requiresEditToken?: boolean;
  defaultBody?: string;
  defaultHeaders?: { key: string; value: string }[];
  notes?: string;
}

// Comprehensive sample data for creating a full configurator
const FULL_CONFIGURATOR_SAMPLE = {
  configurator: {
    name: "Industrial Circuit Breaker Configurator",
    description:
      "Configure your custom industrial circuit breaker with advanced protection features",
    currency: "USD",
    currencySymbol: "$",
  },
  categories: [
    {
      name: "Power Rating",
      categoryType: "POWER",
      description: "Select the power capacity of your circuit breaker",
      isRequired: true,
      isPrimary: true,
      orderIndex: 1,
      options: [
        {
          label: "15A - 120V",
          sku: "PWR-15A",
          price: 45.0,
          description: "Standard residential power rating",
        },
        {
          label: "20A - 120V",
          sku: "PWR-20A",
          price: 52.0,
          description: "Heavy duty residential rating",
        },
        {
          label: "30A - 240V",
          sku: "PWR-30A",
          price: 78.0,
          description: "Commercial light rating",
        },
        {
          label: "50A - 240V",
          sku: "PWR-50A",
          price: 125.0,
          description: "Commercial heavy rating",
        },
        {
          label: "100A - 480V",
          sku: "PWR-100A",
          price: 285.0,
          description: "Industrial standard rating",
        },
      ],
    },
    {
      name: "Mounting Type",
      categoryType: "FEATURE",
      description: "Choose how the breaker will be mounted",
      isRequired: true,
      orderIndex: 2,
      options: [
        {
          label: "DIN Rail Mount",
          sku: "MNT-DIN",
          price: 0,
          description: "Standard DIN rail mounting",
        },
        {
          label: "Panel Mount",
          sku: "MNT-PNL",
          price: 15.0,
          description: "Direct panel mounting with screws",
        },
        {
          label: "Surface Mount",
          sku: "MNT-SRF",
          price: 22.0,
          description: "Surface mounting box included",
        },
        {
          label: "Flush Mount",
          sku: "MNT-FLS",
          price: 35.0,
          description: "Flush mounting enclosure",
        },
      ],
    },
    {
      name: "Protection Type",
      categoryType: "FEATURE",
      description: "Select additional protection features",
      isRequired: true,
      orderIndex: 3,
      options: [
        {
          label: "Thermal Only",
          sku: "PRO-THM",
          price: 0,
          description: "Basic thermal overload protection",
        },
        {
          label: "Thermal-Magnetic",
          sku: "PRO-MAG",
          price: 25.0,
          description: "Combined thermal and magnetic trip",
        },
        {
          label: "Ground Fault (GFCI)",
          sku: "PRO-GFI",
          price: 55.0,
          description: "Ground fault circuit interrupter",
        },
        {
          label: "Arc Fault (AFCI)",
          sku: "PRO-ARC",
          price: 75.0,
          description: "Arc fault circuit interrupter",
        },
        {
          label: "Combined GFCI+AFCI",
          sku: "PRO-CMB",
          price: 110.0,
          description: "Dual protection system",
        },
      ],
    },
    {
      name: "Housing Material",
      categoryType: "MATERIAL",
      description: "Select the breaker housing material",
      isRequired: true,
      orderIndex: 4,
      options: [
        {
          label: "Standard Plastic",
          sku: "HSG-PLS",
          price: 0,
          description: "UL94 V-0 flame retardant plastic",
        },
        {
          label: "Reinforced Plastic",
          sku: "HSG-RPL",
          price: 18.0,
          description: "Glass-filled reinforced plastic",
        },
        {
          label: "Metal Enclosure",
          sku: "HSG-MTL",
          price: 45.0,
          description: "Aluminum die-cast housing",
        },
        {
          label: "Stainless Steel",
          sku: "HSG-SS",
          price: 95.0,
          description: "Marine-grade stainless steel",
        },
      ],
    },
    {
      name: "Terminal Configuration",
      categoryType: "FEATURE",
      description: "Choose the terminal connection type",
      isRequired: true,
      orderIndex: 5,
      options: [
        {
          label: "Screw Terminals",
          sku: "TRM-SCR",
          price: 0,
          description: "Standard screw-type terminals",
        },
        {
          label: "Spring Terminals",
          sku: "TRM-SPR",
          price: 12.0,
          description: "Tool-free spring terminals",
        },
        {
          label: "Ring Lug Terminals",
          sku: "TRM-RNG",
          price: 20.0,
          description: "Heavy-duty ring lug connectors",
        },
        {
          label: "Bus Bar Connectors",
          sku: "TRM-BUS",
          price: 35.0,
          description: "Direct bus bar connection",
        },
      ],
    },
    {
      name: "Environmental Rating",
      categoryType: "FEATURE",
      description: "Select the environmental protection rating",
      isRequired: true,
      orderIndex: 6,
      options: [
        {
          label: "IP20 - Indoor",
          sku: "ENV-IP20",
          price: 0,
          description: "Standard indoor use",
        },
        {
          label: "IP54 - Dust/Splash",
          sku: "ENV-IP54",
          price: 28.0,
          description: "Protected from dust and water splash",
        },
        {
          label: "IP65 - Waterproof",
          sku: "ENV-IP65",
          price: 55.0,
          description: "Dust-tight and water jet resistant",
        },
        {
          label: "IP67 - Submersible",
          sku: "ENV-IP67",
          price: 85.0,
          description: "Temporary water immersion protection",
        },
      ],
    },
  ],
  incompatibilities: [
    // 15A breakers are incompatible with industrial features
    {
      from: "PWR-15A",
      to: "MNT-FLS",
      message: "15A breakers not available with flush mounting",
    },
    {
      from: "PWR-15A",
      to: "HSG-SS",
      message: "15A breakers not available in stainless steel",
    },
    {
      from: "PWR-15A",
      to: "TRM-BUS",
      message: "15A breakers not compatible with bus bar connectors",
    },
    {
      from: "PWR-15A",
      to: "ENV-IP67",
      message: "15A breakers not rated for submersible use",
    },

    // 20A incompatibilities
    {
      from: "PWR-20A",
      to: "HSG-SS",
      message: "20A breakers not available in stainless steel",
    },
    {
      from: "PWR-20A",
      to: "TRM-BUS",
      message: "20A breakers not compatible with bus bar connectors",
    },
    {
      from: "PWR-20A",
      to: "ENV-IP67",
      message: "20A breakers not rated for submersible use",
    },

    // 100A industrial breakers incompatible with residential features
    {
      from: "PWR-100A",
      to: "MNT-DIN",
      message: "100A breakers too large for DIN rail mounting",
    },
    {
      from: "PWR-100A",
      to: "HSG-PLS",
      message: "100A breakers require reinforced housing",
    },
    {
      from: "PWR-100A",
      to: "TRM-SCR",
      message: "100A breakers require heavy-duty terminals",
    },
    {
      from: "PWR-100A",
      to: "PRO-THM",
      message: "100A breakers require magnetic protection",
    },

    // Mounting incompatibilities
    {
      from: "MNT-DIN",
      to: "HSG-MTL",
      message: "DIN rail not compatible with metal enclosure",
    },
    {
      from: "MNT-DIN",
      to: "HSG-SS",
      message: "DIN rail not compatible with stainless steel housing",
    },
    {
      from: "MNT-FLS",
      to: "ENV-IP20",
      message: "Flush mount requires minimum IP54 rating",
    },

    // Protection incompatibilities
    {
      from: "PRO-CMB",
      to: "PWR-15A",
      message: "Combined protection not available for 15A rating",
    },
    {
      from: "PRO-ARC",
      to: "MNT-DIN",
      message: "Arc fault protection requires panel or surface mount",
    },

    // Material incompatibilities
    {
      from: "HSG-PLS",
      to: "ENV-IP65",
      message: "Standard plastic housing not rated for IP65",
    },
    {
      from: "HSG-PLS",
      to: "ENV-IP67",
      message: "Standard plastic housing not rated for IP67",
    },

    // Terminal incompatibilities
    {
      from: "TRM-SPR",
      to: "PWR-100A",
      message: "Spring terminals not rated for 100A current",
    },
    {
      from: "TRM-BUS",
      to: "MNT-DIN",
      message: "Bus bar connectors not compatible with DIN rail mounting",
    },
  ],
};

const API_ENDPOINTS: ApiEndpoint[] = [
  // ==================== CONFIGURATOR ====================
  {
    name: "List Configurators",
    method: "GET",
    path: "/api/configurator/list",
    description: "Get all configurators for authenticated client",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    name: "Create Configurator",
    method: "POST",
    path: "/api/configurator/create",
    description: "Create a new configurator (Step 1 of full setup)",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify(FULL_CONFIGURATOR_SAMPLE.configurator, null, 2),
    notes:
      "After creating, use the returned configurator ID to create categories and options",
  },
  {
    name: "Get Configurator by Public ID",
    method: "GET",
    path: "/api/configurator/[publicId]",
    description:
      "Get configurator details (replace [publicId] with actual public ID)",
    category: "Configurator",
    requiresAuth: false,
    notes: "This is the public endpoint used by embedded configurators",
  },
  {
    name: "Update Configurator",
    method: "PUT",
    path: "/api/configurator/update",
    description: "Update configurator details",
    category: "Configurator",
    requiresAuth: false,
    requiresEditToken: true,
    defaultBody: JSON.stringify(
      {
        token: "your_edit_token_here",
        name: "Updated Configurator Name",
        description: "Updated description",
        isPublished: true,
        isActive: true,
      },
      null,
      2
    ),
    notes: "Requires edit token from generate-edit-token endpoint",
  },
  {
    name: "Duplicate Configurator",
    method: "POST",
    path: "/api/configurator/duplicate",
    description:
      "Duplicate an existing configurator with all categories and options",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify({ id: "configurator_id_here" }, null, 2),
  },
  {
    name: "Delete Configurator",
    method: "DELETE",
    path: "/api/configurator/delete?id=configurator_id_here",
    description: "Delete configurator (pass ID as query parameter)",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    name: "Generate Edit Token",
    method: "POST",
    path: "/api/configurator/generate-edit-token",
    description:
      "Generate a temporary edit token for configurator (30min validity)",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      { configuratorId: "your_configurator_id" },
      null,
      2
    ),
    notes: "Use this token for update operations",
  },
  {
    name: "Verify Edit Token",
    method: "POST",
    path: "/api/configurator/verify-edit-token",
    description: "Verify an edit token and get configurator public ID",
    category: "Configurator",
    requiresAuth: false,
    defaultBody: JSON.stringify({ token: "your_edit_token" }, null, 2),
  },

  // ==================== CATEGORY ====================
  {
    name: "List Categories",
    method: "GET",
    path: "/api/category/list?configuratorId=your_configurator_id",
    description: "List all categories for a configurator",
    category: "Category",
    requiresAuth: false,
  },
  {
    name: "Create Category",
    method: "POST",
    path: "/api/category/create",
    description: "Create a new category (Step 2 of full setup)",
    category: "Category",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        configuratorId: "your_configurator_id",
        name: "Power Rating",
        categoryType: "POWER",
        description: "Select the power capacity",
        isRequired: true,
        isPrimary: true,
        orderIndex: 1,
      },
      null,
      2
    ),
    notes:
      "CategoryType options: GENERIC, COLOR, DIMENSION, MATERIAL, FEATURE, ACCESSORY, POWER, TEXT, FINISH, CUSTOM",
  },
  {
    name: "Update Category",
    method: "PUT",
    path: "/api/category/update",
    description: "Update category details",
    category: "Category",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "category_id_here",
        name: "Updated Category Name",
        orderIndex: 2,
        isRequired: false,
      },
      null,
      2
    ),
  },

  // ==================== OPTION ====================
  {
    name: "List Options",
    method: "GET",
    path: "/api/option/list?categoryId=your_category_id",
    description: "List all options for a category",
    category: "Option",
    requiresAuth: false,
  },
  {
    name: "Create Option",
    method: "POST",
    path: "/api/option/create",
    description: "Create a new option (Step 3 of full setup)",
    category: "Option",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        categoryId: "your_category_id",
        label: "15A - 120V",
        sku: "PWR-15A",
        description: "Standard residential power rating",
        price: 45.0,
        isDefault: false,
        isActive: true,
        inStock: true,
      },
      null,
      2
    ),
  },
  {
    name: "Update Option",
    method: "PUT",
    path: "/api/option/update",
    description: "Update option details and set incompatibilities",
    category: "Option",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "option_id_here",
        label: "Updated Option Label",
        price: 125.5,
        incompatibleWith: ["other_option_id_1", "other_option_id_2"],
      },
      null,
      2
    ),
    notes: "Use incompatibleWith array to set option incompatibility rules",
  },

  // ==================== THEME ====================
  {
    name: "List Themes",
    method: "GET",
    path: "/api/theme/list",
    description: "Get all themes for authenticated client",
    category: "Theme",
    requiresAuth: true,
  },
  {
    name: "Create Theme",
    method: "POST",
    path: "/api/theme/create",
    description: "Create a custom theme",
    category: "Theme",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        name: "Custom Industrial Theme",
        description: "Dark theme for industrial applications",
        primaryColor: "220 70% 50%",
        secondaryColor: "340 70% 50%",
        accentColor: "280 70% 50%",
        backgroundColor: "0 0% 10%",
        surfaceColor: "0 0% 15%",
        textColor: "0 0% 95%",
        fontFamily: "Inter, sans-serif",
        borderRadius: "0.5rem",
        isDefault: false,
      },
      null,
      2
    ),
    notes: "Colors use HSL format (hue saturation lightness)",
  },
  {
    name: "Update Theme",
    method: "PUT",
    path: "/api/theme/update",
    description: "Update theme settings",
    category: "Theme",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "theme_id_here",
        name: "Updated Theme Name",
        primaryColor: "200 80% 45%",
        isDefault: true,
      },
      null,
      2
    ),
  },

  // ==================== QUOTE ====================
  {
    name: "List Quotes",
    method: "GET",
    path: "/api/quote/list",
    description: "Get all quotes for authenticated client",
    category: "Quote",
    requiresAuth: true,
  },
  {
    name: "Create Quote",
    method: "POST",
    path: "/api/quote/create",
    description:
      "Create a quote from configurator (public endpoint for embeds)",
    category: "Quote",
    requiresAuth: false,
    defaultBody: JSON.stringify(
      {
        configuratorId: "your_configurator_id",
        customerEmail: "customer@example.com",
        customerName: "John Smith",
        customerPhone: "+1-555-0123",
        selectedOptions: {
          "Power Rating": "50A - 240V",
          "Mounting Type": "Panel Mount",
          "Protection Type": "Thermal-Magnetic",
          "Housing Material": "Metal Enclosure",
          "Terminal Configuration": "Ring Lug Terminals",
          "Environmental Rating": "IP54 - Dust/Splash",
        },
        totalPrice: 340.0,
        configuration: {
          items: [
            { sku: "PWR-50A", label: "50A - 240V", price: 125.0 },
            { sku: "MNT-PNL", label: "Panel Mount", price: 15.0 },
            { sku: "PRO-MAG", label: "Thermal-Magnetic", price: 25.0 },
            { sku: "HSG-MTL", label: "Metal Enclosure", price: 45.0 },
            { sku: "TRM-RNG", label: "Ring Lug Terminals", price: 20.0 },
            { sku: "ENV-IP54", label: "IP54 - Dust/Splash", price: 28.0 },
          ],
        },
      },
      null,
      2
    ),
    notes: "Requires X-Public-Key header with client's public key",
  },
  {
    name: "Get Quote by Code",
    method: "GET",
    path: "/api/quote/[quoteCode]",
    description:
      "Get quote details (replace [quoteCode] with actual quote code)",
    category: "Quote",
    requiresAuth: false,
  },
  {
    name: "Update Quote",
    method: "PUT",
    path: "/api/quote/update",
    description: "Update quote status and details",
    category: "Quote",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "quote_id_here",
        status: "SENT",
        internalNotes: "Quote sent to customer",
        validUntil: "2025-02-15T00:00:00Z",
      },
      null,
      2
    ),
    notes:
      "Status options: DRAFT, PENDING, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED",
  },

  // ==================== FILES ====================
  {
    name: "List Files",
    method: "GET",
    path: "/api/files/list",
    description: "Get all uploaded files for authenticated client",
    category: "Files",
    requiresAuth: true,
  },
  {
    name: "Upload File",
    method: "POST",
    path: "/api/files/upload",
    description: "Upload a file (multipart/form-data)",
    category: "Files",
    requiresAuth: true,
    notes:
      "Use multipart/form-data with 'file' field. Not testable from JSON body.",
  },
  {
    name: "Get Upload URL",
    method: "GET",
    path: "/api/files/upload?filename=image.jpg&contentType=image/jpeg",
    description: "Get signed URL for direct file upload to storage",
    category: "Files",
    requiresAuth: true,
  },
  {
    name: "Delete File",
    method: "DELETE",
    path: "/api/files/delete?id=file_id_here",
    description: "Delete an uploaded file",
    category: "Files",
    requiresAuth: true,
  },
];

export default function APITestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
    API_ENDPOINTS[0]
  );
  const [method, setMethod] = useState(API_ENDPOINTS[0].method);
  const [url, setUrl] = useState(API_ENDPOINTS[0].path);
  const [headers, setHeaders] = useState<Header[]>([
    {
      id: "1",
      key: "Content-Type",
      value: "application/json",
      enabled: true,
    },
  ]);
  const [body, setBody] = useState(API_ENDPOINTS[0].defaultBody || "");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullSample, setShowFullSample] = useState(false);

  const categories = Array.from(new Set(API_ENDPOINTS.map((e) => e.category)));

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setMethod(endpoint.method);
    setUrl(endpoint.path);
    setBody(endpoint.defaultBody || "");
    setResponse(null);
    setResponseTime(null);

    // Reset headers
    const defaultHeaders: Header[] = [
      {
        id: "1",
        key: "Content-Type",
        value: "application/json",
        enabled: true,
      },
    ];

    if (endpoint.requiresAuth) {
      defaultHeaders.push({
        id: "2",
        key: "Authorization",
        value: "Bearer your_token_here",
        enabled: true,
      });
    }

    if (endpoint.path.includes("/api/quote/create")) {
      defaultHeaders.push({
        id: "3",
        key: "X-Public-Key",
        value: "your_public_key_here",
        enabled: true,
      });
    }

    setHeaders(defaultHeaders);
  };

  const addHeader = () => {
    setHeaders([
      ...headers,
      { id: Date.now().toString(), key: "", value: "", enabled: true },
    ]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id));
  };

  const updateHeader = (
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const sendRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      const enabledHeaders = headers
        .filter((h) => h.enabled && h.key)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      const options: RequestInit = {
        method,
        headers: enabledHeaders,
      };

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      });
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: "Error",
        data: { error: error.message },
      });
      setResponseTime(Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyFullSample = () => {
    navigator.clipboard.writeText(
      JSON.stringify(FULL_CONFIGURATOR_SAMPLE, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 400 && status < 500) return "text-yellow-500";
    if (status >= 500) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="container mx-auto p-8 max-w-[1800px]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">API Testing Console</h1>
        <p className="text-muted-foreground text-lg">
          Test all configurator API endpoints with sample data and auth token
          flow
        </p>

        <Card className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <FileText className="h-5 w-5" />
              Full Configurator Sample Data
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Complete workflow: 1 Configurator + 6 Categories + 25 Options +
              Incompatibility Rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullSample(!showFullSample)}
                data-testid="toggle-sample-button"
              >
                {showFullSample ? "Hide" : "Show"} Full Sample Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyFullSample}
                className="ml-2"
                data-testid="copy-sample-button"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Sample
              </Button>
            </div>

            {showFullSample && (
              <ScrollArea className="h-96 w-full rounded-md border mt-4">
                <pre className="p-4 text-xs font-mono">
                  {JSON.stringify(FULL_CONFIGURATOR_SAMPLE, null, 2)}
                </pre>
              </ScrollArea>
            )}

            <div className="mt-4 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-2">Setup Workflow:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Create Configurator using{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    /api/configurator/create
                  </code>
                </li>
                <li>
                  Create 6 Categories using{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    /api/category/create
                  </code>{" "}
                  (use configuratorId from step 1)
                </li>
                <li>
                  Create Options for each category using{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    /api/option/create
                  </code>
                </li>
                <li>
                  Set incompatibilities using{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    /api/option/update
                  </code>{" "}
                  with incompatibleWith array
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Endpoint List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              {API_ENDPOINTS.length} endpoints available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-2 p-4">
                {categories.map((category) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      {category}
                    </h3>
                    {API_ENDPOINTS.filter((e) => e.category === category).map(
                      (endpoint) => (
                        <button
                          key={endpoint.path + endpoint.method}
                          onClick={() => handleSelectEndpoint(endpoint)}
                          className={`w-full text-left p-3 rounded-lg border mb-2 hover:bg-muted/50 transition-colors ${
                            selectedEndpoint.path === endpoint.path &&
                            selectedEndpoint.method === endpoint.method
                              ? "bg-muted border-primary"
                              : ""
                          }`}
                          data-testid={`endpoint-${endpoint.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant={
                                endpoint.method === "GET"
                                  ? "default"
                                  : endpoint.method === "POST"
                                    ? "default"
                                    : endpoint.method === "PUT"
                                      ? "secondary"
                                      : "destructive"
                              }
                              className="text-xs"
                            >
                              {endpoint.method}
                            </Badge>
                            {endpoint.requiresAuth && (
                              <Badge variant="outline" className="text-xs">
                                🔒 Auth
                              </Badge>
                            )}
                            {endpoint.requiresEditToken && (
                              <Badge variant="outline" className="text-xs">
                                🎫 Token
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{endpoint.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {endpoint.path}
                          </p>
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content - Request Builder */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{selectedEndpoint.name}</CardTitle>
            <CardDescription>{selectedEndpoint.description}</CardDescription>
            {selectedEndpoint.notes && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Note:</span>{" "}
                  {selectedEndpoint.notes}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">
                  Response
                  {response && (
                    <Badge variant="secondary" className="ml-2">
                      {response.status}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="space-y-4">
                {/* URL Bar */}
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/api/endpoint"
                    className="flex-1"
                    data-testid="url-input"
                  />
                  <Button
                    onClick={sendRequest}
                    disabled={isLoading}
                    data-testid="send-request-button"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>

                {/* Headers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Headers</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addHeader}
                      data-testid="add-header-button"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {headers.map((header) => (
                      <div key={header.id} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) =>
                            updateHeader(header.id, "enabled", e.target.checked)
                          }
                          className="w-4 h-4"
                          data-testid={`header-enabled-${header.id}`}
                        />
                        <Input
                          placeholder="Key"
                          value={header.key}
                          onChange={(e) =>
                            updateHeader(header.id, "key", e.target.value)
                          }
                          className="flex-1"
                          data-testid={`header-key-${header.id}`}
                        />
                        <Input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) =>
                            updateHeader(header.id, "value", e.target.value)
                          }
                          className="flex-1"
                          data-testid={`header-value-${header.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(header.id)}
                          data-testid={`remove-header-${header.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                {["POST", "PUT", "PATCH", "DELETE"].includes(method) && (
                  <div>
                    <Label className="mb-2 block">Request Body (JSON)</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="font-mono text-sm h-96"
                      data-testid="request-body-textarea"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="response" className="space-y-4">
                {response ? (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <p
                            className={`text-lg font-bold ${getStatusColor(
                              response.status
                            )}`}
                          >
                            {response.status} {response.statusText}
                          </p>
                        </div>
                        {responseTime !== null && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Time
                            </p>
                            <p className="text-lg font-bold">
                              {responseTime}ms
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyResponse}
                        data-testid="copy-response-button"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <div>
                      <Label className="mb-2 block">Response Body</Label>
                      <ScrollArea className="h-96 w-full rounded-md border">
                        <pre
                          className="p-4 text-sm font-mono"
                          data-testid="response-body"
                        >
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>

                    <div>
                      <Label className="mb-2 block">Response Headers</Label>
                      <ScrollArea className="h-40 w-full rounded-md border">
                        <pre className="p-4 text-xs font-mono">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Send a request to see the response</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
