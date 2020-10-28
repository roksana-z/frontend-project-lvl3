import i18next from 'i18next';
import _ from 'lodash';

export default (path, value, state, previousValue) => {
  const container = document.querySelector('.feeds-container');
  const formGroup = document.querySelector('.form-group');
  const input = document.querySelector('input');

  const renderFeed = (feed) => {
    const h2 = document.createElement('h2');
    h2.innerHTML = feed.title;
    return h2;
  };

  const renderError = (err) => {
    const div = document.createElement('div');
    div.classList.add('invalid-feedback', 'errors');
    div.innerHTML = i18next.t(err);
    const url = document.querySelector('.form-control');
    url.after(div);
  };

  const renderPosts = (posts) => {
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

  const renderChannel = (stateObj, allPosts, oldPosts) => {
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

  const renderValidation = (valid) => {
    if (valid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  };

  if (path === 'form.valid') {
    renderValidation(value);
  }
  if (path === 'form.errors') {
    renderError(value);
  }
  if (path === 'posts') {
    renderChannel(state, value, previousValue);
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
