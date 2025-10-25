const TelegramBot = require("node-telegram-bot-api");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");

const bot = new TelegramBot("7735859166:AAGLTcOXbd4fW26NE0X2xnL8XA36BD94I4o", { polling: true });

registerFont("./orbitron-bold.otf", { family: "Orbitron" });
registerFont("./BBHSansHegarty-Regular.ttf", { family: "BBHSans" });

const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "📜 Sertifikat tayyorlash" }],
      [{ text: "🎖 Bejik tayyorlash" }],
    ],
    resize_keyboard: true,
  },
};

const userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Assalomu alaykum! 👋\nQuyidagi menyudan keraklisini tanlang:",
    mainMenu
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "📜 Sertifikat tayyorlash") {
    userState[chatId] = { step: "ask_name_cert" };
    return bot.sendMessage(chatId, "🎓 Iltimos, ism familiyangizni kiriting:");
  }

  if (userState[chatId]?.step === "ask_name_cert") {
    if (text === "🎖 Bejik tayyorlash" || text === "📜 Sertifikat tayyorlash") {
      delete userState[chatId];
      if (text === "🎖 Bejik tayyorlash") {
        userState[chatId] = { step: "ask_job_bejik" };
        return bot.sendMessage(chatId, "💼 Iltimos, lavozimingizni yozma ko'rinishda kiriting:\n(masalan: O'quvchi, Ustoz, Xodim, va hokazo)");
      } else {
        userState[chatId] = { step: "ask_name_cert" };
        return bot.sendMessage(chatId, "🎓 Iltimos, ism familiyangizni kiriting:");
      }
    }
    
    const name = text.trim();
    bot.sendMessage(chatId, "⏳ Sertifikat tayyorlanmoqda, kuting...");

    const inputPath = "./certificate.png";
    const outputPath = `./certificate_${chatId}.png`;

    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, image.width, image.height);

    ctx.font = "bold 48px 'BBHSans'";
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";

    const x = image.width / 2;
    const y = image.height / 2.2;
    ctx.fillText(name.toUpperCase(), x, y);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    await bot.sendDocument(chatId, outputPath, {
      caption: "🎉 Mana sizning sertifikatingiz!",
    });

    fs.unlinkSync(outputPath);
    delete userState[chatId];
    
    return bot.sendMessage(chatId, "🏠 Asosiy menyu:", mainMenu);
  }

  if (text === "🎖 Bejik tayyorlash") {
    userState[chatId] = { step: "choose_type" };
    return bot.sendMessage(chatId, "🎯 Bejik turini tanlang:", {
      reply_markup: {
        keyboard: [
          [{ text: "🧑‍🎓 O'quvchi" }, { text: "👨‍🏫 Ustoz" }],
          [{ text: "💼 Xodim" }, { text: "✨ Boshqa" }],
          [{ text: "⬅️ Orqaga" }],
        ],
        resize_keyboard: true,
      },
    });
  }

  if (userState[chatId]?.step === "choose_type") {
    if (text === "⬅️ Orqaga") {
      delete userState[chatId];
      return bot.sendMessage(chatId, "🏠 Asosiy menyu:", mainMenu);
    }

    if (text === "✨ Boshqa") {
      userState[chatId] = { step: "ask_custom_job" };
      return bot.sendMessage(chatId, "💼 Iltimos, lavozimingizni yozma ko'rinishda kiriting:");
    }

    if (["🧑‍🎓 O'quvchi", "👨‍🏫 Ustoz", "💼 Xodim"].includes(text)) {
      userState[chatId] = { step: "ask_name_bejik", job: text };
      return bot.sendMessage(chatId, "✍️ Ismingizni kiriting:");
    }
  }

  if (userState[chatId]?.step === "ask_custom_job") {
    const customJob = text.trim();
    userState[chatId] = { step: "ask_name_bejik", job: customJob };
    return bot.sendMessage(chatId, "✍️ Endi ismingizni kiriting:");
  }

  if (userState[chatId]?.step === "ask_name_bejik") {
    if (text === "📜 Sertifikat tayyorlash" || text === "🎖 Bejik tayyorlash") {
      delete userState[chatId];
      if (text === "📜 Sertifikat tayyorlash") {
        userState[chatId] = { step: "ask_name_cert" };
        return bot.sendMessage(chatId, "🎓 Iltimos, ism familiyangizni kiriting:");
      } else {
        userState[chatId] = { step: "ask_job_bejik" };
        return bot.sendMessage(chatId, "💼 Iltimos, lavozimingizni yozma ko'rinishda kiriting:\n(masalan: O'quvchi, Ustoz, Xodim, va hokazo)");
      }
    }
    
    const name = text.trim();
    const job = userState[chatId].job;

    bot.sendMessage(chatId, "⏳ Bejik tayyorlanmoqda, kuting...");

    const inputPath = "./bejik.png";
    const outputPath = `./bejik_${chatId}.png`;

    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, image.width, image.height);

    ctx.fillStyle = "#C6FF00"; 
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    let fontSize = 240;
    if (name.length > 7) fontSize = 240;
    if (name.length > 8) fontSize = 200;
    if (name.length > 10) fontSize = 180;
    if (name.length > 11) fontSize = 150;
    
    ctx.font = `${fontSize}px 'Orbitron'`;

    const nameX = image.width / 2;
    const nameY = image.height / 2.1;
    ctx.fillText(name.toUpperCase(), nameX, nameY);

    ctx.font = "120px 'Orbitron'";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const jobText = job.replace(/[^\w\s'''`]/gi, "").trim().toUpperCase();
    const jobX = image.width - 150;
    const jobY = nameY + 150; 
    
    const gradientHeight = 200; 
    const gradient = ctx.createLinearGradient(jobX, jobY - gradientHeight, jobX, jobY);
    gradient.addColorStop(0, "#9854ff"); 
    gradient.addColorStop(0.7, "#9854ff"); 
    gradient.addColorStop(1, "#ffffff"); 
    
    ctx.fillStyle = gradient;
    ctx.fillText(jobText, jobX, jobY);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    await bot.sendDocument(chatId, outputPath, {
      caption: "✅ Mana sizning bejigingiz tayyor!",
    });

    fs.unlinkSync(outputPath);
    delete userState[chatId];
    
    return bot.sendMessage(chatId, "🏠 Asosiy menyu:", mainMenu);
  }
});
