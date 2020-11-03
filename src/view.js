import i18next from 'i18next';
import _ from 'lodash';

export const renderFeed = (feed) => {
  const h2 = document.createElement('h2');
  h2.innerHTML = feed.title;
  return h2;
};

export const renderError = (err) => {
  const div = document.createElement('div');
  div.classList.add('invalid-feedback', 'errors');
  div.innerHTML = i18next.t(err);
  const url = document.querySelector('.form-control');
  url.after(div);
};

export const renderPosts = (posts) => {
  const postsContainer = posts.map((post) => {
    const a = document.createElement('a');
    const div = document.createElement('div');
    a.setAttribute('href', post.link);
    a.innerHTML = post.text;
    div.append(a);
    return div.outerHTML;
  }).join('\n');
  const div = document.createElement('div');
  div.innerHTML = postsContainer;
  return div;
};

export const renderChannel = (stateObj, allPosts, oldPosts) => {
  const container = document.querySelector('.feeds-container');
  const newPosts = _.differenceWith(allPosts, oldPosts);
  const { feedId } = newPosts[0];
  const currentPosts = stateObj.posts.filter((post) => post.feedId === feedId);
  const curFeed = stateObj.feeds.filter((feed) => feed.feedId === feedId);
  let channelContainer = document.getElementById(feedId);
  if (!channelContainer) {
    channelContainer = document.createElement('div');
    channelContainer.setAttribute('id', feedId);
    container.append(channelContainer);
  }
  channelContainer.innerHTML = '';
  const htmlFeed = renderFeed(...curFeed);
  const htmlPosts = renderPosts(currentPosts);
  channelContainer.prepend(htmlFeed);
  channelContainer.append(htmlPosts);
};

export const renderValidation = (valid) => {
  const input = document.querySelector('input');
  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
};

export const renderStatus = (value) => {
  const btnSpiner = document.querySelector('.btn-spiner');
  const btn = document.querySelector('.btn');
  const formGroup = document.querySelector('.form-group');
  const input = document.querySelector('input');
  const errors = document.querySelectorAll('.errors');
  if (value === 'readyToLoad') {
    btnSpiner.classList.remove('spinner-border', 'spinner-border-sm');
    btn.disabled = false;
    input.value = '';

    Array.from(errors).forEach((error) => {
      const children = Array.from(formGroup.childNodes);
      const index = children.indexOf(error);
      formGroup.removeChild(formGroup.childNodes[index]);
    });
  }
  if (value === 'loading failed') {
    btnSpiner.classList.remove('spinner-border', 'spinner-border-sm');
    btn.disabled = false;
  }
  if (value === 'loading') {
    btnSpiner.classList.add('spinner-border', 'spinner-border-sm');
    btn.disabled = true;
  }
};
