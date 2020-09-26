const onChange = require('on-change');
import * as yup from 'yup';
import './style.css';
import text from './text.js';
import i18next from 'i18next';


const sliceProtocol = (link, startPoint, endPoint) => {
    return link.slice(startPoint, endPoint);
}

const httpOrHttps = (link) => {
    if (link.includes('https')) {
        return sliceProtocol(link, 5, link.length - 1);
    }
    return sliceProtocol(link, 4, link.length - 1);
}

const ifExists = (link) => state.feeds.includes(link) ? true : false;

const state = {
    feeds: [],
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
    schema
        .isValid({
        website: input.value,
  })
  .then(function (valid) {
    if (valid === false) {
        input.classList.add('red-border');
        const div = document.createElement('div');
        div.classList.add('clr-red', 'errors');
        div.innerHTML = i18next.t('invalidLink');
        const url = document.querySelector('.form-control');
        url.after(div);
    } else {
        input.classList.remove('red-border');
        var cors_api_url = 'https://api.codetabs.com/v1/proxy?quest=';
        const options = {
            method: 'GET',
            url: input.value,
        }
        const pureLink = httpOrHttps(input.value);
        if (ifExists(pureLink)) {
            const div = document.createElement('div');
            div.classList.add('clr-red', 'errors');
            div.innerHTML = i18next.t('exists');
            const url = document.querySelector('.form-control');
            url.after(div);
            return;
        }
        state.feeds.push(pureLink);
        console.log(state)
        axios.get(`${cors_api_url}${options.url}`)
        .then(function (response) {
            // handle success
            const feed = document.createElement('div');
            
            var parser = new DOMParser();
            var doc = parser.parseFromString(response.data, "application/xml");
         
            const channel = doc.getElementsByTagName('channel');
            const children = channel[0].childNodes;
        
            //parse
            const title = Array.from(children).find((element, index, array) => element.nodeName === 'title').innerHTML;
          
            const items = Array.from(children).filter(el => el.nodeName === 'item').
                map(el => el.childNodes);
            const item = items.map(el => Array.prototype.slice.call(el)).
                map(item => {
                    const link =  item.find((element, index, array) => {
                        return element.nodeName === 'link';
                    })
                    const text = item.find((element, index, array) => {
                        return element.nodeName === 'title';
                    })
                    return {link: link.innerHTML, text: text.innerHTML}
                });

                //add feed
                const itemContainer = document.createElement('div');
                item.forEach(tagData => {
                    const a = document.createElement('a');
                    const div = document.createElement('div');
                    a.setAttribute('href', tagData.link);
                    a.innerHTML = tagData.text;
                    div.append(a);
                    itemContainer.append(div)
                })
                const h2 = document.createElement('h2');
                h2.innerHTML= title;
                itemContainer.prepend(h2)
            itemContainer.classList.add('mb-30')
            container.append(itemContainer);
            
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
           input.value = '';
         
           const errors = document.querySelectorAll('.errors');
           
           Array.from(errors).map( error => {
            const children = Array.from(formGroup.childNodes);
            const index =children.indexOf(error);
            formGroup.removeChild(formGroup.childNodes[index]);
           })
           
        });
        
       
    }
  });
    
})

