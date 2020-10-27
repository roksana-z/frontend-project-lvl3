import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import parse from './parse.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { renderState } from './view.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

const compareTitles = (data1, data2) => data1.text === data2.text;

const updateFeed = (state, proxyUrl) => {
  state.feeds.forEach((feedData) => {
    axios
      .get(`${proxyUrl}${feedData.url}`).then((response) => {
        const newData = parse(response);
        const oldPosts = state.posts.filter((post) => post.feedId === feedData.feedId);
        const newPosts = newData.news.map((post) => (post));
        const difference = _.differenceWith(newPosts, oldPosts, compareTitles);
        if (difference.length > 0) {
          const differenceWithId = difference.map((diff) => ({ ...diff, feedId: feedData.feedId }));
          state.posts.unshift(...differenceWithId);
        }
      })
      .catch((err) => state.form.errors.unshift(err.response.status));
  });
  window.setTimeout(() => updateFeed(state, proxyUrl), 5000);
};

const tryValidation = (url, urls) => {
  const schema = yup.object().shape({
    website: yup.string().url(),
    notOneOf: yup.mixed().notOneOf(urls),
  });
  const errors = [];

  try {
    schema.validateSync({ website: url, notOneOf: url });
  } catch (err) {
    errors.push(err.type);
  }
  return errors;
};

export default () => {
  i18next.init({
    resources: { en, ru },
    lng: 'en',
    debug: true,
  });

  const form = document.querySelector('form');
  const proxyUrl = 'https://hidden-lake-93699.herokuapp.com/';

  const state = {
    form: {
      valid: true,
      errors: [],
    },
    feedsProcess: {
      state: 'readyToLoad',
      currentState: { },
    },
    posts: [],
    feeds: [],
    links: [],
  };

  const watchedState = onChange(state, function (path, value, previousValue) {
    renderState(path, value, this, previousValue);
  });

  updateFeed(watchedState, proxyUrl);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const validationErrors = tryValidation(url, watchedState.links);
    if (validationErrors.length > 0) {
      watchedState.form.valid = false;
      watchedState.form.errors = validationErrors;
      return;
    }
    watchedState.form.valid = true;
    watchedState.links.push(url);
    axios.get(`${proxyUrl}${url}`).then((response) => {
      const parsedNews = parse(response);
      const id = _.uniqueId();
      const feed = { feedId: id, title: parsedNews.title, url };
      watchedState.feeds.unshift(feed);
      const posts = parsedNews.news.map((post) => ({ feedId: id, ...post }));
      watchedState.feedsProcess.state = 'loading';
      watchedState.posts.unshift(...posts);
      watchedState.feedsProcess.state = 'readyToLoad';
    })
      .catch((err) => watchedState.form.errors.unshift(err.response.status));
  });
};
