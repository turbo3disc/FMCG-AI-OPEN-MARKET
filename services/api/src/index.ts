// @fmcg/api — modular monolith entry (ADR-0004). Health first, modules mount here.
import Fastify from 'fastify';

const app = Fastify({ logger: true });
app.get('/health', async () => ({ ok: true, service: 'fmcg-api', version: '0.1.0' }));

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: '0.0.0.0' });
