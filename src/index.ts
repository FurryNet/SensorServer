/* Classic package import */
import { init as SentryInit, Integrations as SentryIntegrate} from "@sentry/node";
import { commitHash, PrismaCli } from "./utils";
import './mqtt';
import './cron';



/* Setup Sentry monitoring */
const DSN = process.env["SENTRY_DSN"];
if(DSN) {
  console.log("Sentry DSN found, enabling monitoring");
  SentryInit({
    dsn: DSN,
    tracesSampleRate: 0.5,
    integrations: [
      new SentryIntegrate.Prisma({ client: PrismaCli })
    ],
    release: commitHash,
    ignoreErrors: [
      "TimeoutError",
      "AbortError",
      "NetworkError",
      "EADDRINUSE"
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