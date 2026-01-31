import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import { FRONTEND_ORIGIN, MONGO_URI, PORT } from "./config";
import errorHandler from "./middleware/errorHandler";
import log from "./middleware/logger";
import programRoutes from "./routes/program";
import sessionRoutes from "./routes/session";
import studentsRoutes from "./routes/students";
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

app.use("/api/program", verifyAuthToken, programRoutes);
app.use("/students", verifyAuthToken, studentsRoutes);
app.use("/api/sessions", verifyAuthToken, sessionRoutes);

app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`> Listening on port ${PORT}`);
    });
  })
  .catch(console.error);
