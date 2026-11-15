// Налаштування адреси сайту і форми заявок.
// Claude змінює ці значення за вашим проханням, вручну правити не обов'язково.

// Адреса на GitHub Pages: https://ЛОГІН.github.io/НАЗВА-РЕПОЗИТОРІЮ
export const SITE_URL = 'https://LOGIN.github.io';
export const BASE_PATH = '/REPO-NAME';

// Свій домен або піддомен: сайт живе в корені
// export const SITE_URL = 'https://solar.your-domain.com';
// export const BASE_PATH = '/';

// Куди йдуть заявки з форми.
// Зараз — на пошту через FormSubmit: https://formsubmit.co/ajax/ПОШТА
// Можна замінити на URL Google Apps Script (закінчується на /exec) — тоді заявки підуть у Telegram і таблицю.
export const FORM_ENDPOINT = 'https://formsubmit.co/ajax/vladlenbordugov@gmail.com';
