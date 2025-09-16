import createElement from '../../utils/createElementFunction';
import { HeartPosition } from './shared/types';

/**
 * Класс виджета "Лайкер"
 *
 * Виджет "Лайкер" позволяет добавлять анимацию появления сердца при клике на
 * элемент.
 */
export default class LikerWidget {
  private _elements: HTMLElement[] = [];
  private readonly _trajectories: string[] = [
    'center-left-center-right-center',
    'center-center-right-left-center',
    'center-center-left-right-center',
    'center-right-center-left-center',
  ];

  /**
   * Конструктор класса
   * @param {string} elementSelector - Селектор элементов, на которые вешаем эффекты
   */
  constructor(elementSelector: string) {
    this._elements = this._findElements(elementSelector);

    this._elements.forEach((element) => {
      element.style.position = 'relative';
      element.addEventListener('click', () => this._addHeart(element));
    });
  }

  /**
   * Поиск элементов по селектору
   *
   * @param {string} elementSelector - Селектор элементов
   * @returns {HTMLElement[]} - Массив найденных элементов
   * @throws {Error} - Если элементы не были найдены
   *
   * @private
   */
  private _findElements(elementSelector: string): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>(elementSelector)];
  }

  /**
   * Добавление элемента сердца в DOM и присвоение анимации
   *
   * @param {HTMLElement} clickedElement - Элемент, на который кликнули
   *
   * @private
   */
  private _addHeart(clickedElement: HTMLElement): void {
    // 1. Создаем сердце
    const heart = createElement({ tag: 'div', className: 'heart' });

    // 2. Позиционируем сердце относительно элемента
    this._applyHeartPosition(heart, clickedElement);

    // 3. Присваиваем анимацию сердцу
    this._assignHeartAnimation(heart);

    // 4. Добавляем сердце в DOM и подписываемся на завершение анимации
    this._appendHeartAndSetupCleanup(heart, clickedElement);
  }

  /**
   * Позиционирование сердца относительно элемента
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   * @param {HTMLElement} clickedElement - Элемент, на который кликнули
   *
   * @private
   */
  private _applyHeartPosition(
    heart: HTMLElement,
    clickedElement: HTMLElement
  ): void {
    // Рассчитываем позицию сердца относительно элемента
    const { left, top } = this._calculateHeartPosition(heart, clickedElement);

    heart.style.left = `${left}px`;
    heart.style.bottom = `${top}px`;
  }

  /**
   * Рассчитываем позицию сердца относительно элемента
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   * @param {HTMLElement} clickedElement - Элемент, на который кликнули
   * @returns {HeartPosition} - Позиция сердца
   *
   * @see {@link HeartPosition}
   *
   * @private
   */
  private _calculateHeartPosition(
    heart: HTMLElement,
    clickedElement: HTMLElement
  ): HeartPosition {
    const elementRect = clickedElement.getBoundingClientRect();

    // Горизонтальное центрирование: сердце по центру элемента
    const HEART_HALF_WIDTH = 15;
    const left = elementRect.width / 2 - HEART_HALF_WIDTH;

    // Вертикальное позиционирование: нижний край сердца → верхний край элемента
    const top = -heart.offsetHeight;

    return { left, top };
  }

  /**
   * Присваиваем анимацию сердцу
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   *
   * @private
   */
  private _assignHeartAnimation(heart: HTMLElement): void {
    const trajectory =
      this._trajectories[Math.floor(Math.random() * this._trajectories.length)];

    heart.style.animationName = `animate-${trajectory}`;
    heart.style.animationDuration = '500ms';
    heart.style.animationFillMode = 'forwards';
    heart.style.animationTimingFunction = 'cubic-bezier(0.6, 0.2, 0.65, 1)'; // ease-out
  }

  /**
   * Добавляем сердце в DOM и подписываемся на завершение анимации
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   * @param {HTMLElement} clickedElement - Элемент, на который кликнули
   *
   * @private
   */
  private _appendHeartAndSetupCleanup(
    heart: HTMLElement,
    clickedElement: HTMLElement
  ): void {
    clickedElement.append(heart);

    heart.addEventListener('animationend', () => heart.remove(), {
      once: true,
    });
  }
}
