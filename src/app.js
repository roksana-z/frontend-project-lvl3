import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import parse from './parse.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  renderChannel, renderValidation, renderError, renderStatus,
} from './view.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

const proxyUrl = 'https://hidden-lake-93699.herokuapp.com/';
const timeInterval = 5000;

const compareTitles = (data1, data2) => data1.title === data2.title;

const updateFeeds = (state, url) => {
  Promise.all(state.feeds.map((feedData) => axios.get(`${url}${feedData.url}`)
    .then((response) => {
      const newData = parse(response.data);
      const oldPosts = state.posts.filter((post) => post.feedId === feedData.feedId);
      const newPosts = newData.items.map((post) => (post));
      const difference = _.differenceWith(newPosts, oldPosts, compareTitles);
      if (difference.length > 0) {
        const differenceWithId = difference.map((diff) => ({ ...diff, feedId: feedData.feedId }));
        state.posts.unshift(...differenceWithId);
      }
    })
    .catch((err) => console.log(err))))
    .then(() => setTimeout(() => updateFeeds(state, url), timeInterval));
};

const validate = (url, urls) => {
  const schema = yup.string().url().required().notOneOf(urls);
  const errors = [];

  try {
    schema.validateSync(url);
  } catch (err) {
    errors.push(err.type);
  }
  return errors;
};

const runApp = () => {
  const form = document.querySelector('form');

  const state = {
    form: {
      valid: true,
      errors: [],
    },
    feedsProcess: {
      status: 'readyToLoad',
    },
    posts: [],
    feeds: [],
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'form.valid') {
      renderValidation(value);
    }
    if (path === 'form.errors') {
      renderError(value);
    }
    if (path === 'posts') {
      renderChannel(watchedState, value, previousValue);
    }
    if (path === 'feedsProcess.status') {
      renderStatus(value);
    }
  });

  updateFeeds(watchedState, proxyUrl);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const existingUrls = watchedState.feeds.map((feed) => feed.url);
    const validationErrors = validate(url, existingUrls);
    if (validationErrors.length > 0) {
      watchedState.form.errors = validationErrors;
      watchedState.form.valid = false;
      return;
    }
    watchedState.feedsProcess.status = 'loading';
    watchedState.form.valid = true;
    axios.get(`${proxyUrl}${url}`)
      .then((response) => {
        const parsedNews = parse(response.data);
        const id = _.uniqueId();
        const feed = { feedId: id, title: parsedNews.title, url };
        watchedState.feeds.unshift(feed);
        const posts = parsedNews.items.map((post) => ({ feedId: id, ...post }));
        watchedState.posts.unshift(...posts);
        watchedState.feedsProcess.status = 'readyToLoad';
      })
      .catch((err) => {
        watchedState.feedsProcess.status = 'loadingFailed';
        watchedState.form.valid = false;
        if (!err.response) {
          watchedState.form.errors = err.name;
        } else {
          watchedState.form.errors = err.response.status;
        }
      });
  });
};

export default () => {
  i18next.init({
    resources: { en, ru },
    lng: 'en',
    debug: true,
  }).then(runApp);
};
