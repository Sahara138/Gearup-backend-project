export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "GearUp Backend API",
    version: "1.0.0",
    description: "GearUp is a backend API for a sports and outdoor equipment rental service. Customers browse and rent gear, providers manage their inventory, and admins oversee users and listings.",
    contact: {
      name: "GearUp Support",
      email: "support@gearup.com"
    }
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token"
      }
    }
  },
  tags: [
    { name: "Auth", description: "Authentication & Profile endpoints" },
    { name: "Gear", description: "Sports and outdoor gear inventory" },
    { name: "Categories", description: "Gear category management" },
    { name: "Rentals", description: "Rental bookings & order lifecycle" },
    { name: "Payments", description: "Stripe checkout session & verification" },
    { name: "Reviews", description: "Customer reviews for returned gear" },
    { name: "Provider", description: "Vendor gear & order fulfillment" },
    { name: "Admin", description: "Platform moderation and user management" }
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Registers a customer or provider account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Password123!" },
                  role: { type: "string", enum: ["CUSTOMER", "PROVIDER"], default: "CUSTOMER" },
                  phoneNumber: { type: "string", example: "+1234567890" },
                  profilePhoto: { type: "string", example: "https://example.com/photo.jpg" },
                  address: { type: "string", example: "123 Adventure Way" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "User login",
        description: "Authenticates credentials and returns accessToken and refreshToken",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Password123!" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "User logged in successfully" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user profile fetched successfully" }
        }
      }
    },
    "/api/gear": {
      get: {
        tags: ["Gear"],
        summary: "Browse all gear with filters",
        description: "Search and filter by keyword, category, price, brand, and availability",
        parameters: [
          { name: "searchTerm", in: "query", schema: { type: "string" }, description: "Keyword search in title, description, brand" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category name" },
          { name: "categoryId", in: "query", schema: { type: "string" }, description: "Filter by category ID" },
          { name: "brand", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "availability", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "sortBy", in: "query", schema: { type: "string", default: "createdAt" } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } }
        ],
        responses: {
          200: { description: "Gear items retrieved successfully" }
        }
      },
      post: {
        tags: ["Gear"],
        summary: "Add gear to inventory",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "price"],
                properties: {
                  title: { type: "string", example: "Trek Mountain Bike 29er" },
                  description: { type: "string", example: "Rugged cross-country trail mountain bike." },
                  brand: { type: "string", example: "Trek" },
                  price: { type: "number", example: 45.00 },
                  discountPrice: { type: "number", example: 40.00 },
                  stock: { type: "integer", example: 5 },
                  images: { type: "array", items: { type: "string" } },
                  categoryIds: { type: "array", items: { type: "string" } },
                  specifications: { type: "object", example: { frameSize: "Large", wheelSize: "29 inches" } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Gear item added successfully" }
        }
      }
    },
    "/api/gear/{gearItemId}": {
      get: {
        tags: ["Gear"],
        summary: "Get gear details",
        parameters: [
          { name: "gearItemId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Gear item details fetched successfully" }
        }
      },
      patch: {
        tags: ["Gear"],
        summary: "Update gear listing",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "gearItemId", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE", "REMOVED"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Gear item updated successfully" }
        }
      },
      delete: {
        tags: ["Gear"],
        summary: "Remove gear item from inventory",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "gearItemId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Gear item deleted successfully" }
        }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all gear categories",
        responses: {
          200: { description: "Categories fetched successfully" }
        }
      },
      post: {
        tags: ["Categories"],
        summary: "Create a new category (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Cycling" },
                  description: { type: "string", example: "Bicycles and cycling gear" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Category created successfully" }
        }
      }
    },
    "/api/rentals": {
      post: {
        tags: ["Rentals"],
        summary: "Place a new rental order",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["startDate", "endDate", "items"],
                properties: {
                  startDate: { type: "string", example: "2026-12-01" },
                  endDate: { type: "string", example: "2026-12-05" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["gearItemId", "quantity"],
                      properties: {
                        gearItemId: { type: "string", example: "gear-uuid" },
                        quantity: { type: "integer", example: 1 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Rental order placed successfully" }
        }
      },
      get: {
        tags: ["Rentals"],
        summary: "Get user's rental orders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Rental orders retrieved successfully" }
        }
      }
    },
    "/api/rentals/{id}": {
      get: {
        tags: ["Rentals"],
        summary: "Get rental order details",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Rental order details retrieved successfully" }
        }
      }
    },
    "/api/rentals/{id}/cancel": {
      patch: {
        tags: ["Rentals"],
        summary: "Cancel rental order",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Rental order cancelled successfully" }
        }
      }
    },
    "/api/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Create Stripe payment session for a rental order",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rentalOrderId"],
                properties: {
                  rentalOrderId: { type: "string", example: "order-uuid" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Stripe checkout session created successfully" }
        }
      }
    },
    "/api/payments/confirm": {
      get: {
        tags: ["Payments"],
        summary: "Confirm / verify Stripe payment callback",
        parameters: [
          { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Payment confirmation response" }
        }
      },
      post: {
        tags: ["Payments"],
        summary: "Confirm / verify Stripe payment by JSON body",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId"],
                properties: {
                  sessionId: { type: "string", example: "cs_test_..." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Payment confirmation response" }
        }
      }
    },
    "/api/payments": {
      get: {
        tags: ["Payments"],
        summary: "Get user's payment history",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Payment history retrieved successfully" }
        }
      }
    },
    "/api/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create review (after rental return)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["gearItemId", "rating"],
                properties: {
                  gearItemId: { type: "string", example: "gear-uuid" },
                  rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                  comment: { type: "string", example: "Amazing quality gear, worked perfectly!" },
                  images: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Review submitted successfully" }
        }
      }
    },
    "/api/reviews/gear/{gearItemId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get public reviews for a gear item",
        parameters: [
          { name: "gearItemId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Gear reviews retrieved successfully" }
        }
      }
    },
    "/api/provider/orders": {
      get: {
        tags: ["Provider"],
        summary: "Get incoming orders for provider",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Incoming orders retrieved successfully" }
        }
      }
    },
    "/api/provider/orders/{id}": {
      patch: {
        tags: ["Provider"],
        summary: "Update rental order status (CONFIRMED, PICKED_UP, RETURNED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELLED"],
                    example: "CONFIRMED"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Order status updated successfully" }
        }
      }
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get all platform users",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "role", in: "query", schema: { type: "string", enum: ["CUSTOMER", "PROVIDER", "ADMIN"] } },
          { name: "activeStatus", in: "query", schema: { type: "string", enum: ["ACTIVATE", "SUSPEND"] } },
          { name: "searchTerm", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "All users retrieved successfully" }
        }
      }
    },
    "/api/admin/users/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Update user status (suspend/activate)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["activeStatus"],
                properties: {
                  activeStatus: { type: "string", enum: ["ACTIVATE", "SUSPEND"], example: "SUSPEND" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "User status updated successfully" }
        }
      }
    },
    "/api/admin/gear": {
      get: {
        tags: ["Admin"],
        summary: "Get all gear listings across the platform",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "All gear listings retrieved successfully" }
        }
      }
    },
    "/api/admin/rentals": {
      get: {
        tags: ["Admin"],
        summary: "Get all platform rental orders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "All rental orders retrieved successfully" }
        }
      }
    }
  }
};

