import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import winston from 'winston';
import { env } from './configs/env.config';

const transports: winston.transport[] = [new winston.transports.Console({})];

if (env.AXIOM_DATASET && env.AXIOM_TOKEN) {
  transports.push(
    new AxiomTransport({
      dataset: env.AXIOM_DATASET,
      token: env.AXIOM_TOKEN,
    }),
  );
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});
