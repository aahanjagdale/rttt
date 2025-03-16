import { Handler } from "@netlify/functions";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const path = event.path.replace("/.netlify/functions/auth", "");
    const body = JSON.parse(event.body || "{}");

    if (path === "/register") {
      // Check if username exists
      const existingUser = await storage.getUserByUsername(body.username);
      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Username already exists" })
        };
      }

      // Create new user
      const user = await storage.createUser(body.username, body.password);
      const token = jwt.sign({ userId: user.id }, process.env.NETLIFY_JWT_SECRET!);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ user, token })
      };
    }

    if (path === "/login") {
      const user = await storage.getUserByUsernameAndPassword(body.username, body.password);

      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Invalid credentials" })
        };
      }

      const token = jwt.sign({ userId: user.id }, process.env.NETLIFY_JWT_SECRET!);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user, token })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" })
    };

  } catch (error) {
    console.error("Auth Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};