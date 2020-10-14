export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'application/xml');

  const channel = doc.getElementsByTagName('channel');
  const items = channel[0].querySelectorAll('item');

  const title = channel[0].querySelector('title').innerHTML;
  const description = channel[0].querySelector('description').innerHTML;

  const item = Array.from(items).map((feed) => {
    const link = feed.querySelector('link');
    const text = feed.querySelector('title');
    return { link: link.innerHTML, text: text.innerHTML };
  });
  return { news: item, title };
};
