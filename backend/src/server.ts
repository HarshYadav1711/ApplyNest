import mongoose from "mongoose";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

async function main(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`ApplyNest API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
