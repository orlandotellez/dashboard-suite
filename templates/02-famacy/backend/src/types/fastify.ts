import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from './auth.js';

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export type FastifyRouteHandler = (
  request: FastifyRequest | AuthenticatedRequest,
  reply: FastifyReply
) => Promise<any>;

export interface QueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}