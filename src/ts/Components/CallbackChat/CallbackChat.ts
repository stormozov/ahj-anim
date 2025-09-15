import { ICreateElementOptions } from '../../shared/interfaces';
import createElement from '../../utils/createElementFunction';

/**
 * Виджет обратной связи с анимированным раскрытием/сворачиванием.
 *
 * Размещается в правом нижнем углу экрана в виде круглой красной кнопки.
 * При клике — кнопка исчезает, из её позиции плавно выдвигается форма с полями ввода.
 * Форма содержит шапку с заголовком "Напишите нам" и кнопкой закрытия (крестиком).
 * После отправки или закрытия — форма сворачивается, кнопка появляется обратно.
 *
 * Все анимации длятся 100ms с функцией `linear`, синхронизированы с CSS-переходами.
 * Управление стилями осуществляется через CSS-классы, инлайн-стили используются минимально (только для динамической высоты).
 *
 * ### Использование:
 * ```ts
 * const widget = new FeedbackWidget('#feedbackWidget');
 * ```
 *
 * ### Требования к HTML:
 * Контейнер должен существовать в DOM:
 * ```html
 * <div id="feedbackWidget"></div>
 * ```
 *
 * @example
 * document.addEventListener('DOMContentLoaded', () => {
 *   new FeedbackWidget('#feedbackWidget');
 * });
 */
export default class FeedbackWidget {
  private _container: HTMLElement;
  private _toggleButton!: HTMLButtonElement;
  private _formContainer!: HTMLDivElement;
  private _form!: HTMLFormElement;
  private _isExpanded: boolean = false;
  private _animationDuration: number = 100;

  /**
   * Конструктор класса FeedbackWidget
   * @param {string} containerSelector - Селектор контейнера, в который будет добавлен виджет
   */
  constructor(containerSelector: string) {
    this._container = this._checkValidContainer(containerSelector);
    this._init();
  }

  /**
   * Проверка валидности селектора контейнера, который передан в конструктор
   *
   * @param {string} containerSelector - Селектор контейнера
   * @returns {HTMLElement} - Валидный контейнер
   * @throws {Error} - Если контейнер не был найден
   *
   * @private
   */
  private _checkValidContainer(containerSelector: string): HTMLElement {
    const container = document.querySelector(containerSelector);

    if (!container) {
      throw new Error(`Контейнер "${containerSelector}" не найден.`);
    }

    return container as HTMLElement;
  }

  /**
   * Инициализация виджета
   *
   * @private
   */
  private _init(): void {
    this._createStructure();
    this._bindEvents();
  }

  /**
   * Создание структуры DOM-элементов виджета
   *
   * @private
   */
  private _createStructure(): void {
    // Получаем конфигурацию для создания HTML-элементов
    const { toggleButton, formContainer, form } = this._getHTMLConfigs();

    // Создаем HTML-элементы
    this._toggleButton = createElement(toggleButton) as HTMLButtonElement;
    this._formContainer = createElement(formContainer) as HTMLDivElement;
    this._form = createElement(form) as HTMLFormElement;

    // Добавляем HTML-элементы в DOM
    this._formContainer.append(this._form);
    this._container.append(this._toggleButton, this._formContainer);
  }

  /**
   * Привязка событий к элементам интерфейса
   *
   * @private
   */
  private _bindEvents(): void {
    this._toggleButton.addEventListener('click', () => this._toggleForm());
    this._bindFormEvents();
  }

