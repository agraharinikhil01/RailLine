// Vercel Serverless Function Catch-All for RailGaadi API
process.env.IS_SERVERLESS = 'true';
const { buildApp } = require('../apps/api/dist/index.js');

let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      process.env.IS_SERVERLESS = 'true';
      const app = await buildApp();
      await app.ready();
      return app;
    })();
  }
  return appPromise;
}

module.exports = async function handler(req, res) {
  try {
    const app = await getApp();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url}`;
    }
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('[Vercel Serverless Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: {
          code: 'SERVERLESS_FUNCTION_ERROR',
          message: err.message || 'Internal Serverless Error',
        },
      })
    );
  }
};
