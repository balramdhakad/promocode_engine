import app from "./app.js";
import env from "./config/env.js";
import { dbConnectionLog, closeDb } from "./infrastructure/db/index.js";
import { redis } from "./infrastructure/redis.js";

const PORT = env.serverConfig.PORT;

const startServer = async () => {
  try {
    await dbConnectionLog();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on PORT : ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received.Shutting down gracefully`);

      server.close(async (err) => {
        if (err) {
          console.error("Error closing HTTP server:", err);
          process.exit(1);
        }

        try {
          await closeDb();
          console.log("Database pool closed.");

          await redis.quit();
          console.log("Redis connection closed.");

          console.log("Graceful shutdown complete.");
          process.exit(0);
        } catch (shutdownErr) {
          console.error("Error during shutdown:", shutdownErr);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("Shutdown timed out. Forcing exit.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (error) {
    console.error(`Error while starting the server : ${error}`);
    process.exit(1);
  }
};

startServer();
