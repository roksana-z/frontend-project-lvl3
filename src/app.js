import * as yup from "yup";
import _ from "lodash";
import axios from "axios";
import onChange from "on-change";
import i18next from "i18next";
import parse from "./parse.js";
import "bootstrap/dist/css/bootstrap.min.css";
import view from "./view.js";
import text from "./text.js";

const sliceProtocol = (link) =>
  link.slice(link.includes("https") ? 5 : 4, link.length);

const form = document.querySelector("form");
const input = document.querySelector("input");
const proxyUrl = "https://api.codetabs.com/v1/proxy?quest=";

const promise = (state, feeds) =>
  new Promise((resolve) => {
    const changedFeed = feeds.map((feedData) =>
      axios.get(`${proxyUrl}https${feedData.link}`).then((response) => {
        const items = parse(response);
        const comparableData = items.news.map((data) => data.text).join(",");
        if (comparableData !== feedData.data) {
          const newFeedData = feedData;
          newFeedData.data = comparableData;
          newFeedData.dataForRender = items;
          return newFeedData;
        }
        return null;
      })
    );

    resolve(
      Promise.all(changedFeed).then((result) => {
        result
          .filter((el) => el !== null)
          .forEach((feed) => {
            const id = feed.id;
            // eslint-disable-next-line no-param-reassign
            state.replacingFeed = { dataForRender: feed.dataForRender, id };
          });
        window.setTimeout(() => promise(state, feeds), 5000);
      })
    );
  });

const tryValidation = (validationObject, watchedState, links) => {
  const schema = yup.object().shape({
    website: yup.string().url(),
    notOneOf: yup.mixed().notOneOf(links),
  });
  const result = schema.isValid(validationObject).then((valid) => {
    switch (Object.keys(validationObject).join()) {
      case "website":
        watchedState.valid = valid;
        return valid;
      case "notOneOf":
        watchedState.isLinkExists = valid;
        return valid;
      default:
        break;
    }
  });
  return result;
};

export default () => {
  i18next.init(text);

  const state = {
    valid: true,
    isLinkExists: false,
    cleanErrors: null,
    replacingFeed: null,
    renderingFeed: null,
    feeds: [],
    links: [],
  };

  const watchedState = onChange(state, (path, value) => {
    view(path, value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("url");
    tryValidation({ website: url }, watchedState, state.links).then(
      (validLink) => {
        const urlWithoutProtocol = sliceProtocol(url);
        tryValidation(
          { notOneOf: urlWithoutProtocol },
          watchedState,
          state.links
        ).then((validExists) => {
          if (!validLink || !validExists) {
            return;
          }
          state.links.push(urlWithoutProtocol);
          axios
            .get(`${proxyUrl}${url}`)
            .then((response) => {
              const parsedNews = parse(response);
              const comparableData = parsedNews.news
                .map((data) => data.text)
                .join(",");
              const id = _.uniqueId();
              state.feeds.push({
                data: comparableData,
                id,
                link: urlWithoutProtocol,
              });
              watchedState.renderingFeed = { parsedNews, id };
            })
            .then(() => {
              watchedState.cleanErrors = "clean";
              watchedState.cleanErrors = null;
              promise(watchedState, state.feeds);
            });
        });
      }
    );
  });
};
