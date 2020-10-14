import * as yup from "yup";
import _ from "lodash";
import axios from "axios";
import onChange from "on-change";
import i18next from "i18next";
import parse from "./parse.js";
import "bootstrap/dist/css/bootstrap.min.css";
import view from "./view.js";
import text from "./text.js";
import { setLocale } from "yup";

const sliceProtocol = (link) =>
  link.slice(link.includes("https") ? 5 : 4, link.length);

const form = document.querySelector("form");
const proxyUrl = "https://api.codetabs.com/v1/proxy?quest=";

const updateFeed = (state) => {
  state.feeds.map((feedData) => {
    axios.get(`${proxyUrl}${feedData.url}`).then((response) => {
      const newData = parse(response);
      const oldDataa = state.posts.filter((post) => post.id === feedData.id);
      const difference = _.differenceWith(
        newData.news,
        oldDataa[0].posts,
        _.isEqual
      );
      if (difference.length > 0) {
        const newPosts = state.posts.filter((post) => post.id !== feedData.id);
        onChange.target(state).posts = newPosts;
        const posts = newData.news.map((post) => post);
        state.posts.unshift({ posts, id: feedData.id });
      }
    });
  });
  window.setTimeout(() => updateFeed(state), 5000);
};

const tryValidation = (validationObject, links) => {
  setLocale({
    mixed: {
      notOneOf: i18next.t("exists"),
    },
    string: {
      url: i18next.t("invalidLink"),
    },
  });

  const schema = yup.object().shape({
    website: yup.string().url(),
    notOneOf: yup.mixed().notOneOf(links),
  });

  return schema.validate(validationObject).catch((err) => err.errors);
};

export default () => {
  i18next.init(text);

  const state = {
    form: {
      valid: true,
      errors: [],
    },
    feedsProcess: {
      state: "readyToLoad",
    },
    posts: [],
    feeds: [],
    links: [],
  };

  const watchedState = onChange(state, (path, value) => {
    view(path, value);
  });

  updateFeed(watchedState);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("url");
    const urlWithoutProtocol = sliceProtocol(url);
    watchedState.feedsProcess.state = "loading";
    tryValidation(
      { website: url, notOneOf: urlWithoutProtocol },
      state.links
    ).then((validationAnswer) => {
      if (Array.isArray(validationAnswer)) {
        watchedState.form.valid = false;
        watchedState.form.errors = validationAnswer;
        return;
      }
      watchedState.form.valid = true;
      state.links.push(urlWithoutProtocol);
      axios.get(`${proxyUrl}${url}`).then((response) => {
        const parsedNews = parse(response);
        const id = _.uniqueId();
        watchedState.feeds.unshift({ ...parsedNews, id, url });
        const posts = parsedNews.news.map((post) => post);
        watchedState.posts.unshift({ posts, id });
        watchedState.feedsProcess.state = "readyToLoad";
      });
    });
  });
};
