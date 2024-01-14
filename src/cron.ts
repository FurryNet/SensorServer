import { captureCheckIn, captureException } from '@sentry/node';
import { schedule } from 'node-cron';
import { PrismaCli } from './utils';
import { cron } from './config.json';
import { discordWebhook } from './webhook';
import {status} from './mqtt';

const webhook_url = process.env["DISCORD_WEBHOOK"];
if(webhook_url) {

  // Check if summary cron is enabled
  if(cron.averageReport.time && cron.averageReport.time.trim() != "") {
    const CRON_SLUG = cron.averageReport.SentrySlug;
    // Print out the status
    console.log("Captured summary will be sent to the webhook");
    if(CRON_SLUG)
      console.log(`Cron slug found for summary, status will be reported to ${CRON_SLUG}`);

    // Schedule the task
    schedule(cron.averageReport.time, async () => {
      console.log("Time hits, sending the summary!");
      const checkInId = CRON_SLUG ? captureCheckIn({
        monitorSlug: CRON_SLUG,
        status: "in_progress"
      }) : undefined;

      try {
      // We fetch the records from the last 24 hours
        const result = await PrismaCli.sensor_records.findMany({
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        });

        // This usually doesn't happen unless we run the server before the client is finished...
        if(result.length == 0) {
          console.log("Skipped cron summary due to lack of records");
          if(checkInId) captureCheckIn({
            checkInId,
            monitorSlug: CRON_SLUG!,
            status: "ok"
          });
          return;
        }

        // Create the average value
        const avg_temp = result.reduce((acc, cur) => acc + cur.temperature.toNumber(), 0) / result.length;
        const avg_hum = result.reduce((acc, cur) => acc + cur.humidity.toNumber(), 0) / result.length;

        // Send the statistics
        const res = await discordWebhook(webhook_url, {
          title: "📊 Daily Summary 📊",
          description: `Here's the daily summary of the temperature and humidity in the last 24 hours`,
          color: 0x00ffff,
          fields: [
            {
              name: "🌡️ Average Temperature",
              value: `${avg_temp.toFixed(2)}°C`
            },
            {
              name: "💧 Average Humidity",
              value: `${avg_hum.toFixed(2)}%`
            }
          ]
        });

        // Check the response
        if(!res.ok)
          throw new CronError("Discord Webhook", res.status, await res.text());

        // Confirm the checkin status
        if(checkInId) captureCheckIn({
          checkInId,
          monitorSlug: CRON_SLUG!,
          status: "ok"
        });
      } catch(ex) {

        // Log the error
        captureException(ex);
        if(checkInId) captureCheckIn({
          checkInId,
          monitorSlug: CRON_SLUG!,
          status: "error"
        });

      }
    });
  }
  
  // Now we check for the last received data
  if(cron.noDataCheck.time && cron.noDataCheck.time.trim() != "") {
    const CRON_SLUG = cron.noDataCheck.SentrySlug;
    // Print out the status
    console.log("Data status will be checked and webhook any changes");
    if(CRON_SLUG)
      console.log(`Cron slug found for data checker, status will be reported to ${CRON_SLUG}`);

    let alreadyNotified = false;


    schedule(cron.noDataCheck.time, async () => {
      const checkInId = CRON_SLUG ? captureCheckIn({
        monitorSlug: CRON_SLUG,
        status: "in_progress"
      }) : undefined;

      try {
        let res: Response | undefined;
        // Check if not received webhook needs to be sent (if the last received data is more than 15 seconds ago)
        if(!alreadyNotified && status.lastReceived.getTime() < Date.now() - cron.noDataCheck.checkInterval) {
          res = await discordWebhook(webhook_url, {
            title: "🔴 No Data Received 🔴",
            description: `No data has been received in the last 15 seconds`,
            color: 0xff0000,
            fields: [
              {
                name: "⏱️ Last Received",
                value: status.lastReceived.toISOString()
              }
            ]
          });
          alreadyNotified = true;
        } else if(alreadyNotified && status.lastReceived.getTime() > Date.now() - 15 * 1000) {
          res = await discordWebhook(webhook_url, {
            title: "🟢 Data Received 🟢",
            description: `Data has been received again`,
            color: 0x00ff00,
            fields: [
              {
                name: "⏱️ Last Received",
                value: status.lastReceived.toISOString()
              }
            ]
          });
          alreadyNotified = false;
        }

        // Check the response
        if(res && !res.ok)
          throw new CronError("Discord Webhook", res.status, await res.text());

        // Confirm the checkin status
        if(checkInId) captureCheckIn({
          checkInId,
          monitorSlug: CRON_SLUG!,
          status: "ok"
        });
      } catch(ex) {

        // Log the error
        captureException(ex);
        if(checkInId) captureCheckIn({
          checkInId,
          monitorSlug: CRON_SLUG!,
          status: "error",
        });

      }
    });
  }
}

class CronError extends Error {
  status: number;
  CronName: string;
  constructor(name: string, status: number, message: string) {
    super(message);
    this.name = "CronError";
    this.CronName = name;
    this.status = status;
  }
}