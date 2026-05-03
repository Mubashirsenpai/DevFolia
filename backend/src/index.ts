import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { analyticsRouter } from "./routes/analytics.js";
import { publicRouter } from "./routes/public.js";
import { accountRouter } from "./routes/account.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "DevFolia backend is running" });
});
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/portfolio", portfolioRouter);
app.use("/analytics", analyticsRouter);
app.use("/public", publicRouter);
app.use("/account", accountRouter);

/** Render/load balancers need a public bind on PORT (not localhost-only). */
app.listen(config.port, "0.0.0.0", () => {
  console.log(`DevFolia backend listening on 0.0.0.0:${config.port}`);
});
