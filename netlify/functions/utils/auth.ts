import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

interface ExtendedHandlerEvent extends HandlerEvent {
  userId?: number;
}

export function withAuth(handler: (event: ExtendedHandlerEvent, context: HandlerContext) => Promise<any>): Handler {
  return async (event: HandlerEvent, context: HandlerContext) => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers, body: "" };
    }

    try {
      const token = event.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "No token provided" })
        };
      }

      const decoded = jwt.verify(token, process.env.NETLIFY_JWT_SECRET!) as JwtPayload;
      const extendedEvent: ExtendedHandlerEvent = {
        ...event,
        userId: decoded.userId
      };

      return await handler(extendedEvent, context);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Invalid token" })
        };
      }

      console.error("Auth error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Internal server error" })
      };
    }
  };
}