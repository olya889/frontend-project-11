import i18next from 'i18next';
import axios from 'axios';
import { string, setLocale } from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './view.js';
import parse from './parser.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    feedbackElement: document.querySelector('p.feedback'),
    postsContainer: document.querySelector('div.posts'),
    feedsContainer: document.querySelector('div.feeds'),
    inputElement: document.querySelector('input'),
  };

  const state = {
    feeds: [],
    posts: [],
    error: '',
  };

  const validateRss = (url, watchedState) => {
    const links = watchedState.feeds.map((feed) => {
      const { rss } = feed;
      return rss;
    });
    const schema = string().url().notOneOf(links).matches(/[^\s]/);
    return schema.validate(url);
  };

  const checkNewPosts = (watchedState) => {
    watchedState.feeds.forEach((feed) => {
      const { rss, id } = feed;
      const url = new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${rss}`);
      axios.get(url)
        .then((response) => {
          const parser = new DOMParser();
          const xmlString = response.data.contents;
          const responseData = parser.parseFromString(xmlString, 'text/xml');
          const channel = responseData.querySelector('channel');
          // const items = channel.querySelectorAll('item');
          const newPosts = [];
          const currentChannelPosts = watchedState.posts.filter((post) => post.feedId === id);
          // console.log('CUR:', currentChannelPosts);
          const lastPubDate = currentChannelPosts[0].postPubDate;
          // const firstItem = channel.querySelector('item');
          // const date = new Date(firstItem.querySelector('pubDate').textContent);
          channel.querySelectorAll('item').forEach((item) => {
            const postTitle = (item.querySelector('title').textContent);
            const postLink = item.querySelector('link').textContent;
            const postDescription = item.querySelector('description').textContent;
            const date = new Date(item.querySelector('pubDate').textContent);
            if (date > lastPubDate) {
              const post = {
                id: uniqueId(),
                feedId: feed.id,
                title: postTitle,
                link: postLink,
                postPubDate: date,
                description: postDescription,
              };
              newPosts.push(post);
            }
          });
          // console.log('Newposts:', newPosts);
          watchedState.posts.unshift(...newPosts);
        });
      //  .catch((err) => {console.log(err)})
    });
    setTimeout(() => checkNewPosts(watchedState), 5000);
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      const watchedState = watch(elements, i18nextInstance, state);
      setLocale({
        string: {
          url: () => ({ key: 'errors.url' }),
          matches: () => ({ key: 'errors.matches' }),
        },
        mixed: {
          notOneOf: () => ({ key: 'errors.notOneOf' }),
          parsingError: () => ({ key: 'errors.hasNotRss' }),
          networkError: () => ({ key: 'errors.networkError' }),
        },
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rss = formData.get('url').trim();
        validateRss(rss, watchedState)
          .then((validRss) => new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${validRss}`))
          .then((url) => axios.get(url))
          .then((response) => {
            // console.log(response);
            const { feed, posts } = parse(rss, response);
            watchedState.feeds.unshift(feed);
            watchedState.posts.unshift(...posts);
            checkNewPosts(watchedState);
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              watchedState.error = err.message.key;
              // console.log(watchedState.error);
            } else {
              // console.log(err.message);
              watchedState.error = `errors.${err.name}`;
              // console.log(watchedState.error);
            }
          });
        // checkNewPosts(watchedState);
      });
    });
};
