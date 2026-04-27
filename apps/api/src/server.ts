import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function main() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`SupportDesk API listening on http://localhost:${env.API_PORT}`);
    app.log.info(`Swagger docs available at http://localhost:${env.API_PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
