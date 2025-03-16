import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": process.env.NODE_ENV === 'development' ? "*" : "https://*.netlify.app",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  };

  try {
    console.log(`API Request: ${event.httpMethod} ${event.path}`);

    // Handle preflight requests
    if (event.httpMethod === "OPTIONS") {
      return { 
        statusCode: 204, 
        headers, 
        body: "" 
      };
    }

    // Extract route from path
    const path = event.path.replace("/.netlify/functions/api", "");
    console.log(`Processed path: ${path}`);

    // Health check endpoint
    if (path === "/health") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: "healthy",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          storage: "in-memory"
        }),
      };
    }

    // Route handling for all other paths should be done by their respective function handlers
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: "Not Found",
        message: "This endpoint is not handled by the API function. Make sure you're using the correct function handler."
      }),
    };

  } catch (error) {
    console.error("API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal Server Error",
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      }),
    };
  }
};