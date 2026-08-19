// backend/src/middleware/logger.middleware.js

import { logEvent } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
       
      if (!req.originalUrl.startsWith("/api")) return;

      const duration = Date.now() - start;

      await logEvent({
        type: "admin",
        message: `${req.method} ${req.originalUrl}`,
        user: req.user || null,  
        meta: {
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
        },
      });
      

    } catch (err) {
      console.error("Logger middleware error:", err.message);
    }
  });

  next();
};