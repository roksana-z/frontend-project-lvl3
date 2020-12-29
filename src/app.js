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

const makeProxyUrl = (url) => `${proxyUrl}${url}`;

const updateFeeds = (state) => {
  Promise.allSettled(state.feeds.map((feedData) => {
    const url = makeProxyUrl(feedData.url);
    return axios.get(url)
      .then((response) => {
        const newData = parse(response.data);
        const oldPosts = state.posts.filter((post) => post.feedId === feedData.feedId);
        const newPosts = newData.items;
        const difference = _.differenceWith(newPosts, oldPosts, compareTitles);
        // Данную проверку я все равно оставила,
        // так как без нее лишний раз изменяется state и вызывается renderChannel
        // хотя никаких изменений в постах и фидах нет
        // альтернативой будет добавление в watchedState проверки 'if (newPosts > 0)'
        if (difference.length > 0) {
          const differenceWithId = difference.map((diff) => ({ ...diff, feedId: feedData.feedId }));
          state.posts.unshift(...differenceWithId);
        }
      })
      .catch((err) => console.log(err));
  }))
    .then(() => setTimeout(() => updateFeeds(state), timeInterval));
};

const validate = (url, urls) => {
  const schema = yup.string().url().required().notOneOf(urls);
  let error = null;

  try {
    schema.validateSync(url);
  } catch (err) {
    error = err.type;
  }
  return error;
};

const runApp = () => {
  const form = document.querySelector('form');

  const state = {
    form: {
      valid: true,
      error: null,
    },
    feedsProcess: {
      status: 'readyToLoad',
    },
    posts: [],
    feeds: [],
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'form.valid':
        renderValidation(value);
        break;
      case 'form.error':
        renderError(value);
        break;
      case 'posts': {
        const newPosts = _.differenceWith(value, previousValue);
        const { feedId } = newPosts[0];
        renderChannel(watchedState, feedId);
        break;
      }
      case 'feedsProcess.status':
        renderStatus(value);
        break;
      default:
        break;
    }
  });

  updateFeeds(watchedState);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const existingUrls = watchedState.feeds.map((feed) => feed.url);
    const validationError = validate(url, existingUrls);
    if (validationError) {
      watchedState.form.error = validationError;
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
          watchedState.form.error = err.name;
        } else {
          watchedState.form.error = err.response.status;
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
