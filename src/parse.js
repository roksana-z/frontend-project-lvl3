export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    const error = new Error(parserError.textContent);
    error.name = 'parserError';
    throw error;
  }
  const channel = doc.getElementsByTagName('channel');
  const items = channel[0].querySelectorAll('item');

  const title = channel[0].querySelector('title');
  // const description = channel[0].querySelector('description').innerHTML;

  const posts = Array.from(items).map((feed) => {
    const link = feed.querySelector('link');
    const postTitle = feed.querySelector('title');
    return { link: link.textContent, title: postTitle.textContent };
  });
  return { posts, title: title.textContent };
};
