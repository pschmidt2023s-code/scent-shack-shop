import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import ConnectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { pool } from "./db";
import { setupVite, serveStatic } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const isReplit = !!process.env.REPL_SLUG;
const isProduction = process.env.NODE_ENV === "production";

app.set('trust proxy', 1);

// CSP is stricter in production, relaxed in development for Vite HMR
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: isProduction 
    ? ["'self'", "https://js.stripe.com", "https://www.paypal.com"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://www.paypal.com"],
  styleSrc: isProduction
    ? ["'self'", "https://fonts.googleapis.com"]
    : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://*.replit.dev", "https://*.repl.co", "https://*.replit.app", "wss:", "https://api.stripe.com"],
  frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: isProduction ? [] : null,
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: cspDirectives,
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  noSniff: true,
  xssFilter: true,
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es in 15 Minuten erneut." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isProduction ? 100 : 500,
  message: { error: "API-Limit erreicht. Bitte versuchen Sie es später erneut." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/", apiLimiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5000", "http://127.0.0.1:5000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    if (origin.endsWith(".replit.dev") || origin.endsWith(".repl.co") || origin.endsWith(".replit.app")) {
      callback(null, true);
      return;
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400,
}));

// Stripe webhook route MUST be registered BEFORE express.json()
// Webhooks need raw Buffer, not parsed JSON
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const host = req.get('Host');
  
  if (!origin && !referer) {
    return next();
  }
  
  const allowedHosts = [
    'localhost:5000',
    '127.0.0.1:5000',
    host,
  ].filter(Boolean);
  
  const isValidOrigin = (url: string | undefined) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return allowedHosts.some(h => parsed.host === h) || 
             parsed.host.endsWith('.replit.dev') || 
             parsed.host.endsWith('.repl.co') ||
             parsed.host.endsWith('.replit.app');
    } catch {
      return false;
    }
  };
  
  if (origin && !isValidOrigin(origin)) {
    console.warn(`CSRF blocked: Invalid origin ${origin}`);
    return res.status(403).json({ error: 'Ungültige Anfragequelle' });
  }
  
  if (!origin && referer && !isValidOrigin(referer)) {
    console.warn(`CSRF blocked: Invalid referer ${referer}`);
    return res.status(403).json({ error: 'Ungültige Anfragequelle' });
  }
  
  next();
};

app.use('/api/', csrfProtection);

const PgSession = ConnectPgSimple(session);

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && isProduction) {
  throw new Error("SESSION_SECRET must be set in production");
}

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15,
  }),
  secret: sessionSecret || "dev-secret-change-in-production-" + Math.random().toString(36),
  name: "aldenair.sid",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: isReplit || isProduction,
  cookie: {
    secure: isReplit || isProduction,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isReplit ? "none" : "strict",
    path: "/",
  },
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('DATABASE_URL not found - Stripe schema migration skipped');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    const replitDomains = process.env.REPLIT_DOMAINS;
    if (replitDomains) {
      console.log('Setting up managed webhook...');
      const webhookBaseUrl = `https://${replitDomains.split(',')[0]}`;
      try {
        const result = await stripeSync.findOrCreateManagedWebhook(
          `${webhookBaseUrl}/api/stripe/webhook`
        );
        if (result?.webhook?.url) {
          console.log(`Webhook configured: ${result.webhook.url}`);
        } else {
          console.log('Webhook setup completed (no URL returned)');
        }
      } catch (webhookError) {
        console.warn('Webhook setup skipped:', webhookError);
      }
    } else {
      console.log('REPLIT_DOMAINS not set - skipping webhook setup');
    }

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => console.log('Stripe data synced'))
      .catch((err: any) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

(async () => {
  await initStripe();
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const server = createServer(app);

  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
})();
