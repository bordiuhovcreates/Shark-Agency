/**
 * Приймач заявок з сайту: записує заявку в Google-таблицю.
 *
 * Як встановити:
 * 1. Google-таблиця → Розширення → Apps Script → вставити цей код у Code.gs → зберегти.
 *    (Або окремий проєкт на script.google.com — тоді вкажіть SPREADSHEET_ID нижче.)
 * 2. Розгорнути → Нове розгортання → Веб-застосунок, від імені «Я», доступ «Усі».
 * 3. URL веб-застосунку (/exec) вписати в FORM_ENDPOINT у файлі site.config.mjs.
 *
 * Після кожної зміни коду: Розгорнути → Керувати розгортаннями → олівець →
 * Нова версія. І збільшити VERSION нижче, щоб перевірити, що оновлення спрацювало.
 */

var VERSION = 1;
var SHEET_NAME = 'Заявки';
var HEADERS = ['Дата', "Ім'я", 'Email', 'Телефон', 'Форма'];
// ID таблиці (з її адреси: /spreadsheets/d/ID/edit). Потрібен, лише якщо скрипт
// створено окремо, а не через «Розширення → Apps Script» у самій таблиці.
var SPREADSHEET_ID = '';

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
    var email = String(data.email || '').trim();
    var phone = String(data.phone || '').trim();
    var service = String(data.service || 'Заявка з сайту').trim();

    if (!name || !phone) {
      return json_({ ok: false, error: "Вкажіть ім'я і телефон" });
    }

    saveToSheet_(name, email, phone, service);
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

function saveToSheet_(name, email, phone, service) {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), name, email, phone, service]);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
