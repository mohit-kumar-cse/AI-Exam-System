// backend/src/server.js

import app from "./app.js";
import connectDB from "./config/db.js";

// Routes
import verifyRoutes from "./routes/verifyRoutes.js";

// Middleware
import { requestLogger } from "./middleware/logger.middleware.js";

// Env
const PORT = process.env.PORT || 5000;

// CONNECT DATABASE
connectDB();

// LOGGER MIDDLEWARE
app.use(requestLogger);

// VERIFY ROUTE
app.use("/api/verify", verifyRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});