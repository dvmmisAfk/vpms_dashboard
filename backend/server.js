// server.js
require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const visitorRoutes = require("./routes/visitors");
const appointmentRoutes = require("./routes/appointments");
const passRoutes = require("./routes/passes");
const checkRoutes = require("./routes/checks");
const dashboardRoutes = require("./routes/dashboard");
const analyticsRoutes = require("./routes/analytics");
const auditRoutes = require("./routes/audit");
const bootstrapRoutes = require("./routes/bootstrap");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((o) => o.trim());

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

app.set("io", io);

connectDB();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ success: true });
});

app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/checks", checkRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

server.listen(port, () => {
  console.log(`API listening on ${port}`);
});
