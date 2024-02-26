import i18next from 'i18next';
import axios from 'axios';
import { string, setLocale } from 'yup';
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
      console.log(feed);
      return rss;
    });
    console.log(links);
    const schema = string().url().notOneOf(links).matches(/[^\s]/);
    return schema.validate(url);
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
            const { feed, posts } = parse(rss, response);
            watchedState.feeds.push(feed);
            watchedState.posts.push(...posts);
          })
          .catch((err) => {
            // console.log(JSON.stringify(err));
            console.log(JSON.stringify(err));
            if (err.name === 'ValidationError') {
              watchedState.error = err.message.key;
              // console.log(watchedState.error);
            } else {
              // console.log(err.message);
              watchedState.error = `errors.${err.name}`;
              // console.log(watchedState.error);
            }
          });
      });
    });
};
