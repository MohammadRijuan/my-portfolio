import cors from 'cors';

/** Websites allowed to call this API from a browser. Add a new domain here. */
const allowedOrigins = ['http://localhost:3000', 'https://rijuan-monju.vercel.app'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header (Postman, server-to-server, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
});
