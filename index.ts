import { Telegraf, Context } from "telegraf";
import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { formatDistance, parseISO } from "date-fns";
import { fi } from "date-fns/locale";
import { Update, Message } from "typegram";
import cron from "./lib/cron";
import { sakkoReply } from "./lib/sakkoReply";
import _ from "lodash";

const validChatId = (chatId: any) => {
  //    return true

  return chatId === parseInt(process.env.CHAT_ID ?? "");
};

interface Entry {
  userId: number;
  timestamp: Date;
  firstName: string;
}

type Data = {
  log: {
    userId: number;
    timestamp: Date;
    firstName: string;
  }[];
  sakko: {
    userId: number;
    timestamp: Date;
    firstName: string;
  }[];
};

require("dotenv").config();

// Use JSON file for storage

// if docker, use /data/db.json otherwise ./db.json

const file = process.env.DOCKER
  ? "/usr/src/app/db/db.json"
  : join(__dirname, "./db.json");

console.log(process.env.DOCKER ? "yes docker" : "no docker");
console.log(process.env);
console.log(__dirname, file);

const adapter = new JSONFile<Data>(file);
export const db = new Low(adapter);

(async function () {
  await db.read();
  db.data ||= { log: [], sakko: [] };
})();

// Define your own context type
interface MyContext extends Context {
  myProp?: string;
  myOtherProp?: number;
}

export const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN ?? "");

const cheersReply = async (
  ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }> &
    Omit<MyContext, keyof Context<Update>>
) => {
  await db.read();
  const entries = db.data?.log;

  const tonnis = entries?.filter((i) => i.userId === ctx.from.id).length;
  return `
    
    Se oli tonnin repäsy.
    
Hyvä homma ${ctx.message.from.first_name}! Taas voi pötcöttää pari viikkoa. Sinulla on nyt ${tonnis} tonnia kasassa
                `;
};

const statsReply = async (
  ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }> &
    Omit<MyContext, keyof Context<Update>>
) => {
  await db.read();
  const entries = (db.data ||= { log: [], sakko: [] }).log;

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
    const agoString = formatDistance(parseISO(entry.last as any), new Date(), {
      addSuffix: true,
      locale: fi,
    });

    return `<b>${entry.first_name} - ${String(
      entry.amount
    )} tonnia</b>\nedellinen ${agoString}\n\n`;
  });

  return `
Nonii, katellaas vähä paljo peli

${retString.join("")}

`;
};

bot.start((ctx) => ctx.reply("Se on raaka peli"));
bot.help((ctx) => ctx.reply("Apua ei tule"));
bot.on("text", async (ctx) => {
  if (!!ctx.message.text) {
    if (!validChatId((await ctx.getChat()).id)) {
      ctx.reply("Kirjaa kaikki jutut chätin kautta");
    } else if (ctx.message.text.includes("/tonni")) {
      db.data?.log.push({
        userId: ctx.message.from.id,
        timestamp: new Date(),
        firstName: ctx.message.from.first_name,
      });
      await db.write();
      ctx.reply(await cheersReply(ctx));
    } else if (ctx.message.text.includes("/stats")) {
      ctx.replyWithHTML(await statsReply(ctx));
    } else if (ctx.message.text.includes("/sakkotilanne")) {
      // add one sakko to user
      ctx.replyWithHTML(await sakkoReply(ctx));
    } else if (ctx.message.text.includes("/sakko")) {
      // add one sakko to user
      db.data?.sakko.push({
        userId: ctx.message.from.id,
        timestamp: new Date(),
        firstName: ctx.message.from.first_name,
      });
      await db.write();
      ctx.reply("Sakko lisätty");
    }
  }
});

bot.launch();

console.log("Ready");
cron();
