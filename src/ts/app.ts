import Collapse from './Components/Collapse/Collapse';

// Регистрируем кастомный элемент <ui-collapse> для виджета "Коллапс"
if (!customElements.get('collapse')) {
  customElements.define('ui-collapse', Collapse);
}
