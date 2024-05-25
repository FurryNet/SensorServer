/* Classic package import */
import { extraErrorDataIntegration, prismaIntegration, init as SentryInit} from "@sentry/node";
import { commitHash } from "./utils";
import { Prisma } from "@prisma/client";

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
      prismaIntegration(),
      extraErrorDataIntegration({
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
      // Filter out prisma timeout error
      if(hint.originalException instanceof Prisma.PrismaClientKnownRequestError &&
         hint.originalException.code === "P2024"
      ) return null;
      // Only passing exceptions
      if (hint?.originalException || (event.exception?.values?.length ?? 0) > 0) return event;
      // Or if there's error message
      if (event.level === "error") return event;
      return null;
    }
  });
}

// Load the stuff after the Sentry is initialized
import './mqtt';
import './cron';