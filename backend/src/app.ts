import express from "express";
import mongoose from "mongoose";

import { MONGO_URI, PORT } from "./config";

const app = express();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`> Listening on port ${PORT}`);
    });
  })
  .catch(console.error);
