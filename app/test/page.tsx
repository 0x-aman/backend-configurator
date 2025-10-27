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
import { Send, Plus, Trash2, Copy, Check } from "lucide-react";

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
  defaultBody?: string;
  defaultHeaders?: { key: string; value: string }[];
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Auth
  {
    name: "Login",
    method: "POST",
    path: "/api/auth/login",
    description: "Login with email and password",
    category: "Authentication",
    requiresAuth: false,
    defaultBody: JSON.stringify(
      { email: "demo@example.com", password: "password123" },
      null,
      2
    ),
  },
  {
    name: "Register",
    method: "POST",
    path: "/api/auth/register",
    description: "Register new client account",
    category: "Authentication",
    requiresAuth: false,
    defaultBody: JSON.stringify(
      {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        companyName: "New Company",
      },
      null,
      2
    ),
  },
  {
    name: "Get Current User",
    method: "GET",
    path: "/api/auth/me",
    description: "Get authenticated user info",
    category: "Authentication",
    requiresAuth: true,
  },
  {
    name: "Logout",
    method: "POST",
    path: "/api/auth/logout",
    description: "Logout current user",
    category: "Authentication",
    requiresAuth: false,
  },
  {
    name: "Forgot Password",
    method: "POST",
    path: "/api/auth/forgot-password",
    description: "Request password reset email",
    category: "Authentication",
    requiresAuth: false,
    defaultBody: JSON.stringify({ email: "demo@example.com" }, null, 2),
  },

  // Client
  {
    name: "Get Client Profile",
    method: "GET",
    path: "/api/client/me",
    description: "Get client profile details",
    category: "Client",
    requiresAuth: true,
  },
  {
    name: "Update Client Profile",
    method: "PUT",
    path: "/api/client/update",
    description: "Update client profile",
    category: "Client",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      { name: "Updated Name", companyName: "Updated Company" },
      null,
      2
    ),
  },

  // Configurator
  {
    name: "List Configurators",
    method: "GET",
    path: "/api/configurator/list",
    description: "Get all configurators",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    name: "Create Configurator",
    method: "POST",
    path: "/api/configurator/create",
    description: "Create new configurator",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        name: "New Product Configurator",
        description: "Configure your custom product",
        slug: "new-configurator",
        isActive: true,
        currency: "USD",
        currencySymbol: "$",
      },
      null,
      2
    ),
  },
  {
    name: "Update Configurator",
    method: "PUT",
    path: "/api/configurator/update",
    description: "Update configurator details",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "configurator_id_here",
        name: "Updated Configurator Name",
        isPublished: true,
      },
      null,
      2
    ),
  },
  {
    name: "Delete Configurator",
    method: "DELETE",
    path: "/api/configurator/delete",
    description: "Delete configurator",
    category: "Configurator",
    requiresAuth: true,
    defaultBody: JSON.stringify({ id: "configurator_id_here" }, null, 2),
  },
  {
    name: "Get Configurator by Public ID",
    method: "GET",
    path: "/api/configurator/[publicId]",
    description: "Get configurator (replace [publicId] with actual ID)",
    category: "Configurator",
    requiresAuth: false,
  },

  // Category
  {
    name: "Create Category",
    method: "POST",
    path: "/api/category/create",
    description: "Create new category",
    category: "Category",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        configuratorId: "configurator_id_here",
        name: "Color",
        categoryType: "COLOR",
        description: "Choose your color",
        isRequired: true,
        orderIndex: 1,
      },
      null,
      2
    ),
  },
  {
    name: "List Categories",
    method: "GET",
    path: "/api/category/list?configuratorId=configurator_id_here",
    description: "List categories for configurator",
    category: "Category",
    requiresAuth: false,
  },
  {
    name: "Update Category",
    method: "PUT",
    path: "/api/category/update",
    description: "Update category",
    category: "Category",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "category_id_here",
        name: "Updated Category Name",
        orderIndex: 2,
      },
      null,
      2
    ),
  },

  // Option
  {
    name: "Create Option",
    method: "POST",
    path: "/api/option/create",
    description: "Create new option",
    category: "Option",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        categoryId: "category_id_here",
        label: "Red",
        description: "Bright red color",
        price: 0,
        hexColor: "#FF0000",
        isDefault: false,
      },
      null,
      2
    ),
  },
  {
    name: "List Options",
    method: "GET",
    path: "/api/option/list?categoryId=category_id_here",
    description: "List options for category",
    category: "Option",
    requiresAuth: false,
  },
  {
    name: "Update Option",
    method: "PUT",
    path: "/api/option/update",
    description: "Update option",
    category: "Option",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        id: "option_id_here",
        label: "Updated Option",
        price: 99.99,
      },
      null,
      2
    ),
  },

  // Theme
  {
    name: "List Themes",
    method: "GET",
    path: "/api/theme/list",
    description: "Get all themes",
    category: "Theme",
    requiresAuth: true,
  },
  {
    name: "Create Theme",
    method: "POST",
    path: "/api/theme/create",
    description: "Create new theme",
    category: "Theme",
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        name: "Custom Theme",
        primaryColor: "220 70% 50%",
        secondaryColor: "340 70% 50%",
        isDefault: false,
      },
      null,
      2
    ),
  },

  // Quote
  {
    name: "Create Quote",
    method: "POST",
    path: "/api/quote/create",
    description: "Create quote (for embedded configurator)",
    category: "Quote",
    requiresAuth: false,
    defaultBody: JSON.stringify(
      {
        configuratorId: "configurator_id_here",
        customerEmail: "customer@example.com",
        customerName: "John Doe",
        selectedOptions: { color: "Red", size: "Large" },
        totalPrice: 1299.99,
      },
      null,
      2
    ),
  },
  {
    name: "List Quotes",
    method: "GET",
    path: "/api/quote/list",
    description: "Get all quotes",
    category: "Quote",
    requiresAuth: true,
  },
  {
    name: "Get Quote by Code",
    method: "GET",
    path: "/api/quote/[quoteCode]",
    description: "Get quote (replace [quoteCode] with actual code)",
    category: "Quote",
    requiresAuth: false,
  },

  // Health
  {
    name: "Health Check",
    method: "GET",
    path: "/api/health",
    description: "Check API and integrations health",
    category: "System",
    requiresAuth: false,
  },

  // Files
  {
    name: "List Files",
    method: "GET",
    path: "/api/files/list",
    description: "Get all uploaded files",
    category: "Files",
    requiresAuth: true,
  },

  // Analytics
  {
    name: "Usage Statistics",
    method: "GET",
    path: "/api/analytics/usage",
    description: "Get usage statistics",
    category: "Analytics",
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

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 400 && status < 500) return "text-yellow-500";
    if (status >= 500) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="container mx-auto p-8 max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">API Testing Console</h1>
        <p className="text-muted-foreground text-lg">
          Test all API endpoints with custom headers and payloads
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Endpoint List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              {API_ENDPOINTS.length} endpoints available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-2 p-4">
                {categories.map((category) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      {category}
                    </h3>
                    {API_ENDPOINTS.filter((e) => e.category === category).map(
                      (endpoint) => (
                        <button
                          key={endpoint.path}
                          onClick={() => handleSelectEndpoint(endpoint)}
                          className={`w-full text-left p-3 rounded-lg border mb-2 hover:bg-muted/50 transition-colors ${
                            selectedEndpoint.path === endpoint.path
                              ? "bg-muted border-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
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
                                🔒
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{selectedEndpoint.name}</CardTitle>
            <CardDescription>{selectedEndpoint.description}</CardDescription>
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
                        />
                        <Input
                          placeholder="Key"
                          value={header.key}
                          onChange={(e) =>
                            updateHeader(header.id, "key", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) =>
                            updateHeader(header.id, "value", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(header.id)}
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
                      className="font-mono text-sm h-64"
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
                        <pre className="p-4 text-sm font-mono">
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
