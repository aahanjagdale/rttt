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
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    if (!event.userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const path = event.path.replace("/.netlify/functions/tasks", "");
    const taskId = path.split("/")[1];

    // List tasks
    if (event.httpMethod === "GET") {
      const tasks = await storage.getTasks(event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tasks),
      };
    }

    // Create task
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const task = await storage.createTask({
        title: body.title,
        creatorId: event.userId,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(task),
      };
    }

    // Complete task
    if (event.httpMethod === "PATCH" && taskId) {
      const task = await storage.completeTask(parseInt(taskId), event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(task),
      };
    }

    // Delete task
    if (event.httpMethod === "DELETE" && taskId) {
      await storage.deleteTask(parseInt(taskId), event.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Task deleted" }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" }),
    };

  } catch (error) {
    console.error("Tasks API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const handler = withAuth(baseHandler);