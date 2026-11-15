// Додає до шляху адресу сайту (base), щоб посилання і картинки працювали
// і на github.io/назва-репозиторію, і на своєму домені.
// Використання: url('images/photo.jpg'), url('/thanks/'), url('#contacts')
export function url(path = ''): string {
  if (!path) return '';
  if (/^(https?:|mailto:|tel:|#|data:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
