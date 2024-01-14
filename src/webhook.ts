import {cron} from './config.json';

type embedData = {
    title: string;
    description: string;
    color: number | string;
    fields: {
        name: string;
        value: string;
    }[];
}
export const discordWebhook = async (url: string, embed: embedData) => {
  return await fetch(url, {
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
        embed,
      ],
      footer: {
        text: "SensorServer by @zhiyan114"
      },
      timestamp: new Date().toISOString()
    })
  });
};