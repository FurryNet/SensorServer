/* Classic package import */
import { extraErrorDataIntegration, prismaIntegration, init as SentryInit} from "@sentry/node";
import { commitHash } from "./utils";
import { Prisma } from "@prisma/client";
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';

// Exit if node version isnt 18.XX+
const nodeVersion = Number(process.version.split(".")[0].slice(1));
if(nodeVersion < 18) {
  console.log("Minimum Node v18.XX is required");
  process.exit(1);
}

/* Setup openTelemetry tracing */
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'example application',
  }),
});
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()));

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [new PrismaInstrumentation()],
});
provider.register();

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