  /**
   * Привязка событий к элементам формы
   *
   * @private
   */
  private _bindFormEvents(): void {
    // Слушатель отправки формы
    this._form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Сообщение отправлено!');
      this._toggleForm();
      this._form.reset();
    });

    // Слушатель закрытия по крестику
    const closeButton = this._form.querySelector('.close-btn');
    if (closeButton instanceof HTMLButtonElement) {
      closeButton.addEventListener('click', () => this._toggleForm());
    }
  }

  /**
   * Переключает состояние виджета обратной связи:
   * если форма раскрыта — сворачивает её, если свёрнута — раскрывает.
   * Одновременно управляет видимостью кнопки-триггера.
   *
   * @private
   */
  private _toggleForm(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._isExpanded ? this._collapse() : this._expand();
    this._isExpanded = !this._isExpanded;
  }

  /**
   * Анимированно раскрывает форму обратной связи.
   *
   * 1. Скрывает кнопку-триггер, добавляя класс `hidden` и через 100ms устанавливает `display: none`.
   * 2. Показывает контейнер формы (`display: block`).
   * 3. Измеряет высоту содержимого формы и анимирует раскрытие через изменение `height` и классы состояния.
   *
   * Анимация длится 100ms, согласуется с CSS-переходами (`transition: height 100ms linear`).
   * Используется `requestAnimationFrame` для плавного запуска анимации в следующем кадре рендера.
   *
   * @private
   */
  private _expand(): void {
    // Скрываем кнопку
    this._toggleButton.classList.add('hidden');
    setTimeout(() => {
      this._toggleButton.style.display = 'none';
    }, this._animationDuration);

    // Показываем форму
    this._formContainer.style.display = 'block';
    const formHeight = `${this._form.scrollHeight}px`;

    requestAnimationFrame(() => {
      this._formContainer.classList.remove('collapsed');
      this._formContainer.classList.add('expanded');
      this._formContainer.style.height = formHeight;
    });
  }

  /**
   * Сворачивает форму обратной связи с использованием анимации.
   *
   * 1. Устанавливает высоту контейнера формы в `0` и переключает CSS-классы для запуска анимации сворачивания.
   * 2. Через 100ms (синхронно с длительностью CSS-перехода) полностью скрывает форму через `display: none`.
   * 3. Одновременно восстанавливает видимость кнопки-триггера: сначала возвращает `display: flex`,
   *    затем через 10ms убирает класс `hidden` для плавного появления.
   *
   * Анимация длится 100ms, согласуется с CSS (`transition: height 100ms linear`).
   * Задержка 10ms для кнопки обеспечивает визуальную плавность — кнопка появляется после начала сворачивания формы.
   *
   * @private
   */
  private _collapse(): void {
    // Сворачиваем форму
    this._formContainer.style.height = '0';
    this._formContainer.classList.remove('expanded');
    this._formContainer.classList.add('collapsed');

    setTimeout(() => {
      this._formContainer.style.display = 'none';
    }, this._animationDuration);

    // Показываем кнопку
    this._toggleButton.style.display = 'flex';
    setTimeout(() => {
      this._toggleButton.classList.remove('hidden');
    }, 10);
  }

  /**
   * Возвращает конфигурацию HTML-элементов для инициализации виджета обратной связи.
   *
   * Конфиг используется утилитой `createElement` для динамического создания DOM-дерева.
   *
   * Содержит настройки для:
   * - кнопки-триггера (`toggleButton`)
   * - контейнера формы (`formContainer`)
   * - самой формы с шапкой, крестиком и полями ввода (`form`)
   *
   * @returns {Record<string, ICreateElementOptions>} Объект с конфигурациями элементов,
   * где ключ — логическое имя элемента, значение — опции для создания.
   *
   * @see ICreateElementOptions — интерфейс, описывающий структуру конфига: tag, className, attrs, children, text/html.
   *
   * @private
   */
  private _getHTMLConfigs(): Record<string, ICreateElementOptions> {
    return {
      toggleButton: {
        tag: 'button',
        className: 'feedback-toggle-btn',
        text: '💬',
      },
      formContainer: {
        tag: 'div',
        className: ['feedback-form-container', 'collapsed'],
      },
      form: {
        tag: 'form',
        className: 'feedback-form',
        children: [
          {
            tag: 'div',
            className: 'form-header',
            children: [
              {
                tag: 'span',
                text: 'Напишите нам',
              },
              {
                tag: 'button',
                className: 'close-btn',
                html: '&times;',
              },
            ],
          },
          {
            tag: 'div',
            className: 'form-body',
            children: [
              {
                tag: 'input',
                attrs: {
                  type: 'text',
                  placeholder: 'Имя',
                  required: 'true',
                },
              },
              {
                tag: 'input',
                attrs: {
                  type: 'email',
                  placeholder: 'Email',
                  required: 'true',
                },
              },
              {
                tag: 'textarea',
                attrs: {
                  placeholder: 'Сообщение',
                  required: 'true',
                },
              },
              {
                tag: 'button',
                attrs: {
                  type: 'submit',
                },
                text: 'Отправить',
              },
            ],
          },
        ],
      },
    };
  }
}
