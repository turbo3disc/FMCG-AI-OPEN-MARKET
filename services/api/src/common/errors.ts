import type { FastifyInstance } from 'fastify';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'ERR',
  ) {
    super(message);
  }
  static badRequest(msg: string, code = 'BAD_REQUEST'): ApiError {
    return new ApiError(400, msg, code);
  }
  static unauthorized(msg = 'unauthorized', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = 'forbidden', code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = 'not found', code = 'NOT_FOUND'): ApiError {
    return new ApiError(404, msg, code);
  }
  static conflict(msg: string, code = 'CONFLICT'): ApiError {
    return new ApiError(409, msg, code);
  }
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ApiError) {
      return reply.code(err.statusCode).send({ error: err.message, code: err.code });
    }
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = status === 500 ? 'internal error' : (err as Error).message;
    return reply.code(status).send({ error: message, code: status === 500 ? 'INTERNAL' : 'ERR' });
  });
}
