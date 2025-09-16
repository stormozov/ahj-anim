import FeedbackWidget from './Components/CallbackChat/CallbackChat';
import Collapse from './Components/Collapse/Collapse';
import LikerWidget from './Components/Liker/Liker';

// Регистрируем кастомный элемент <ui-collapse> для виджета "Коллапс"
if (!customElements.get('collapse')) {
  customElements.define('ui-collapse', Collapse);
}

new FeedbackWidget('#root');
new LikerWidget('.liker-wrapper');
