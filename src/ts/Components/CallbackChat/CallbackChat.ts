import { ICreateElementOptions } from '../../shared/interfaces';
import createElement from '../../utils/createElementFunction';

export default class FeedbackWidget {
  private _container: HTMLElement;
  private _toggleButton!: HTMLButtonElement;
  private _formContainer!: HTMLDivElement;
  private _form!: HTMLFormElement;
  private _isExpanded: boolean = false;

  constructor(containerSelector: string) {
    this._container = this._checkValidContainer(containerSelector);
    this._init();
  }

  private _checkValidContainer(containerSelector: string): HTMLElement {
    const container = document.querySelector(containerSelector);

    if (!container) {
      throw new Error(`Контейнер "${containerSelector}" не найден.`);
    }

    return container as HTMLElement;
  }

  private _init(): void {
    this._createStructure();
    this._bindEvents();
  }

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

  private _bindEvents(): void {
    this._toggleButton.addEventListener('click', () => this._toggleForm());
    this._bindFormEvents();
  }

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

  private _toggleForm(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._isExpanded ? this._collapse() : this._expand();
    this._isExpanded = !this._isExpanded;
  }

  private _expand(): void {
    // Скрываем кнопку
    this._toggleButton.classList.add('hidden');
    setTimeout(() => {
      this._toggleButton.style.display = 'none';
    }, 100);

    // Показываем форму
    this._formContainer.style.display = 'block';
    const formHeight = `${this._form.scrollHeight}px`;

    requestAnimationFrame(() => {
      this._formContainer.classList.remove('collapsed');
      this._formContainer.classList.add('expanded');
      this._formContainer.style.height = formHeight;
    });
  }

  private _collapse(): void {
    // Сворачиваем форму
    this._formContainer.style.height = '0';
    this._formContainer.classList.remove('expanded');
    this._formContainer.classList.add('collapsed');

    setTimeout(() => {
      this._formContainer.style.display = 'none';
    }, 100);

    // Показываем кнопку
    this._toggleButton.style.display = 'flex';
    setTimeout(() => {
      this._toggleButton.classList.remove('hidden');
    }, 10);
  }

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
