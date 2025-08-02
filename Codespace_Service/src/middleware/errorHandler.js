export const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  // Supabase errors
  if (error.code && error.message) {
    return res.status(500).json({
      error: "Database operation failed",
      code: "DATABASE_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};
