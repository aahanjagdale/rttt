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
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

    const path = event.path.replace("/.netlify/functions/bucket-list", "");
    const itemId = path.split("/")[1];

    // List bucket items
    if (event.httpMethod === "GET") {
      const items = await storage.getBucketList(event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(items),
      };
    }

    // Create bucket item
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const item = await storage.createBucketItem({
        title: body.title,
        userId: event.userId
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(item),
      };
    }

    // Delete bucket item
    if (event.httpMethod === "DELETE" && itemId) {
      await storage.deleteBucketItem(parseInt(itemId), event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Item deleted" }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" }),
    };

  } catch (error) {
    console.error("Bucket List API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const handler = withAuth(baseHandler);