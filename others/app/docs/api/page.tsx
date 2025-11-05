"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Book,
  Search,
  Code2,
  Lock,
  Unlock,
  FileCode,
  Database,
  Palette,
  FileText,
  Image,
  Ticket,
} from "lucide-react";

interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  requiresEditToken?: boolean;
  requestBody?: any;
  responseExample?: any;
  queryParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  notes?: string[];
}

const API_DOCS: ApiEndpoint[] = [
  // ==================== CONFIGURATOR ====================
  {
    name: "List Configurators",
    method: "GET",
    path: "/api/configurator/list",
    description:
      "Retrieves all configurators owned by the authenticated client, including full category and option details with incompatibility rules.",
    category: "Configurator",
    requiresAuth: true,
    responseExample: {
      success: true,
      data: [
        {
          id: "clxxx123",
          publicId: "pub_abc123",
          clientId: "client_xyz",
          name: "Industrial Circuit Breaker Configurator",
          description: "Configure your custom industrial circuit breaker",
          slug: "industrial-circuit-breaker-configurator",
          isActive: true,
          isPublished: true,
          currency: "USD",
          currencySymbol: "$",
          categories: [
            {
              id: "cat_1",
              name: "Power Rating",
              categoryType: "POWER",
              options: [
                {
                  id: "opt_1",
                  label: "15A - 120V",
                  sku: "PWR-15A",
                  price: "45.00",
                  incompatibleWith: [],
                },
              ],
            },
          ],
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z",
        },
      ],
    },
    notes: [
      "Returns all configurators with nested categories, options, and incompatibility rules",
      "Ordered by creation date (newest first)",
    ],
  },
  {
    name: "Create Configurator",
    method: "POST",
    path: "/api/configurator/create",
    description:
      "Creates a new configurator. This is the first step in setting up a complete configurator. After creation, add categories and options separately.",
    category: "Configurator",
    requiresAuth: true,
    requestBody: {
      name: "Industrial Circuit Breaker Configurator",
      description:
        "Configure your custom industrial circuit breaker with advanced protection features",
      currency: "USD",
      currencySymbol: "$",
      themeId: "theme_id_optional",
    },
    responseExample: {
      success: true,
      message: "Configurator created",
      data: {
        id: "clxxx123",
        publicId: "pub_abc123",
        clientId: "client_xyz",
        name: "Industrial Circuit Breaker Configurator",
        slug: "industrial-circuit-breaker-configurator",
        isActive: true,
        isPublished: false,
        currency: "USD",
        currencySymbol: "$",
        createdAt: "2025-01-15T10:00:00Z",
      },
    },
    notes: [
      "The 'name' field is required, all others are optional",
      "A unique slug is automatically generated from the name",
      "publicId is used for embed and public access",
      "After creation, use the returned 'id' to create categories",
    ],
  },
  {
    name: "Get Configurator by Public ID",
    method: "GET",
    path: "/api/configurator/{publicId}",
    description:
      "Retrieves a configurator by its public ID. This is the primary endpoint used by embedded configurators. No authentication required.",
    category: "Configurator",
    requiresAuth: false,
    responseExample: {
      success: true,
      data: {
        id: "clxxx123",
        publicId: "pub_abc123",
        name: "Industrial Circuit Breaker Configurator",
        description: "Configure your custom industrial circuit breaker",
        isActive: true,
        isPublished: true,
        currency: "USD",
        currencySymbol: "$",
        categories: [
          {
            id: "cat_1",
            name: "Power Rating",
            categoryType: "POWER",
            description: "Select the power capacity",
            isRequired: true,
            isPrimary: true,
            orderIndex: 1,
            options: [
              {
                id: "opt_1",
                label: "15A - 120V",
                sku: "PWR-15A",
                description: "Standard residential power rating",
                price: "45.00",
                imageUrl: null,
                isDefault: false,
                inStock: true,
                incompatibleWith: [
                  {
                    id: "incomp_1",
                    incompatibleOptionId: "opt_15",
                    severity: "error",
                    message: "15A breakers not available with flush mounting",
                  },
                ],
              },
            ],
          },
        ],
        theme: {
          name: "Default Theme",
          primaryColor: "220 70% 50%",
        },
      },
    },
    notes: [
      "Replace {publicId} with actual publicId value",
      "Returns full configurator structure with all categories and options",
      "Includes incompatibility rules for frontend validation",
      "CORS enabled for embed usage",
      "Origin must be in client's allowedDomains list",
    ],
  },
  {
    name: "Update Configurator",
    method: "PUT",
    path: "/api/configurator/update",
    description:
      "Updates configurator details. Requires a valid edit token obtained from the generate-edit-token endpoint.",
    category: "Configurator",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      name: "Updated Configurator Name",
      description: "Updated description",
      isPublished: true,
      isActive: true,
      currency: "EUR",
      currencySymbol: "€",
    },
    responseExample: {
      success: true,
      message: "Configurator updated successfully",
      data: {
        id: "clxxx123",
        name: "Updated Configurator Name",
        description: "Updated description",
        isPublished: true,
        updatedAt: "2025-01-15T12:30:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "Edit tokens expire after 30 minutes",
      "Only updatable fields need to be included in the request",
      "The token contains embedded configuratorId - no need to pass it separately",
    ],
  },
  {
    name: "Duplicate Configurator",
    method: "POST",
    path: "/api/configurator/duplicate",
    description:
      "Creates a complete copy of an existing configurator including all categories, options, and incompatibility rules.",
    category: "Configurator",
    requiresAuth: true,
    requestBody: {
      id: "clxxx123",
    },
    responseExample: {
      success: true,
      message: "Configurator duplicated",
      data: {
        id: "clxxx456",
        publicId: "pub_def456",
        name: "Industrial Circuit Breaker Configurator (Copy)",
        isPublished: false,
        categories: [],
      },
    },
    notes: [
      "Creates a deep copy with new IDs for configurator, categories, and options",
      "Appends '(Copy)' to the duplicated configurator name",
      "New configurator starts as unpublished",
      "All relationships and incompatibilities are preserved",
    ],
  },
  {
    name: "Delete Configurator",
    method: "DELETE",
    path: "/api/configurator/delete",
    description:
      "Permanently deletes a configurator and all associated categories, options, and quotes. This action cannot be undone. Requires a valid edit token.",
    category: "Configurator",
    requiresAuth: false,
    requiresEditToken: true,
    queryParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "The configurator ID to delete",
      },
      {
        name: "token",
        type: "string",
        required: true,
        description: "Valid edit token",
      },
    ],
    responseExample: {
      success: true,
      message: "Configurator deleted",
      data: null,
    },
    notes: [
      "Pass configurator ID and token as query parameters: ?id=clxxx123&token=...",
      "The 'token' field is required and must be a valid edit token",
      "Cascading delete removes all related data",
      "Verifies ownership before deletion",
    ],
  },
  {
    name: "Generate Edit Token",
    method: "POST",
    path: "/api/configurator/generate-edit-token",
    description:
      "Generates a temporary JWT token for editing a configurator. Token is valid for 30 minutes and contains embedded client and configurator identification.",
    category: "Configurator",
    requiresAuth: true,
    requestBody: {
      configuratorId: "clxxx123",
    },
    responseExample: {
      success: true,
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRfeHl6IiwiY29uZmlndXJhdG9ySWQiOiJjbHh4eDEyMyIsInR5cGUiOiJjb25maWd1cmF0b3JfZWRpdCIsImlhdCI6MTcwNTMxNjQwMCwiZXhwIjoxNzA1MzE4MjAwfQ.signature",
      },
    },
    notes: [
      "Use this token in the 'token' field of update requests",
      "Token expires after 30 minutes",
      "Verifies configurator ownership before generating token",
      "Token contains: clientId, configuratorId, and expiration",
    ],
  },
  {
    name: "Verify Edit Token",
    method: "POST",
    path: "/api/configurator/verify-edit-token",
    description:
      "Verifies an edit token's validity and returns the associated configurator's public ID. Used to check token status before allowing edits.",
    category: "Configurator",
    requiresAuth: false,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    responseExample: {
      success: true,
      data: {
        valid: true,
        publicId: "pub_abc123",
      },
    },
    notes: [
      "Returns valid: false if token is expired or invalid",
      "Checks token signature, expiration, and ownership",
      "CORS enabled for use from embedded contexts",
    ],
  },

  // ==================== CATEGORY ====================
  {
    name: "List Categories",
    method: "GET",
    path: "/api/category/list",
    description:
      "Retrieves all categories for a specific configurator, including all options with their incompatibility rules.",
    category: "Category",
    requiresAuth: false,
    queryParams: [
      {
        name: "configuratorId",
        type: "string",
        required: true,
        description: "The configurator ID to fetch categories for",
      },
    ],
    responseExample: {
      success: true,
      data: [
        {
          id: "cat_1",
          configuratorId: "clxxx123",
          name: "Power Rating",
          categoryType: "POWER",
          description: "Select the power capacity of your circuit breaker",
          isRequired: true,
          isPrimary: true,
          orderIndex: 1,
          icon: null,
          options: [
            {
              id: "opt_1",
              label: "15A - 120V",
              sku: "PWR-15A",
              price: "45.00",
              description: "Standard residential power rating",
            },
          ],
        },
      ],
    },
    notes: [
      "Pass configuratorId as query parameter: ?configuratorId=clxxx123",
      "Returns categories ordered by orderIndex",
      "Includes all options for each category",
    ],
  },
  {
    name: "Create Category",
    method: "POST",
    path: "/api/category/create",
    description:
      "Creates a new category within a configurator. This is the second step after creating a configurator. Requires a valid edit token.",
    category: "Category",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      configuratorId: "clxxx123",
      name: "Power Rating",
      categoryType: "POWER",
      description: "Select the power capacity",
      isRequired: true,
      isPrimary: true,
      orderIndex: 1,
    },
    responseExample: {
      success: true,
      message: "Category created",
      data: {
        id: "cat_1",
        configuratorId: "clxxx123",
        name: "Power Rating",
        categoryType: "POWER",
        description: "Select the power capacity",
        isRequired: true,
        isPrimary: true,
        orderIndex: 1,
        createdAt: "2025-01-15T10:05:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "Edit tokens expire after 30 minutes",
      "configuratorId and name are required",
      "categoryType options: GENERIC, COLOR, DIMENSION, MATERIAL, FEATURE, ACCESSORY, POWER, TEXT, FINISH, CUSTOM",
      "orderIndex determines display order in frontend",
      "isPrimary: true marks the category as featured",
      "Use the returned category 'id' to create options",
    ],
  },
  {
    name: "Update Category",
    method: "PUT",
    path: "/api/category/update",
    description:
      "Updates an existing category's properties. Requires a valid edit token.",
    category: "Category",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      id: "cat_1",
      name: "Updated Category Name",
      description: "Updated description",
      orderIndex: 2,
      isRequired: false,
      isPrimary: false,
    },
    responseExample: {
      success: true,
      message: "Category updated",
      data: {
        id: "cat_1",
        name: "Updated Category Name",
        orderIndex: 2,
        updatedAt: "2025-01-15T11:00:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "Only include fields you want to update",
      "Verifies ownership through configurator relationship",
    ],
  },
  {
    name: "Delete Category",
    method: "DELETE",
    path: "/api/category/update",
    description:
      "Deletes a category and all associated options. Requires a valid edit token.",
    category: "Category",
    requiresAuth: false,
    requiresEditToken: true,
    queryParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "The category ID to delete",
      },
      {
        name: "token",
        type: "string",
        required: true,
        description: "Valid edit token",
      },
    ],
    responseExample: {
      success: true,
      message: "Category deleted",
      data: null,
    },
    notes: [
      "Pass category ID and token as query parameters: ?id=cat_1&token=...",
      "Cascading delete removes all related options",
      "Verifies ownership before deletion",
    ],
  },

  // ==================== OPTION ====================
  {
    name: "List Options",
    method: "GET",
    path: "/api/option/list",
    description:
      "Retrieves all options for a specific category, including incompatibility relationships.",
    category: "Option",
    requiresAuth: false,
    queryParams: [
      {
        name: "categoryId",
        type: "string",
        required: true,
        description: "The category ID to fetch options for",
      },
    ],
    responseExample: {
      success: true,
      data: [
        {
          id: "opt_1",
          categoryId: "cat_1",
          label: "15A - 120V",
          sku: "PWR-15A",
          description: "Standard residential power rating",
          price: "45.00",
          imageUrl: null,
          isDefault: false,
          isActive: true,
          inStock: true,
          orderIndex: 0,
          incompatibleWith: [
            {
              id: "incomp_1",
              incompatibleOptionId: "opt_15",
              severity: "error",
              message: "15A breakers not available with flush mounting",
            },
          ],
        },
      ],
    },
    notes: [
      "Pass categoryId as query parameter: ?categoryId=cat_1",
      "Returns options ordered by orderIndex",
      "Includes incompatibility rules for validation",
    ],
  },
  {
    name: "Create Option",
    method: "POST",
    path: "/api/option/create",
    description:
      "Creates a new option within a category. This is the third step after creating configurator and category. Requires a valid edit token.",
    category: "Option",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      categoryId: "cat_1",
      label: "15A - 120V",
      sku: "PWR-15A",
      description: "Standard residential power rating",
      price: 45.0,
      imageUrl: "https://example.com/image.jpg",
      isDefault: false,
      isActive: true,
      inStock: true,
    },
    responseExample: {
      success: true,
      message: "Option created",
      data: {
        id: "opt_1",
        categoryId: "cat_1",
        label: "15A - 120V",
        sku: "PWR-15A",
        price: "45.00",
        createdAt: "2025-01-15T10:10:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "Edit tokens expire after 30 minutes",
      "categoryId, label, and price are required",
      "price can be 0 for free options",
      "imageUrl is optional but recommended",
      "Use the returned option 'id' to set incompatibilities",
    ],
  },
  {
    name: "Update Option",
    method: "PUT",
    path: "/api/option/update",
    description:
      "Updates an existing option's properties and sets incompatibility rules with other options. Requires a valid edit token.",
    category: "Option",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      id: "opt_1",
      label: "Updated Option Label",
      price: 125.5,
      description: "Updated description",
      incompatibleWith: ["opt_15", "opt_20", "opt_25"],
    },
    responseExample: {
      success: true,
      message: "Option updated",
      data: {
        id: "opt_1",
        label: "Updated Option Label",
        price: "125.50",
        updatedAt: "2025-01-15T11:30:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "incompatibleWith is an array of option IDs",
      "Setting incompatibleWith creates OptionIncompatibility records",
      "Incompatibilities are bidirectional (A incompatible with B means B incompatible with A)",
      "Pass empty array to remove all incompatibilities",
    ],
  },
  {
    name: "Delete Option",
    method: "DELETE",
    path: "/api/option/update",
    description: "Deletes an option. Requires a valid edit token.",
    category: "Option",
    requiresAuth: false,
    requiresEditToken: true,
    queryParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "The option ID to delete",
      },
      {
        name: "token",
        type: "string",
        required: true,
        description: "Valid edit token",
      },
    ],
    responseExample: {
      success: true,
      message: "Option deleted",
      data: null,
    },
    notes: [
      "Pass option ID and token as query parameters: ?id=opt_1&token=...",
      "Removes all incompatibility relationships",
      "Verifies ownership before deletion",
    ],
  },

  // ==================== THEME ====================
  {
    name: "List Themes",
    method: "GET",
    path: "/api/theme/list",
    description: "Retrieves all themes created by the authenticated client.",
    category: "Theme",
    requiresAuth: true,
    responseExample: {
      success: true,
      data: [
        {
          id: "theme_1",
          clientId: "client_xyz",
          name: "Custom Industrial Theme",
          description: "Dark theme for industrial applications",
          isDefault: false,
          primaryColor: "220 70% 50%",
          secondaryColor: "340 70% 50%",
          accentColor: "280 70% 50%",
          backgroundColor: "0 0% 10%",
          surfaceColor: "0 0% 15%",
          textColor: "0 0% 95%",
          fontFamily: "Inter, sans-serif",
          borderRadius: "0.5rem",
        },
      ],
    },
    notes: [
      "Returns all themes for the authenticated client",
      "Colors use HSL format: 'hue saturation% lightness%'",
    ],
  },
  {
    name: "Create Theme",
    method: "POST",
    path: "/api/theme/create",
    description:
      "Creates a custom theme for configurators. Requires a valid edit token.",
    category: "Theme",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
    responseExample: {
      success: true,
      message: "Theme created",
      data: {
        id: "theme_1",
        name: "Custom Industrial Theme",
        primaryColor: "220 70% 50%",
        createdAt: "2025-01-15T09:00:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "All color fields use HSL format",
      "Only one theme can be marked as isDefault: true",
      "Use theme ID when creating a configurator",
    ],
  },
  {
    name: "Update Theme",
    method: "PUT",
    path: "/api/theme/update",
    description:
      "Updates an existing theme's properties. Requires a valid edit token.",
    category: "Theme",
    requiresAuth: false,
    requiresEditToken: true,
    requestBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      id: "theme_1",
      name: "Updated Theme Name",
      primaryColor: "200 80% 45%",
      isDefault: true,
    },
    responseExample: {
      success: true,
      message: "Theme updated",
      data: {
        id: "theme_1",
        name: "Updated Theme Name",
        updatedAt: "2025-01-15T10:00:00Z",
      },
    },
    notes: [
      "The 'token' field is required and must be a valid edit token",
      "Only include fields you want to update",
    ],
  },
  {
    name: "Delete Theme",
    method: "DELETE",
    path: "/api/theme/update",
    description: "Deletes a theme. Requires a valid edit token.",
    category: "Theme",
    requiresAuth: false,
    requiresEditToken: true,
    queryParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "The theme ID to delete",
      },
      {
        name: "token",
        type: "string",
        required: true,
        description: "Valid edit token",
      },
    ],
    responseExample: {
      success: true,
      message: "Theme deleted",
      data: null,
    },
    notes: [
      "Pass theme ID and token as query parameters: ?id=theme_1&token=...",
      "Cannot delete theme if it's in use by configurators",
      "Verifies ownership before deletion",
    ],
  },

  // ==================== QUOTE ====================
  {
    name: "List Quotes",
    method: "GET",
    path: "/api/quote/list",
    description:
      "Retrieves all quotes for the authenticated client, ordered by creation date.",
    category: "Quote",
    requiresAuth: true,
    responseExample: {
      success: true,
      data: [
        {
          id: "quote_1",
          quoteCode: "QT-ABC123",
          configuratorId: "clxxx123",
          customerEmail: "customer@example.com",
          customerName: "John Smith",
          customerPhone: "+1-555-0123",
          totalPrice: "340.00",
          status: "PENDING",
          selectedOptions: {
            "Power Rating": "50A - 240V",
            "Mounting Type": "Panel Mount",
          },
          createdAt: "2025-01-15T14:00:00Z",
        },
      ],
    },
    notes: [
      "Quotes ordered by creation date (newest first)",
      "Includes customer details and configuration snapshot",
    ],
  },
  {
    name: "Create Quote",
    method: "POST",
    path: "/api/quote/create",
    description:
      "Creates a quote from a configurator. This is a public endpoint used by embedded configurators. Requires X-Public-Key header.",
    category: "Quote",
    requiresAuth: false,
    requestBody: {
      configuratorId: "clxxx123",
      customerEmail: "customer@example.com",
      customerName: "John Smith",
      customerPhone: "+1-555-0123",
      selectedOptions: {
        "Power Rating": "50A - 240V",
        "Mounting Type": "Panel Mount",
        "Protection Type": "Thermal-Magnetic",
      },
      totalPrice: 340.0,
      configuration: {
        items: [
          { sku: "PWR-50A", label: "50A - 240V", price: 125.0 },
          { sku: "MNT-PNL", label: "Panel Mount", price: 15.0 },
          { sku: "PRO-MAG", label: "Thermal-Magnetic", price: 25.0 },
        ],
      },
    },
    responseExample: {
      success: true,
      message: "Quote created",
      data: {
        id: "quote_1",
        quoteCode: "QT-ABC123",
        customerEmail: "customer@example.com",
        totalPrice: "340.00",
        status: "PENDING",
        createdAt: "2025-01-15T14:00:00Z",
      },
    },
    notes: [
      "Requires X-Public-Key header with client's public key",
      "customerEmail and totalPrice are required",
      "CORS enabled for embed usage",
      "Automatically tracks analytics event",
      "Returns unique quoteCode for tracking",
    ],
  },
  {
    name: "Get Quote by Code",
    method: "GET",
    path: "/api/quote/{quoteCode}",
    description:
      "Retrieves a quote by its unique quote code. No authentication required.",
    category: "Quote",
    requiresAuth: false,
    responseExample: {
      success: true,
      data: {
        id: "quote_1",
        quoteCode: "QT-ABC123",
        customerEmail: "customer@example.com",
        customerName: "John Smith",
        totalPrice: "340.00",
        status: "PENDING",
        selectedOptions: {},
        configuration: {},
        createdAt: "2025-01-15T14:00:00Z",
      },
    },
    notes: [
      "Replace {quoteCode} with actual quote code",
      "Useful for quote tracking pages",
    ],
  },
  {
    name: "Update Quote",
    method: "PUT",
    path: "/api/quote/update",
    description:
      "Updates quote status and details. Used for quote management workflow.",
    category: "Quote",
    requiresAuth: true,
    requestBody: {
      id: "quote_1",
      status: "SENT",
      internalNotes: "Quote sent to customer via email",
      adminNotes: "Customer requested expedited processing",
      validUntil: "2025-02-15T00:00:00Z",
    },
    responseExample: {
      success: true,
      message: "Quote updated",
      data: {
        id: "quote_1",
        status: "SENT",
        updatedAt: "2025-01-15T15:00:00Z",
      },
    },
    notes: [
      "Status options: DRAFT, PENDING, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED",
      "internalNotes: for internal team use only",
      "adminNotes: visible to admins only",
      "customerNotes: can be shared with customer",
    ],
  },

  // ==================== FILES ====================
  {
    name: "List Files",
    method: "GET",
    path: "/api/files/list",
    description: "Retrieves all files uploaded by the authenticated client.",
    category: "Files",
    requiresAuth: true,
    responseExample: {
      success: true,
      data: [
        {
          id: "file_1",
          filename: "product-image.jpg",
          originalName: "circuit-breaker.jpg",
          fileType: "IMAGE",
          mimeType: "image/jpeg",
          size: 245678,
          url: "https://storage.example.com/files/product-image.jpg",
          isPublic: true,
          createdAt: "2025-01-15T09:00:00Z",
        },
      ],
    },
    notes: [
      "Returns all uploaded files with metadata",
      "File URLs are direct links to storage",
      "fileType: IMAGE, DOCUMENT, ASSET, OTHER",
    ],
  },
  {
    name: "Upload File",
    method: "POST",
    path: "/api/files/upload",
    description:
      "Uploads a file to storage. Requires multipart/form-data content type.",
    category: "Files",
    requiresAuth: true,
    requestBody: "multipart/form-data with 'file' field",
    responseExample: {
      success: true,
      message: "File uploaded",
      data: {
        id: "file_1",
        filename: "product-image-1705316400.jpg",
        originalName: "circuit-breaker.jpg",
        fileType: "IMAGE",
        mimeType: "image/jpeg",
        size: 245678,
        url: "https://storage.example.com/files/product-image-1705316400.jpg",
        createdAt: "2025-01-15T09:00:00Z",
      },
    },
    notes: [
      "Content-Type must be multipart/form-data",
      "File must be in 'file' form field",
      "Filename is automatically sanitized and timestamped",
      "Returns permanent URL for use in configurators",
    ],
  },
  {
    name: "Get Upload URL",
    method: "GET",
    path: "/api/files/upload",
    description:
      "Gets a signed URL for direct file upload to cloud storage (Azure/S3). Useful for client-side uploads.",
    category: "Files",
    requiresAuth: true,
    queryParams: [
      {
        name: "filename",
        type: "string",
        required: true,
        description: "Original filename",
      },
      {
        name: "contentType",
        type: "string",
        required: true,
        description: "File MIME type",
      },
    ],
    responseExample: {
      success: true,
      data: {
        uploadUrl: "https://storage.example.com/upload?signature=...",
        fileUrl: "https://storage.example.com/files/product-image.jpg",
        expiresIn: 3600,
      },
    },
    notes: [
      "Returns pre-signed URL for direct upload",
      "Upload URL expires in 1 hour",
      "After upload, use fileUrl in your configurator",
    ],
  },
  {
    name: "Delete File",
    method: "DELETE",
    path: "/api/files/delete",
    description: "Deletes a file from storage and database.",
    category: "Files",
    requiresAuth: true,
    queryParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "File ID to delete",
      },
    ],
    responseExample: {
      success: true,
      message: "File deleted",
      data: null,
    },
    notes: [
      "Pass file ID as query parameter: ?id=file_1",
      "Permanently removes file from storage and database",
      "Verifies ownership before deletion",
    ],
  },
];

