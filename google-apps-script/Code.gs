/**
 * Приймач заявок з сайту: записує заявку в Google-таблицю і надсилає її в Telegram.
 *
 * Як встановити (детально — у README, розділ «Форма заявок»):
 * 1. Google-таблиця → Розширення → Apps Script → вставити цей код у Code.gs → зберегти.
 * 2. Налаштування проєкту → Властивості скрипта:
 *      TELEGRAM_TOKEN   — токен бота від @BotFather
 *      TELEGRAM_CHAT_ID — ID групи для заявок (з мінусом)
 * 3. Виконати testTelegram — у групі має з'явитися повідомлення.
 * 4. Розгорнути → Нове розгортання → Веб-застосунок, від імені «Я», доступ «Усі».
 * 5. URL веб-застосунку (/exec) вписати в FORM_ENDPOINT у файлі site.config.mjs.
 *
 * Після кожної зміни коду: Розгорнути → Керувати розгортаннями → олівець →
 * Нова версія. І збільшити VERSION нижче, щоб перевірити, що оновлення спрацювало.
 */

var VERSION = 1;
var SHEET_NAME = 'Заявки';
var HEADERS = ['Дата', "Ім'я", 'Телефон', 'Форма'];

function doPost(e) {
  try {
    var data = {};
    try {
      data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    } catch (parseError) {
      return json_({ ok: false, error: 'Невірний формат даних' });
    }

    // Поле-пастка: людина його не бачить, а бот заповнює
    if (data.website) {
      return json_({ ok: true });
    }

    var name = String(data.name || '').trim();
    var phone = String(data.phone || '').trim();
    var service = String(data.service || 'Заявка з сайту').trim();

    if (!name || !phone) {
      return json_({ ok: false, error: "Вкажіть ім'я і телефон" });
    }

    // 1. Спочатку таблиця: заявка збережеться, навіть якщо Telegram недоступний
    saveToSheet_(name, phone, service);

    // 2. Потім Telegram
    try {
      sendTelegram_(
        '🔔 Нова заявка\n\n' +
        "Ім'я: " + name + '\n' +
        'Телефон: ' + phone + '\n' +
        'Форма: ' + service
      );
    } catch (tgError) {
      console.error('Telegram: ' + tgError);
    }

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Помилка сервера' });
  }
}

// Відкрийте URL /exec в інкогніто — побачите номер версії
function doGet() {
  return json_({ ok: true, version: VERSION });
}

// Перевірка бота прямо з редактора: оберіть testTelegram → Виконати
function testTelegram() {
  sendTelegram_('✅ Тест: бот підключений, заявки приходитимуть сюди.');
}

function saveToSheet_(name, phone, service) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), name, phone, service]);
}

function sendTelegram_(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    throw new Error('Не заповнені TELEGRAM_TOKEN або TELEGRAM_CHAT_ID у властивостях скрипта');
  }
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Telegram відповів ' + res.getResponseCode() + ': ' + res.getContentText());
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
