import app from './app';

// Local development only. On Vercel the app is started by api/index.ts.
const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API running on http://localhost:' + port));
