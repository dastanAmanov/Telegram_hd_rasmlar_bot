# Telegram Full HD Rasm Bot

Foydalanuvchi qanday so'z yozsa, o'sha mavzudagi sifatli rasmlarni Pexels'dan topib beruvchi bot.

## O'rnatish

1. Kutubxonalarni o'rnating:
   ```
   npm install
   ```

2. `.env.example` faylini `.env` deb nomlang va ichiga o'z kalitlaringizni yozing:
   ```
   BOT_TOKEN=...
   PEXELS_API_KEY=...
   ```
   - `BOT_TOKEN` — BotFather'dan olingan token.
   - `PEXELS_API_KEY` — https://www.pexels.com/api/ saytida bepul ro'yxatdan o'tib olinadi.

3. Botni ishga tushiring:
   ```
   npm start
   ```

## Qanday ishlaydi

- `/start` — tanishtiruv xabari
- Har qanday oddiy matn (masalan: "tog'lar", "dengiz") — shu mavzuda 5 tagacha rasm qidirib topadi
- Har bir rasm ostidagi **"📥 Original (Full HD)"** tugmasi — siqilmagan asl faylni fayl (document) sifatida yuboradi, chunki Telegram odatiy rasm yuborishda (`sendPhoto`) fayllarni avtomatik siqadi

## Cheklovlar

- Pexels bepul tarifida soatiga ~200 so'rov limiti bor
- Botda oddiy throttling bor: bir foydalanuvchi 3 soniyada bittadan ortiq so'rov yubora olmaydi

## Xavfsizlik eslatmasi

`.env` faylini hech qachon ochiq joyga (GitHub, chat va h.k.) yubormang — u orqali botingizni boshqa kishi to'liq boshqarib olishi mumkin. Agar token oshkor bo'lib qolgan bo'lsa, BotFather'da `/revoke` orqali uni bekor qiling va yangisini oling.
