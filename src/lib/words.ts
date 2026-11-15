// Розбиває текст на слова — для анімації «слово за словом» (data-scrub-words).
export function words(text = ''): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}
