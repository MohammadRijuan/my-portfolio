import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();
app.disable('x-powered-by');

app.use(corsMiddleware);
app.use(express.json({ limit: '300kb' }));
app.use(securityHeaders);

// Same routes with and without the /api prefix (Vercel keeps /api, local calls may not).
app.use('/api', routes);
app.use('/', routes);

app.use(errorHandler);

export default app;
