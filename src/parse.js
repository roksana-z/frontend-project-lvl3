function ParserError(message) {
  this.name = 'parserError';
  this.message = message;
}

export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new ParserError(parserError.textContent);
  }
  const channel = doc.getElementsByTagName('channel');
  const items = channel[0].querySelectorAll('item');

  const title = channel[0].querySelector('title');
  // const description = channel[0].querySelector('description').innerHTML;

  const item = Array.from(items).map((feed) => {
    const link = feed.querySelector('link');
    const text = feed.querySelector('title');
    return { link: link.textContent, text: text.textContent };
  });
  return { news: item, title: title.textContent };
};
