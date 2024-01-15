/* Classic package import */
import { init as SentryInit, Integrations as SentryIntegrate} from "@sentry/node";
import { ExtraErrorData } from "@sentry/integrations";
import { commitHash, PrismaCli } from "./utils";
import './mqtt';
import './cron';

// Exit if node version isnt 18.XX+
const nodeVersion = Number(process.version.split(".")[0].slice(1));
if(nodeVersion < 18) {
  console.log("Minimum Node v18.XX is required");
  process.exit(1);
}

/* Setup Sentry monitoring */
const DSN = process.env["SENTRY_DSN"];
if(DSN) {
  console.log("Sentry DSN found, enabling monitoring");
  SentryInit({
    dsn: DSN,
    tracesSampleRate: 0.01,
    integrations: [
      new SentryIntegrate.Prisma({ client: PrismaCli }),
      new ExtraErrorData({
        depth: 5
      }),
    ],
    release: commitHash,
    environment: process.env["DOPPLER_ENVIRONMENT"] ?? "development",
    ignoreErrors: [
      "TimeoutError",
      "AbortError",
      "NetworkError",
      "EADDRINUSE",
      "ECONNREFUSED",
      "ECONNRESET",
    ],
    beforeSend: (event, hint) => {
      // Only passing exceptions
      if (hint?.originalException) return event;
      // Or if there's error message
      if (event.level == "error") return event;
      return null;
    }
  });
}