const CATEGORY_ICONS = {
  Configurator: FileCode,
  Category: Database,
  Option: Code2,
  Theme: Palette,
  Quote: FileText,
  Files: Image,
};

export default function ApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(API_DOCS.map((e) => e.category)));

  const filteredDocs = API_DOCS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Book className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">API Documentation</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Complete API reference for Configurator Platform - All endpoints,
          authentication, and examples
        </p>
      </div>

      {/* Authentication Guide */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              Standard Authentication (Bearer Token)
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Most endpoints require authentication using a Bearer token in the
              Authorization header:
            </p>
            <code className="block bg-white dark:bg-gray-900 p-3 rounded border text-sm">
              Authorization: Bearer your_session_token_here
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Edit Token Flow (for Configurator, Category, Theme, and Option
              Updates)
            </h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>
                Call{" "}
                <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">
                  /api/configurator/generate-edit-token
                </code>{" "}
                with configuratorId
              </li>
              <li>Receive a JWT token valid for 30 minutes</li>
              <li>
                Use token in write operations:{" "}
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Configurator: update, delete</li>
                  <li>• Category: create, update, delete</li>
                  <li>• Option: create, update, delete</li>
                  <li>• Theme: create, update, delete</li>
                </ul>
              </li>
              <li>
                Optionally verify token with{" "}
                <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">
                  /api/configurator/verify-edit-token
                </code>
              </li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Note:</strong> All create/update/delete operations for
              Category, Theme, and Option now require edit tokens for enhanced
              security.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Public API (X-Public-Key)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              For embedded configurators and quote creation, use your public
              key:
            </p>
            <code className="block bg-white dark:bg-gray-900 p-3 rounded border text-sm">
              X-Public-Key: your_public_key_here
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Used for: /api/quote/create, /api/configurator/[publicId]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        {filteredDocs.map((endpoint) => {
          const Icon =
            CATEGORY_ICONS[endpoint.category as keyof typeof CATEGORY_ICONS];
          return (
            <Card
              key={endpoint.name + endpoint.method}
              data-testid={`endpoint-${endpoint.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {Icon && (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle>{endpoint.name}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
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
                        >
                          {endpoint.method}
                        </Badge>
                        {endpoint.requiresAuth && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Auth
                          </Badge>
                        )}
                        {endpoint.requiresEditToken && (
                          <Badge variant="outline" className="gap-1">
                            <Ticket className="h-3 w-3" />
                            Edit Token
                          </Badge>
                        )}
                        {!endpoint.requiresAuth &&
                          !endpoint.requiresEditToken && (
                            <Badge variant="outline" className="gap-1">
                              <Unlock className="h-3 w-3" />
                              Public
                            </Badge>
                          )}
                      </div>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {endpoint.requestBody && (
                      <TabsTrigger value="request">Request</TabsTrigger>
                    )}
                    {endpoint.queryParams && (
                      <TabsTrigger value="params">Query Params</TabsTrigger>
                    )}
                    {endpoint.responseExample && (
                      <TabsTrigger value="response">Response</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Endpoint</Label>
                      <code className="block bg-muted p-3 rounded-md mt-1 text-sm">
                        {endpoint.method} {endpoint.path}
                      </code>
                    </div>

                    {endpoint.notes && endpoint.notes.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">
                          Important Notes
                        </Label>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {endpoint.notes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  {endpoint.requestBody && (
                    <TabsContent value="request">
                      <Label className="text-sm font-semibold mb-2 block">
                        Request Body
                      </Label>
                      <ScrollArea className="h-80 w-full rounded-md border">
                        <pre className="p-4 text-xs font-mono">
                          {typeof endpoint.requestBody === "string"
                            ? endpoint.requestBody
                            : JSON.stringify(endpoint.requestBody, null, 2)}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  )}

                  {endpoint.queryParams && (
                    <TabsContent value="params">
                      <div className="space-y-3">
                        {endpoint.queryParams.map((param) => (
                          <div
                            key={param.name}
                            className="border rounded-md p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-semibold">
                                {param.name}
                              </code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {endpoint.responseExample && (
                    <TabsContent value="response">
                      <Label className="text-sm font-semibold mb-2 block">
                        Response Example
                      </Label>
                      <ScrollArea className="h-80 w-full rounded-md border">
                        <pre className="p-4 text-xs font-mono">
                          {JSON.stringify(endpoint.responseExample, null, 2)}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No endpoints found matching your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
