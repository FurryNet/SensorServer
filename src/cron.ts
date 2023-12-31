import { captureCheckIn, captureException } from '@sentry/node';
import { schedule } from 'node-cron';
import { PrismaCli } from './utils';
import { cron } from './config.json';

const webhook_url = process.env["DISCORD_WEBHOOK"];
const CRON_SLUG = cron.SentrySlug;
if(webhook_url) {
  // Print out the status
  console.log("Daily captured summary will be sent to the webhook");
  if(CRON_SLUG)
    console.log(`Cron slug found, status will be reported to ${CRON_SLUG}`);

  // Schedule the task for daily
  schedule(cron.time, async () => {
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
      const res = await fetch(webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: cron.userPing.map(id => `<@${id}>`).join(" "),
          allowed_mentions: {
            parse: ["users"]
          },
          embeds: [
            {
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
              ],
              footer: {
                text: "SensorServer by @zhiyan114"
              },
              timestamp: new Date().toISOString()
            }
          ]
        })
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