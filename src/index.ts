/* Classic package import */
import { init as SentryInit, Integrations as SentryIntegrate} from "@sentry/node";
import { ExtraErrorData } from "@sentry/integrations";
import { commitHash, PrismaCli } from "./utils";
import './mqtt';
import './cron';



/* Setup Sentry monitoring */
const DSN = process.env["SENTRY_DSN"];
if(DSN) {
  console.log("Sentry DSN found, enabling monitoring");
  SentryInit({
    dsn: DSN,
    tracesSampleRate: 0.1,
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