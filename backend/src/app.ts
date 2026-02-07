import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { onRequest } from "firebase-functions/v2/https";
import mongoose from "mongoose";

import { AUTH_BYPASS, FRONTEND_ORIGIN, MONGO_URI, PORT } from "./config";
import errorHandler from "./middleware/errorHandler";
import log from "./middleware/logger";
import attendanceRoutes from "./routes/attendance";
import programRoutes from "./routes/program";
import sectionsRouter from "./routes/sections";
import sessionRoutes from "./routes/session";
import studentsRoutes from "./routes/students";
import userRoutes from "./routes/user";
import { verifyAuthToken } from "./validators/auth";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  }),
);

app.use(express.json());

app.use(log);

app.use("/api/sections", verifyAuthToken, sectionsRouter);
app.use("/api/program", verifyAuthToken, programRoutes);
app.use("/api/students", verifyAuthToken, studentsRoutes);
app.use("/api/sessions", verifyAuthToken, sessionRoutes);
app.use("/api/attendance", verifyAuthToken, attendanceRoutes);
app.use("/api/user", verifyAuthToken, userRoutes);

app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`> Listening on port ${PORT}`);
      if (AUTH_BYPASS) console.info("Authorization Bypass is enabled");
    });
  })
  .catch(console.error);

export const backend = onRequest({ region: "us-west1" }, app);
