export const extractUser = (req, res, next) => {
  try {
    console.log(`Extracting user from request headers`);
    const userEmail = req.headers["x-user-email"];
    const userId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    if (!userId || !userEmail) {
      return res.status(401).json({
        error: "User information missing from gateway",
        code: "MISSING_USER_INFO",
      });
    }

    req.user = {
      id: userId,
      email: userEmail,
      role: userRole,
    };

    next();
  } catch (error) {
    next(error);
  }
};
