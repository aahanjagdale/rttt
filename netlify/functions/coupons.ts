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

    const path = event.path.replace("/.netlify/functions/coupons", "");
    const couponId = path.split("/")[1];

    // List coupons
    if (event.httpMethod === "GET") {
      if (path === "/inventory") {
        const inventory = await storage.getCouponInventory(event.userId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(inventory),
        };
      }

      const coupons = await storage.getCoupons(event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(coupons),
      };
    }

    // Create or send coupon
    if (event.httpMethod === "POST") {
      if (path.includes("/send")) {
        const couponId = parseInt(path.split("/")[1]);
        const body = JSON.parse(event.body || "{}");
        const coupon = await storage.sendCoupon(couponId, event.userId, body.receiverId);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(coupon),
        };
      }

      const body = JSON.parse(event.body || "{}");
      const coupon = await storage.createCoupon({
        title: body.title,
        creatorId: event.userId,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(coupon),
      };
    }

    // Delete coupon
    if (event.httpMethod === "DELETE" && couponId) {
      await storage.deleteCoupon(parseInt(couponId), event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Coupon deleted" }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" }),
    };

  } catch (error) {
    console.error("Coupons API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const handler = withAuth(baseHandler);