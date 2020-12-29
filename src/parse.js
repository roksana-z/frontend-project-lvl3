export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    const error = new Error(parserError.textContent);
    error.name = 'ParserError';
    throw error;
  }
  const channel = doc.querySelector('channel');
  const items = channel.querySelectorAll('item');

  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;

  const posts = Array.from(items).map((feed) => {
    const link = feed.querySelector('link');
    const postTitle = feed.querySelector('title');
    return { link: link.textContent, title: postTitle.textContent };
  });
  return { items: posts, title, description };
};
