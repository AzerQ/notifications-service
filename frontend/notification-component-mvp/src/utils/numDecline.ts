/**
 * Склонение слова после числа.
 *
 *     // Примеры вызова:
 *     num_decline( num, 'книга,книги,книг' )
 *     num_decline( num, 'book,books' )
 *     num_decline( num, [ 'книга','книги','книг' ] )
 *     num_decline( num, [ 'book','books' ] )
 *
 * @param {number|string} number Число после которого будет слово. Можно указать число в HTML тегах.
 * @param {string|string[]} titles Варианты склонения или первое слово для кратного 1.
 * @param {boolean} show_number Указываем тут 00, когда не нужно выводить само число.
 *
 * @return string Например: 1 книга, 2 книги, 10 книг.
 *
 * @version 3.1
 */
export function num_decline(
  number: number | string,
  titles: string | string[],
  show_number: boolean = true
): string {
  if (typeof titles === 'string') {
    titles = titles.split(/, */);
  }

  // когда указано 2 элемента
  if (typeof titles[2] === 'undefined') {
    titles[2] = titles[1];
  }

  const cases = [2, 0, 1, 1, 1, 2];

  // strip_tags
  const intnum = Math.abs(
    parseInt(`${number}`.replace(/<\/?[^>]+>/gi, ''))
  );

  const title_index =
    intnum % 100 > 4 && intnum % 100 < 20
      ? 2
      : cases[Math.min(intnum % 10, 5)];

  return (show_number ? `${number} ` : '') + titles[title_index];
}