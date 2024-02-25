import uniqueId from 'lodash/uniqueId.js';

export default (rss, response) => {
  const posts = [];
  const parser = new DOMParser();
  const xmlString = response.data.contents;
  const responseData = parser.parseFromString(xmlString, 'text/xml');
  // console.log(responseData.querySelector('parsererror').textContent);
  if (responseData.querySelector('parsererror')) {
    const err = new Error();
    err.name = 'parsingError';
    throw err;
  } else {
    const channel = responseData.querySelector('channel');
    const channelTitle = channel.querySelector('title').textContent;
    const channelDescription = channel.querySelector('description').textContent;
    const id = uniqueId();
    const feed = {
      rss,
      id,
      title: channelTitle,
      description: channelDescription,
    };
    const items = channel.querySelectorAll('item');
    items.forEach((item) => {
      const postTitle = item.querySelector('title').textContent;
      const postLink = item.querySelector('link').nextSibling.data;
      const post = {
        feedId: id,
        title: postTitle,
        link: postLink,
      };
      posts.push(post);
    });

    return { feed, posts };
  }
};
