import i18next from 'i18next';
import _ from 'lodash';

const container = document.querySelector('.feeds-container');
const input = document.querySelector('input');
const btnSpiner = document.querySelector('.btn-spiner');
const btn = document.querySelector('.btn');

export const getFeedHtml = (feed) => {
  const h2 = document.createElement('h2');
  h2.innerHTML = feed.title;
  return h2;
};

export const renderError = (err) => {
  const errors = document.querySelectorAll('.error');
  errors.forEach((error) => error.remove());
  const div = document.createElement('div');
  div.classList.add('invalid-feedback', 'error');
  div.textContent = i18next.t(err);
  const url = document.querySelector('.form-control');
  url.after(div);
};

export const getPostsContainer = (posts) => {
  const postsHtml = posts.map((post) => {
    const a = document.createElement('a');
    const div = document.createElement('div');
    a.setAttribute('href', post.link);
    a.textContent = post.title;
    div.appendChild(a);
    return div.outerHTML;
  }).join('\n');
  const div = document.createElement('div');
  div.innerHTML = postsHtml;
  return div;
};

export const renderChannel = (stateObj, feedId) => {
  const currentPosts = stateObj.posts.filter((post) => post.feedId === feedId);
  const curFeed = stateObj.feeds.filter((feed) => feed.feedId === feedId);
  let channelContainer = document.getElementById(feedId);
  if (!channelContainer) {
    channelContainer = document.createElement('div');
    channelContainer.setAttribute('id', feedId);
    container.append(channelContainer);
  }
  channelContainer.innerHTML = '';
  const htmlFeed = getFeedHtml(...curFeed);
  const htmlPosts = getPostsContainer(currentPosts);
  channelContainer.prepend(htmlFeed);
  channelContainer.append(htmlPosts);
};

export const renderValidation = (valid) => {
  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
};

export const renderStatus = (status) => {
  const errors = document.querySelectorAll('.error');

  if (status === 'readyToLoad') {
    btnSpiner.classList.remove('spinner-border', 'spinner-border-sm');
    btn.disabled = false;
    input.value = '';

    errors.forEach((error) => error.remove());
  }
  if (status === 'loadingFailed') {
    btnSpiner.classList.remove('spinner-border', 'spinner-border-sm');
    btn.disabled = false;
  }
  if (status === 'loading') {
    btnSpiner.classList.add('spinner-border', 'spinner-border-sm');
    btn.disabled = true;
  }
};
