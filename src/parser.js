export default (rss, response) => {
  const posts = [];
  const parser = new DOMParser();
  const xmlString = response.data.contents;
  const responseData = parser.parseFromString(xmlString, 'text/xml');

  if (responseData.querySelector('parsererror')) {
    const err = new Error();
    err.name = 'parsingError';
    throw err;
  }
  const channel = responseData.querySelector('channel');
  const channelTitle = channel.querySelector('title').textContent;
  const channelDescription = channel.querySelector('description').textContent;
  const feed = {
    rss,
    title: channelTitle,
    description: channelDescription,
  };
  const items = channel.querySelectorAll('item');
  items.forEach((item) => {
    const postPubDate = new Date(item.querySelector('pubDate').textContent);
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    const post = {
      title: postTitle,
      link: postLink,
      postPubDate,
      description: postDescription,
    };
    posts.push(post);
  });
  return { feed, posts };
};
