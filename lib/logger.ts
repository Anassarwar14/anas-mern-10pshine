import pino from "pino";

const logger = pino({
  transport: { target: "pino-pretty" },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export default logger;