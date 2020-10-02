export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'application/xml');

  const channel = doc.getElementsByTagName('channel');
  const children = channel[0].childNodes;

  const title = Array.from(children).find((element) => element.nodeName === 'title').innerHTML;

  const items = Array.from(children).filter((el) => el.nodeName === 'item')
    .map((el) => el.childNodes);
  const item = items.map((el) => Array.prototype.slice.call(el))
    .map((feed) => {
      const link = feed.find((element) => element.nodeName === 'link');
      const text = feed.find((element) => element.nodeName === 'title');
      return { link: link.innerHTML, text: text.innerHTML };
    });
  return { news: item, title };
};
