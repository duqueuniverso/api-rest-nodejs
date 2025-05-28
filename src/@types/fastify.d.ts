import type { TransactionRepository } from "../interfaces/transaction.repository";

declare module "fastify" {
    interface FastifyInstance {
        repository: TransactionRepository;
    }
}
