import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
});

export default logger;
