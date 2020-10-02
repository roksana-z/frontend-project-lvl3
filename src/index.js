
import * as yup from 'yup';
import './style.css';
import parse from   './parse.js';
import watchedState from './view.js';
import _ from 'lodash';
import axios from 'axios';

const sliceProtocol = (link) => link.slice(link.includes('https') ? 5 : 4, link.length);

const isExists = (link) => state.feeds.filter(el => el.link === link).length > 0 ? true : false;

const state = {
    feeds: [],
}

let schema = yup.object().shape({
  website: yup.string().url(),
});

const btn = document.querySelector('.btn');
const input = document.querySelector('input');
const cors_api_url = 'https://api.codetabs.com/v1/proxy?quest=';


const promise = () => new Promise((resolve) => {
    const changedFeed = state.feeds.map(feedData => {
        return axios.get(`${cors_api_url}https${feedData.link}`)
                .then(function (response) {
                    const items = parse(response);
                    const comparableData = items.news.map(data => data.text).join(',');
                    if (comparableData !== feedData.data) {
                        feedData.data = comparableData;
                        feedData.dataForRender = items;
                        return feedData;
                    };
                    return null;
        })
    })

    resolve(Promise.all(changedFeed)
    .then((result) => {
        result.filter(el => el !== null).forEach(feed => {
            const id = feed.id;
            console.log('update');
            watchedState.replacingFeed = {dataForRender: feed.dataForRender, id: id};
        })
        window.setTimeout(promise, 5000)
    }))
});


btn.addEventListener('click', () => {
    schema.isValid({website: input.value})
    .then(function (valid) {
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

        axios.get(`${cors_api_url}${url}`)
        .then(function (response) {
            const parsedNews = parse(response);
            const comparableData = parsedNews.news.map(data => data.text).join(',');
            const id = _.uniqueId();
            state.feeds.push({data: comparableData, id: id, link: urlWithoutProtocol});
            watchedState.renderingFeed = {parsedNews: parsedNews, id: id};
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(() => {
            watchedState.cleanErrors = 'clean';
            watchedState.cleanErrors = null;
            promise(); 
        })
    })
});

