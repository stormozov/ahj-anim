import createElement from '../../utils/createElementFunction';
import { HeartPosition } from './shared/types';

/**
 * Класс виджета "Лайкер"
 *
 * Виджет "Лайкер" позволяет добавлять анимацию появления сердца при клике на
 * кнопку.
 */
export default class LikerWidget {
  private _container: HTMLElement | null = null;
  private _button: HTMLButtonElement;
  private readonly _trajectories: string[] = [
    'center-left-center-right-center',
    'center-center-right-left-center',
    'center-center-left-right-center',
    'center-right-center-left-center',
  ];

  /**
   * Конструктор класса
   * @param {string} containerSelector - Селектор контейнера, в который будет добавлен виджет
   */
  constructor(containerSelector: string) {
    this._container = this._validateContainer(containerSelector);

    this._container.style.position = 'relative';

    this._button = this._createButton();
    this._container.append(this._button);
  }

  /**
   * Валидация селектора контейнера
   *
   * @param {string} containerSelector - Селектор контейнера
   * @returns {HTMLElement} - Валидный контейнер
   *
   * @private
   */
  private _validateContainer(containerSelector: string): HTMLElement {
    const container = document.querySelector(containerSelector);
    if (container instanceof HTMLElement) return container;

    throw new Error(`Container with id "${containerSelector}" not found`);
  }

  /**
   * Создание кнопки
   *
   * @returns {HTMLButtonElement} - Созданная кнопка
   * @throws {Error} - Если кнопка не создана
   *
   * @private
   */
  private _createButton(): HTMLButtonElement {
    const button = createElement({
      tag: 'button',
      className: 'like-button',
      text: 'Like 👍',
    });
    button.addEventListener('click', () => this._addHeart());
    if (button instanceof HTMLButtonElement) return button;

    throw new Error('Button not created');
  }

  /**
   * Добавление элемента сердца в DOM и присвоение анимации
   *
   * @private
   */
  private _addHeart(): void {
    if (!this._container) return;

    // 1. Создаем сердце
    const heart = createElement({ tag: 'div', className: 'heart' });

    // 2. Позиционируем сердце относительно кнопки
    this._applyHeartPosition(heart);

    // 3. Присваиваем анимацию сердцу
    this._assignHeartAnimation(heart);

    // 4. Добавляем сердце в DOM и подписываемся на завершение анимации
    this._appendHeartAndSetupCleanup(heart);
  }

  /**
   * Позиционирование сердца относительно кнопки
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   *
   * @private
   */
  private _applyHeartPosition(heart: HTMLElement): void {
    // Рассчитываем позицию сердца относительно кнопки и контейнера
    const { left, top } = this._calculateHeartPosition(heart);

    heart.style.left = `${left}px`;
    heart.style.bottom = `${top}px`;
  }

  /**
   * Рассчитываем позицию сердца относительно кнопки и контейнера
   *
   * @param {HTMLElement} heart - HTML-элемент сердца
   * @returns {HeartPosition} - Позиция сердца
   *
   * @see {@link HeartPosition}
   *
   * @private
   */
  private _calculateHeartPosition(heart: HTMLElement): HeartPosition {
    if (!this._container) return { left: 0, top: 0 };

    const buttonRect = this._button.getBoundingClientRect();
    const containerRect = this._container.getBoundingClientRect();

    // 🟢 Горизонтальное центрирование: сердце по центру кнопки
    const HEART_HALF_WIDTH = 15;
    const left =
      buttonRect.left -
      containerRect.left +
      buttonRect.width / 2 -
      HEART_HALF_WIDTH;

    // 🟢 Вертикальное позиционирование: нижний край сердца → верхний край кнопки
    const top = buttonRect.bottom - containerRect.top - heart.offsetHeight;

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
   *
   * @private
   */
  private _appendHeartAndSetupCleanup(heart: HTMLElement): void {
    this._container?.append(heart);

    heart.addEventListener('animationend', () => heart.remove(), {
      once: true,
    });
  }
}
