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
    // console.log('channel:', channel);
    // const lastBuildDate = new Date(channel.querySelector('lastBuildDate').textContent);
    // console.log('lastBuildDate', lastBuildDate);
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
      const postPubDate = new Date(item.querySelector('pubDate').textContent);
      const postTitle = item.querySelector('title').textContent;
      const postLink = item.querySelector('link').textContent;
      const postDescription = item.querySelector('description').textContent;
      const post = {
        id: uniqueId(),
        feedId: id,
        title: postTitle,
        link: postLink,
        postPubDate,
        description: postDescription,
      };
      posts.push(post);
    });

    return { feed, posts };
  }
};
