/**
 * Функция-обертка alert.
 * Сообщает пользователю, что данные с сервера получить не удалось.
 */

export function serverNoDataAlert() {
  return alert("Что-то пошло не так.\n" + "Не могу получить данные с сервера.");
}