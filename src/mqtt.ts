import { captureException, captureMessage } from '@sentry/node';
import { connect } from 'mqtt';
import { MQTTData } from './protobuf';
import { util } from 'protobufjs';
import { PrismaCli } from './utils';

const client = connect(process.env.MQTT_URL ?? "mqtt://test.mosquitto.org");

client.on("connect", () => {
  console.log("MQTT Connection Established");
  client.subscribe("SensorRecord", {
    qos: 2
  }, (err) => {
    if(!err) return console.log("Succesfully subscribed to the record topic");
    console.log("Failed to subscribe to the record topic");
    captureException(err);
  });
});

client.on("error", (err) => {
  console.log("MQTT Connection Error: "+err);
  captureException(err);
});

client.on("message", async (topic, message) => {
  if(topic !== "SensorRecord") return console.log("Received message from unknown topic: "+topic);
  try {
    const data = MQTTData.decode(message);
    await PrismaCli.sensor_records.create({
      data: {
        temperature: data.temperature,
        humidity: data.humidity,
        created_at: new Date(data.timestamp),
        device_name: data.identifier
      }
    });
  } catch(ex) {
    if (ex instanceof util.ProtocolError) {
      console.log("MQTT Received incomplete Protobuf Data: "+ex);
      return captureMessage("MQTT Received incomplete Protobuf Data: "+ex.message, "fatal");
    }
    console.log("An Error Occured while processing the data: "+ex);
    captureException(ex);
  }
});