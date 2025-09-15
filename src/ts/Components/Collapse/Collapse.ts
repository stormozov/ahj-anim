import { v4 as uuidv4 } from 'uuid';

/**
 * Класс виджета "Коллапс"
 *
 * Виджет "Коллапс" позволяет сворачивать и разворачивать содержимое. Разметка
 * коллапса реализована в виде Shadow DOM. Тег <ui-collapse> является
 * контейнером для разметки коллапса.
 */
export default class Collapse extends HTMLElement {
  private _shadow: ShadowRoot;
  private _headerButton!: HTMLButtonElement;
  private _contentWrapper!: HTMLElement;
  private _isOpen: boolean = false;
  private _animationDuration = 300; // ms

  constructor() {
    super();

    // Создаём Shadow DOM для инкапсуляции
    this._shadow = this.attachShadow({ mode: 'open' });

    this._init();
  }

  /**
   * Список атрибутов, за которыми следует наблюдать.
   */
  static get observedAttributes(): string[] {
    return ['title', 'default-open'];
  }

  /**
   * Инициализация Виджета
   */
  private _init(): void {
    // Чтение атрибутов
    const defaultOpenAttr = this.getAttribute('default-open');
    this._isOpen = defaultOpenAttr === 'true';

    // Отрисовываем разметку
    this._render();

    // Устанавливаем начальное состояние
    this._updateContentHeight();
  }

  /**
   * Обработчик событий после монтирования
   */
  connectedCallback(): void {
    this._headerButton.addEventListener('click', () => this.toggle());
    document.addEventListener('keydown', (e) => this._handleKeyDown(e));
  }

  /**
   * Обработчик событий после размонтирования
   */
  disconnectedCallback(): void {
    this._headerButton.removeEventListener('click', () => this.toggle());
    document.removeEventListener('keydown', (e) => this._handleKeyDown(e));
  }

  /**
   * Переключение состояния коллапса
   */
  toggle(): void {
    this._isOpen = !this._isOpen;
    this._updateAriaAttributes();
    this._updateContentHeight();

    // После анимации закрываем, если нужно
    if (!this._isOpen) {
      setTimeout(() => {
        this._contentWrapper.style.height = '0px';
      }, this._animationDuration);
    }
  }

  /**
   * Обработчик изменения атрибутов
   *
   * @param name - имя изменённого атрибута
   * @param oldValue - старое значение атрибута
   * @param newValue - новое значение атрибута
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === 'title') {
      this._headerButton.textContent = newValue || '';
    }
    if (name === 'default-open') {
      this._isOpen = newValue === 'true';
      this._updateContentHeight();
    }
  }

  /**
   * Отрисовка разметки в Shadow DOM
   */
  private _render(): void {
    // Стили, встраиваемые в Shadow DOM
    const styleElement = this._renderStylesInShadowDOM();

    // Разметка
    this._renderMarkup(styleElement);

    // Устанавливаем начальное состояние
    this._updateAriaAttributes();
    this._updateContentHeight();
  }

  /**
   * Отрисовка стилей в Shadow DOM
   * @returns {HTMLElement} элемент стилей
   */
  private _renderStylesInShadowDOM(): HTMLElement {
    const style = document.createElement('style');

    style.textContent = `
      :host {
        display: block;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: system-ui, sans-serif;
      }

      .header {
        width: 100%;
        padding: 16px;
        text-align: left;
        background-color: #f9f9f9;
        border: none;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease;
        appearance: none;
        outline: none;
      }

      .header:hover {
        background-color: #f0f0f0;
      }

      .arrow {
        transition: transform 0.3s ease;
        font-size: 14px;
        user-select: none;
      }

      .arrow.open {
        transform: rotate(180deg);
      }

      .content {
        overflow: hidden;
        transition: height ${this._animationDuration}ms ease;
        background-color: white;
        height: 0;
      }

      .content-inner {
        padding: 16px;
        color: #333;
        box-sizing: border-box;
      }

      /* Адаптивность */
      @media (max-width: 768px) {
        .header {
          padding: 14px;
          font-size: 15px;
        }
        .content-inner {
          padding: 12px;
        }
      }
    `;

    return style;
  }

  /**
   * Отрисовка разметки
   * @param {HTMLElement} styleElement - элемент стилей
   */
  private _renderMarkup(styleElement: HTMLElement): void {
    const template = document.createElement('template');
    template.innerHTML = this._getHTMLTemplate();

    this._shadow.append(styleElement, template.content.cloneNode(true));

    // Получаем элементы
    const headerButton = this._shadow.querySelector('.header');
    const contentWrapper = this._shadow.querySelector('.content');

    if (headerButton instanceof HTMLButtonElement) {
      this._headerButton = headerButton;
    }
    if (contentWrapper instanceof HTMLElement) {
      this._contentWrapper = contentWrapper;
    }

    // Устанавливаем заголовок
    const titleSpan = this._shadow.querySelector('.title');
    if (titleSpan instanceof HTMLSpanElement) {
      titleSpan.textContent = this.getAttribute('title') || '';
    }
  }

  /**
   * Генерация разметки
   * @returns {string} разметка коллапса
   */
  private _getHTMLTemplate(): string {
    return `
      <button class="header" aria-expanded="false" aria-controls="${this._generateId()}">
        <span class="title"></span>
        <span class="arrow" aria-hidden="true">▼</span>
      </button>
      <div class="content" id="${this._generateId()}" aria-hidden="true">
        <div class="content-inner">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Генерация уникального id
   *
   * Используется пакет uuidv4 (https://github.com/uuidjs/uuid)
   *
   * @returns {string} уникальный id, представленный в виде строки. Например,
   * "collapse-123e4567-e89b-12d3-a456-426655440000"
   */
  private _generateId(): string {
    return `collapse-${uuidv4()}`;
  }

  /**
   * Обновление aria-атрибутов
   */
  private _updateAriaAttributes(): void {
    if (!this._headerButton || !this._contentWrapper) return;

    this._headerButton.setAttribute('aria-expanded', String(this._isOpen));
    this._contentWrapper.setAttribute('aria-hidden', String(!this._isOpen));
  }

  /**
   * Обновление высоты содержимого
   */
  private _updateContentHeight(): void {
    if (!this._contentWrapper) return;

    // Если контент скрыт — высота 0
    if (!this._isOpen) {
      this._contentWrapper.style.height = '0px';
      return;
    }

    // Запускаем анимацию
    requestAnimationFrame(() => {
      this._contentWrapper.style.height = this._calculateHeight();
    });
  }

  /**
   * Вычисление высоты содержимого
   * @returns {string} высота содержимого
   */
  private _calculateHeight(): string {
    if (!this._contentWrapper) return '0px';

    // Вычисляем высоту содержимого
    this._contentWrapper.style.height = 'auto'; // временно раскрываем для замера
    const height = this._contentWrapper.scrollHeight + 'px';
    this._contentWrapper.style.height = '0px'; // возвращаем обратно

    return height;
  }

  /**
   * Обработка нажатия клавиши
   * @param {KeyboardEvent} event - событие нажатия клавиши
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    // Проверяем, что клавиша нажата на текущий collapse
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === this._headerButton) {
        event.preventDefault();
        this.toggle();
      }
    }
  }
}
