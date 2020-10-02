/* eslint-env node, es6 */
import * as onChange from 'on-change';
import i18next from 'i18next';
import text from './text.js';

i18next.init(text);

const container = document.querySelector('.feeds-container');
const formGroup = document.querySelector('.form-group');
const input = document.querySelector('input');

const state = {
  valid: true,
  isLinkExists: false,
  cleanErrors: null,
  renderingFeed: null,
};

const renderFeed = (parsedNews) => {
  const itemContainer = document.createElement('div');
  parsedNews.news.forEach((item) => {
    const a = document.createElement('a');
    const div = document.createElement('div');
    a.setAttribute('href', item.link);
    a.innerHTML = item.text;
    div.append(a);
    itemContainer.append(div);
  });

  const h2 = document.createElement('h2');
  h2.innerHTML = parsedNews.title;
  itemContainer.prepend(h2);

  itemContainer.classList.add('mb-30');
  return itemContainer;
};

const renderValidation = (errName) => {
  input.classList.add('red-border');
  const div = document.createElement('div');
  div.classList.add('clr-red', 'errors');
  div.innerHTML = i18next.t(errName);
  const url = document.querySelector('.form-control');
  url.after(div);
};

export default onChange(state, (path, value) => {
  if (path === 'valid' && value) {
    input.classList.remove('red-border');
  }
  if (path === 'valid' && !value) {
    renderValidation('invalidLink');
  }
  if (path === 'isLinkExists' && value) {
    renderValidation('exists');
  }
  if (path === 'replacingFeed') {
    const updatedFeed = renderFeed(value.dataForRender);
    const changedFeed = document.getElementById(value.id);
    updatedFeed.setAttribute('id', value.id);
    changedFeed.replaceWith(updatedFeed);
  }
  if (path === 'renderingFeed') {
    const itemContainer = renderFeed(value.parsedNews);
    itemContainer.setAttribute('id', value.id);
    container.append(itemContainer);
  }
  if (path === 'cleanErrors' && value === 'clean') {
    input.value = '';
    const errors = document.querySelectorAll('.errors');

    Array.from(errors).forEach((error) => {
      const children = Array.from(formGroup.childNodes);
      const index = children.indexOf(error);
      formGroup.removeChild(formGroup.childNodes[index]);
    });
  }
});
