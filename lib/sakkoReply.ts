import { formatDistance, parseISO } from "date-fns";
import { fi } from "date-fns/locale";

import { Context } from "telegraf";
import { Update, Message } from "telegraf/typings/core/types/typegram";
import { db } from "..";

const _ = require("lodash");

export const sakkoReply = async (
  ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }> &
    Omit<Context, keyof Context<Update>>
) => {
  await db.read();
  const entries = (db.data ||= { log: [], sakko: [] }).sakko;

  const groupedEntries = _.chain(entries)
    .groupBy("userId")
    .mapValues((entry) => {
      return {
        amount: entry.length,
        first_name: entry[entry.length - 1].firstName,
        last: entry[entry.length - 1].timestamp,
      };
    })
    .values()
    .sortBy("amount")
    .reverse()
    .value();

  const retString: string[] = groupedEntries.map((entry) => {
    const agoString = formatDistance(
      parseISO(entry.last.toString()),
      new Date(),
      {
        addSuffix: true,
        locale: fi,
      }
    );

    return `<b>${entry.first_name} - ${String(entry.amount)} sakkoa</b>\n`;
  });

  return `
  Aina saa hävetä
  
${retString.join("")}
  
  `;
};
