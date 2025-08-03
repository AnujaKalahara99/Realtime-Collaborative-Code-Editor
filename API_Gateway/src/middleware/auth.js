import jwt from "jsonwebtoken";

const setupAuth = (app, routes) => {
  const hmacSecret = process.env.SUPABASE_JWT_SECRET;

  if (!hmacSecret) {
    console.error("Please set the SUPABASE_JWT_SECRET environment variable");
    process.exit(1);
  }

  const jwtProtect = () => {
    return (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      jwt.verify(token, hmacSecret, (err, decoded) => {
        if (err) {
          console.log(`Error parsing token: ${err.message}`);
          return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = decoded;
        req.headers["x-user-id"] = decoded.sub;
        req.headers["x-user-email"] = decoded.email;
        req.headers["x-user-role"] = "admin";
        next();
      });
    };
  };

  routes.forEach((r) => {
    if (r.auth) {
      app.use(r.url, jwtProtect(), function (req, res, next) {
        next();
      });
    }
  });
};

export default setupAuth;
