export default (path, value) => {
  const container = document.querySelector('.feeds-container');
  const formGroup = document.querySelector('.form-group');
  const input = document.querySelector('input');

  const renderFeed = (feed) => {
    const feedContainer = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.innerHTML = feed[0].title;
    feedContainer.prepend(h2);
    feedContainer.setAttribute('id', feed[0].id);
    container.append(feedContainer);
  };

  const renderError = (err) => {
    const div = document.createElement('div');
    div.classList.add('invalid-feedback', 'errors');
    div.innerHTML = err[0];
    const url = document.querySelector('.form-control');
    url.after(div);
  };

  const renderPosts = ([posts]) => {
    const feedContainer = document.getElementById(posts.id);
    if (posts.posts.length > 1) {
      const h2 = feedContainer.childNodes[0];
      feedContainer.innerHTML = '';
      feedContainer.append(h2);
    }
    posts.posts.forEach((post) => {
      const a = document.createElement('a');
      const div = document.createElement('div');
      a.setAttribute('href', post.link);
      a.innerHTML = post.text;
      div.append(a);
      feedContainer.append(div);
    });
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
  if (path === 'feeds') {
    renderFeed(value);
  }
  if (path === 'posts') {
    renderPosts(value);
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
