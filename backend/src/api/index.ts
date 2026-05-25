import mongoose from "mongoose";

import { app } from "../app";
import * as env from "../config";

void mongoose.connect(env.MONGO_URI).then(() => {
  app.listen(env.PORT, () => {
    console.info(`server listening on port ${env.PORT}`);
  });
});

export default app;
