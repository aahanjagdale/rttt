// Common headers for all responses
export const getResponseHeaders = () => ({
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'development' ? "*" : "https://*.netlify.app",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
});

// Standard response format
export const createResponse = (statusCode: number, data: any) => ({
  statusCode,
  headers: getResponseHeaders(),
  body: JSON.stringify(data)
});

// Error response format
export const createErrorResponse = (statusCode: number, message: string) => 
  createResponse(statusCode, { error: message });

// Success response format
export const createSuccessResponse = (data: any = {}) => 
  createResponse(200, data);

// Created response format
export const createCreatedResponse = (data: any = {}) => 
  createResponse(201, data);
