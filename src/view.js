import i18next from 'i18next';

const container = document.querySelector('.feeds-container');
const formGroup = document.querySelector('.form-group');
const input = document.querySelector('input');

export const renderFeed = (feed) => {
  const h2 = document.createElement('h2');
  h2.innerHTML = feed.title;
  return h2;
};

export const renderError = ([err]) => {
  const div = document.createElement('div');
  div.classList.add('invalid-feedback', 'errors');
  div.innerHTML = i18next.t(err);
  const url = document.querySelector('.form-control');
  url.after(div);
};

export const renderPosts = (posts) => {
  const postsContainer = [];
  posts.forEach((post) => {
    const a = document.createElement('a');
    const div = document.createElement('div');
    a.setAttribute('href', post.link);
    a.innerHTML = post.text;
    div.append(a);
    postsContainer.push(div.outerHTML);
  });
  const div = document.createElement('div');
  div.innerHTML = postsContainer.join('\n');
  return div;
};

export const renderChannel = (state, feed) => {
  const { feedId } = feed;
  const posts = state.posts.filter((post) => post.feedId === feedId);
  let channelContainer = document.getElementById(feedId);
  if (!channelContainer) {
    channelContainer = document.createElement('div');
    channelContainer.setAttribute('id', feedId);
    container.append(channelContainer);
  }
  channelContainer.innerHTML = '';
  const htmlFeed = renderFeed(feed);
  const htmlPosts = renderPosts(posts);
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

export const renderState = (path, value) => {
  if (path === 'form.valid') {
    renderValidation(value);
  }
  if (path === 'form.errors') {
    renderError(value);
  }
  if (path === 'feedsProcess.state' && value === 'readyToLoad') {
    input.value = '';
    const errors = document.querySelectorAll('.errors');

    Array.from(errors).forEach((error) => {
      const children = Array.from(formGroup.childNodes);
      const index = children.indexOf(error);
      formGroup.removeChild(formGroup.childNodes[index]);
    });
  }
};
