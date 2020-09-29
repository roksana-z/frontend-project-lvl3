const onChange = require('on-change');
import * as yup from 'yup';
import './style.css';
import text from './text.js';
import i18next from 'i18next';
import parse from   './parse.js';
import render from './view.js';
var _ = require('lodash');

const sliceProtocol = (link, startPoint, endPoint) => {
    return link.slice(startPoint, endPoint);
}

const httpOrHttps = (link) => {
    if (link.includes('https')) {
        return sliceProtocol(link, 5, link.length);
    }
    return sliceProtocol(link, 4, link.length);
}

const ifExists = (link) => state.feeds.includes(link) ? true : false;

const state = {
    feeds: [],
    feeds2: [
        
    ]
}

const axios = require('axios');
i18next.init(text);

let schema = yup.object().shape({
  website: yup.string().url(),
});

const btn = document.querySelector('.btn');
const input = document.querySelector('input');
const container = document.querySelector('.feeds-container');
const formGroup = document.querySelector('.form-group');

btn.addEventListener('click', () => {
   schema.isValid({website: input.value})
  .then(function (valid) {
    if (!valid) {
        input.classList.add('red-border');
        const div = document.createElement('div');
        div.classList.add('clr-red', 'errors');
        div.innerHTML = i18next.t('invalidLink');
        const url = document.querySelector('.form-control');
        url.after(div);
    } else {
        input.classList.remove('red-border');
        var cors_api_url = 'https://api.codetabs.com/v1/proxy?quest=';
        const url = input.value;
        const urlWithoutProtocol = httpOrHttps(url);
        if (ifExists(urlWithoutProtocol)) {
            const div = document.createElement('div');
            div.classList.add('clr-red', 'errors');
            div.innerHTML = i18next.t('exists');
            const url = document.querySelector('.form-control');
            url.after(div);
            return;
        }
        state.feeds.push(urlWithoutProtocol);
      
        axios.get(`${cors_api_url}${url}`)
        .then(function (response) {
            // handle success
            const parsedNews = parse(response);
            const comparableData = parsedNews.news.map(data => data.text).join(',');
            const id = _.uniqueId();
            state.feeds2.push({data: comparableData, id: id, link: urlWithoutProtocol});

          
            const itemContainer = render(parsedNews);
            itemContainer.setAttribute('id', id)
            container.append(itemContainer);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
           input.value = '';
           const errors = document.querySelectorAll('.errors');
           
           Array.from(errors).forEach( error => {
            const children = Array.from(formGroup.childNodes);
            const index =children.indexOf(error);
            formGroup.removeChild(formGroup.childNodes[index]);
           })


           const promise2 = () => new Promise((resolve, reject) => {
                const a = state.feeds2.map(feedData => {
                    return axios.get(`${cors_api_url}https${feedData.link}`)
                    .then(function (response) {
                            const items = parse(response);
                            const comparableData = items.news.map(data => data.text).join(',');
                            return comparableData === feedData.data;
                    })
                })
                    resolve(Promise.all(a));
              });
           
           promise2().then((result) => window.setInterval(promise2, 5000))
           
        })
        
       
    }
  });
    
})

