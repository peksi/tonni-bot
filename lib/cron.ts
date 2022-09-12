import { bot } from "..";
import getWeatherForTomorrow from "./getWeatherForTomorrow";

const CronJob = require("cron").CronJob;

const questionArray = [
  "Huomenna uimaan?",
  "HUOMENTA HUOMENNA",
  "Käydäänkö huomenna uimassa?",
  "Uimataanko huomenna?",
  "Kerro meille",
  "K/E",
  "Kuuluuko huomenna uimaharjoitus?",
  "U/M",
  "Hotelli? Trivago!",
  "🏊‍♂️",
  "🏊‍♀️",
  "🏊‍♂️🏊‍♀️",
  "🏊‍♂️🏊‍♀️🏊‍♂️🏊‍♀️",
];

const yesArray = [
  "Joo",
  "Yes",
  "Jep",
  "Oui",
  "Si",
  "Da",
  "Jah",
  "Kyl maar",
  "Kyllä",
  "так да",
  "Siis",
  "Küll",
  "🥇",
  "🏅",
  "🏆",
  "🎖️",
  "🎗️",
];

const noArray = [
  "Ei",
  "No",
  "Nein",
  "Non",
  "Njet",
  "Nej",
  "Olen vasinud",
  "äh",
  "🪦",
  "◼️",
  "bää bää",
];

// send message to channel every monday and wednesday at noon

const sendScheduledMessages = async () => {
  try {
    // send message to channel
    bot.telegram.sendMessage(
      parseInt(process.env.CHAT_ID ?? ""),
      await getWeatherForTomorrow(),
      {
        parse_mode: "HTML",
      }
    );
    // send poll to channel

    setTimeout(() => {
      bot.telegram.sendPoll(
        parseInt(process.env.CHAT_ID ?? ""),
        questionArray[Math.floor(Math.random() * questionArray.length)],
        [
          yesArray[Math.floor(Math.random() * yesArray.length)],
          noArray[Math.floor(Math.random() * noArray.length)],
        ],
        {
          is_anonymous: false,
          allows_multiple_answers: false,
        }
      );
    }, 1000);
  } catch (error) {
    console.log(error);
  }
};

const job = new CronJob(
  "0 0 12 * * 1,3", // every monday and wednesday at noon
  async () => {
    sendScheduledMessages();
  }
);

const cron = () => {
  job.start();
  sendScheduledMessages();
};

export default cron;
