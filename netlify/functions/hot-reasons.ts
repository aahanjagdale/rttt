import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { storage } from "./storage";
import { withAuth } from "./utils/auth";

interface ExtendedHandlerEvent extends HandlerEvent {
  userId?: number;
}

const baseHandler = async (event: ExtendedHandlerEvent, context: HandlerContext) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers,
        body: "",
      };
    }

    if (!event.userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // List hot reasons
    if (event.httpMethod === "GET") {
      const reasons = await storage.getHotReasons(event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(reasons),
      };
    }

    // Create hot reason
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const reason = await storage.createHotReason({
        reason: body.reason,
        authorId: event.userId,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(reason),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" }),
    };

  } catch (error) {
    console.error("Hot Reasons API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const handler = withAuth(baseHandler);