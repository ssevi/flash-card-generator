class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    override message: string;
  
    constructor(statusCode: number, message: string, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.message = message;
  
      // Capture stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Export custom error class
  export { ApiError };