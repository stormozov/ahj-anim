import FeedbackWidget from './Components/CallbackChat/CallbackChat';
import Collapse from './Components/Collapse/Collapse';
import LikerWidget from './Components/Liker/Liker';

const initCollapse = (): void => {
  // Регистрируем кастомный элемент <ui-collapse> для виджета "Коллапс"
  if (!customElements.get('collapse')) {
    customElements.define('ui-collapse', Collapse);
  }
};

const initCallbackChat = (): FeedbackWidget => new FeedbackWidget('#root');
const initLiker = (): LikerWidget => new LikerWidget('.like-button');

document.addEventListener('DOMContentLoaded', () => {
  initCollapse();
  initCallbackChat();
  initLiker();
});
