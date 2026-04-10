import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
