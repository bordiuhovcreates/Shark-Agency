// Налаштування адреси сайту і форми заявок.
// Claude змінює ці значення за вашим проханням, вручну правити не обов'язково.

// Адреса на GitHub Pages: https://ЛОГІН.github.io/НАЗВА-РЕПОЗИТОРІЮ
export const SITE_URL = 'https://bordiuhovcreates.github.io';
export const BASE_PATH = '/Shark-Agency';

// Свій домен або піддомен: сайт живе в корені
// export const SITE_URL = 'https://solar.your-domain.com';
// export const BASE_PATH = '/';

// Куди йдуть заявки з форми.
// Зараз — Google Apps Script (закінчується на /exec): заявки йдуть у Google-таблицю «Заявки Shark Agency».
// Можна замінити на пошту через FormSubmit: https://formsubmit.co/ajax/ПОШТА
export const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwbaq6uajYH04rs_5MCRlIYxKTTEc7q5ttYhjrkoLNsrtH-1a2pnkilxQ78mo_kiCv2/exec';
