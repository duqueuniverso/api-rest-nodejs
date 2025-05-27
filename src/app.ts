import fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { transactionsRoutes } from "./routes/transactions.routes";
import { KnexTransactionRepository } from "./infrastructure/knex-transaction.repository";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { knex } from "./database";
import { healthCheckRoutes } from "./routes/health_check.routes";
import { ZodError } from "zod";
import { AppError } from "./errors/app-error";

export const app = fastify();

app.register(cookie, {
  secret: "your-secret", // se for usar cookies assinados
});

app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  frameguard: { action: "deny" },
});

// app.register(fastifySwagger, {
//   openapi: {
//     info: {
//       title: "Transactions API",
//       description: "API para gerenciamento de transações financeiras",
//       version: "1.0.0",
//     },
//     components: {
//       securitySchemes: {
//         sessionCookie: {
//           type: "apiKey",
//           name: "sessionId",
//           in: "cookie",
//         },
//       },
//     },
//   },
// });

// app.register(fastifySwaggerUi, {
//   routePrefix: "/docs",
//   uiConfig: {
//     docExpansion: "full",
//     deepLinking: false,
//   },
// });

app.register(rateLimit, {
  global: true,
  max: process.env.NODE_ENV === "test" ? 1000 : 10,
  timeWindow: "1 minute",
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
});

app.decorate("repository", new KnexTransactionRepository(knex));

// app.register(transactionsRoutes, {
//   prefix: "transactions",
//   schema: {
//     description: "Lista todas as transações do usuário",
//     tags: ["transactions"],
//     security: [{ sessionCookie: [] }],
//     response: {
//       200: {
//         type: "array",
//         items: {
//           type: "object",
//           properties: {
//             id: { type: "string", format: "uuid" },
//             title: { type: "string" },
//             amount: { type: "number" },
//             type: { type: "string", enum: ["credit", "debit"] },
//           },
//         },
//       },
//     },
//   },
// });

app.register(transactionsRoutes, {
  prefix: "transactions",
});

app.register(healthCheckRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      type: "validation_error",
      issues: error.errors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      type: "application_error",
      message: error.message,
    });
  }

  // Log para o Datadog/Sentry
  // logger.error('Unhandled error', error)

  return reply.status(500).send({
    type: "internal_error",
    message: "Internal server error",
    content: error.message,
  });
});
