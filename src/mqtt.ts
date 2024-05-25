import { captureException, startInactiveSpan } from '@sentry/node';
import "@sentry/tracing";
import { ErrorWithReasonCode, connect } from 'mqtt';
import { MQTTData } from './protobuf';
import { util } from 'protobufjs';
import { PrismaCli, dataValidation } from './utils';
import { Prisma } from '@prisma/client';

export const status = {
  lastReceived: new Date(),
};

const client = connect(process.env["MQTT_URL"] ?? "mqtt://test.mosquitto.org");

client.on("connect", () => {
  console.log("MQTT Connection Established");
  client.subscribe("SensorRecord", {
    qos: 1,
  }, (err) => {
    if(!err) return console.log("Succesfully subscribed to the record topic");
    console.log("Failed to subscribe to the record topic");
    captureException(err);
  });
});

client.on("error", (err) => {
  console.log("MQTT Connection Error: "+err);
  if(!(err instanceof ErrorWithReasonCode))
    captureException(err);
});

client.on("message", async (topic, message) => {
  if(topic !== "SensorRecord") return console.log("Received message from unknown topic: "+topic);
  const SentryTX = startInactiveSpan({
    op: "SR_MSG_MQTT",
    name:"SensorRecord_Message",
    forceTransaction: true
  });

  try {
    const data = MQTTData.decode(message);

    // General validation to reject faulty data
    const ValidRes = dataValidation(data);
    if(ValidRes)
      return console.warn(`Received invalid data from ${data.identifier}: ${ValidRes}`);

    await PrismaCli.sensor_records.create({
      data: {
        temperature: data.temperature,
        humidity: data.humidity,
        created_at: new Date(Number(data.timestamp)),
        device_name: data.identifier
      }
    });

    status.lastReceived = new Date();
    console.log(`Processed data from ${data.identifier}`);
  } catch(ex) {
    if (ex instanceof util.ProtocolError) {
      console.log("MQTT Received incomplete Protobuf Data: "+ex);
      captureException(ex);
      return;
    }

    if(ex instanceof Prisma.PrismaClientKnownRequestError &&
      ex.code === "P2002" &&
      (ex.meta?.target as string[] | undefined)?.includes("created_at"))
      return console.log("Duplicate Record Received");

    console.log("An Error Occured while processing the data: "+ex);
    captureException(ex);
  } finally {
    SentryTX?.end();
  }
});