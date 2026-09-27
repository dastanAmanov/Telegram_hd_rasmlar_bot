require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!BOT_TOKEN || !PEXELS_API_KEY) {
  console.error('❌ BOT_TOKEN yoki PEXELS_API_KEY .env faylida topilmadi!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const PEXELS_BASE = 'https://api.pexels.com/v1';
const RESULTS_PER_QUERY = 5;
const COOLDOWN_MS = 3000; // throttling: bir foydalanuvchi necha soniyada bitta so'rov yubora oladi

const lastRequest = new Map(); // userId -> oxirgi so'rov vaqti

function isThrottled(userId) {
  const now = Date.now();
  const last = lastRequest.get(userId) || 0;
  if (now - last < COOLDOWN_MS) return true;
  lastRequest.set(userId, now);
  return false;
}

async function searchPexels(query) {
  const res = await axios.get(`${PEXELS_BASE}/search`, {
    headers: { Authorization: PEXELS_API_KEY },
    params: { query, per_page: RESULTS_PER_QUERY },
    timeout: 10000,
  });
  return res.data.photos || [];
}

async function getPhotoById(id) {
  const res = await axios.get(`${PEXELS_BASE}/photos/${id}`, {
    headers: { Authorization: PEXELS_API_KEY },
    timeout: 10000,
  });
  return res.data;
}

bot.start((ctx) => {
  ctx.reply(
    "👋 Salom! Men rasm botiman.\n\n" +
      "Menga istalgan mavzuda so'z yozing (masalan: tog', dengiz, mashina, kofe) — men internetdan shu mavzudagi sifatli rasmlarni topib beraman.\n\n" +
      'Har bir rasm ostida "📥 Original (Full HD)" tugmasi bo\'ladi — bosib, siqilmagan asl faylni yuklab olasiz.'
  );
});

bot.help((ctx) => {
  ctx.reply('Shunchaki qidirmoqchi bo\'lgan mavzuni yozing, masalan: "kuz manzaralari".');
});

bot.on('text', async (ctx) => {
  const query = ctx.message.text.trim();
  if (query.startsWith('/')) return; // noma'lum buyruqlarni e'tiborsiz qoldiramiz

  if (isThrottled(ctx.from.id)) {
    return ctx.reply('⏳ Biroz kuting, keyin qayta urinib ko\'ring.');
  }

  const waitMsg = await ctx.reply(`🔎 "${query}" bo'yicha qidirilmoqda...`);

  let photos;
  try {
    photos = await searchPexels(query);
  } catch (err) {
    console.error('Pexels qidiruv xatosi:', err.message);
    return ctx.reply('❌ Qidiruvda xatolik yuz berdi. Birozdan so\'ng qayta urinib ko\'ring.');
  }

  await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});

  if (!photos.length) {
    return ctx.reply(`😕 "${query}" bo'yicha hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring.`);
  }

  for (const photo of photos) {
    const caption = `📸 Muallif: ${photo.photographer}\n📐 O'lcham: ${photo.width}x${photo.height}`;
    try {
      await ctx.replyWithPhoto(
        { url: photo.src.large2x },
        {
          caption,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback('📥 Original (Full HD)', `dl_${photo.id}`),
          ]).reply_markup,
        }
      );
    } catch (err) {
      console.error('Rasm yuborishda xatolik:', err.message);
    }
  }
});

bot.action(/^dl_(\d+)$/, async (ctx) => {
  const photoId = ctx.match[1];
  await ctx.answerCbQuery('Yuklanmoqda...');

  try {
    const photo = await getPhotoById(photoId);
    await ctx.replyWithDocument(
      { url: photo.src.original, filename: `pexels_${photoId}.jpg` },
      { caption: `✅ Original sifat — ${photo.width}x${photo.height}` }
    );
  } catch (err) {
    console.error('Original yuklashda xatolik:', err.message);
    await ctx.reply('❌ Original faylni yuklashda xatolik yuz berdi.');
  }
});

bot.catch((err, ctx) => {
  console.error(`Xatolik (${ctx.updateType}):`, err);
});

bot.launch();
console.log('🤖 Bot ishga tushdi...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
