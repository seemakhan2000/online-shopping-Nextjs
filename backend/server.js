
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./connectdb/connectDB");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://online-shopping-nextjs-t4mj.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowedVercelPreview =
        origin &&
        /^https:\/\/online-shopping-nextjs-[a-z0-9-]+-seemakhan2000s-projects\.vercel\.app$/.test(
          origin
        );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isAllowedVercelPreview
      ) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB before processing API requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Shopping API is running.",
  });
});

// Routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoute");
const adminRoute = require("./routes/adminRoute");
const userRoutes = require("./routes/userRoute");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const categoryRoutes = require("./routes/categoryRoute");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/admin", adminRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);

// Global error handler.
app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR:", err);
  console.error("EXPRESS ERROR MESSAGE:", err?.message);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    err.status ||
    (err.message === "Not allowed by CORS" ? 403 : 500);

  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// 404 handler.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
