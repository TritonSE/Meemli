import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import programRoutes from "../src/routes/program";
import programsRoutes from "../src/routes/programs";

import { FRONTEND_ORIGIN, MONGO_URI, PORT } from "./config";
import errorHandler from "./middleware/errorHandler";
import log from "./middleware/logger";

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  }),
);

app.use("/programs", programsRoutes);
app.use("/program", programRoutes);

app.use(express.json());

app.use(log);

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
