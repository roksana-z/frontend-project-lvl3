import * as yup from 'yup';
import './style.css';
import _ from 'lodash';
import axios from 'axios';
import parse from './parse.js';
import watchedState from './view.js';

const sliceProtocol = (link) => link.slice(link.includes('https') ? 5 : 4, link.length);

const state = {
  feeds: [],
};

const isExists = (link) => (state.feeds.filter((el) => el.link === link).length > 0);

const schema = yup.object().shape({
  website: yup.string().url(),
});

const btn = document.querySelector('.btn');
const input = document.querySelector('input');
const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';

const promise = () => new Promise((resolve) => {
  const changedFeed = state.feeds.map((feedData) => axios.get(`${proxyUrl}https${feedData.link}`)
    .then((response) => {
      const items = parse(response);
      const comparableData = items.news.map((data) => data.text).join(',');
      if (comparableData !== feedData.data) {
        const newFeedData = feedData;
        newFeedData.data = comparableData;
        newFeedData.dataForRender = items;
        return newFeedData;
      }
      return null;
    }));

  resolve(Promise.all(changedFeed)
    .then((result) => {
      result.filter((el) => el !== null).forEach((feed) => {
        const id = feed.id;
        watchedState.replacingFeed = { dataForRender: feed.dataForRender, id };
      });
      window.setTimeout(promise, 5000);
    }));
});

btn.addEventListener('click', () => {
  schema.isValid({ website: input.value })
    .then((valid) => {
      watchedState.valid = valid;
      if (!valid) {
        return;
      }
      const url = input.value;
      const urlWithoutProtocol = sliceProtocol(url);
      watchedState.isLinkExists = isExists(urlWithoutProtocol);
      if (isExists(urlWithoutProtocol)) {
        return;
      }

      axios.get(`${proxyUrl}${url}`)
        .then((response) => {
          const parsedNews = parse(response);
          const comparableData = parsedNews.news.map((data) => data.text).join(',');
          const id = _.uniqueId();
          state.feeds.push({ data: comparableData, id, link: urlWithoutProtocol });
          watchedState.renderingFeed = { parsedNews, id };
        })
        .then(() => {
          watchedState.cleanErrors = 'clean';
          watchedState.cleanErrors = null;
          promise();
        });
    });
});
