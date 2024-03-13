import i18next from 'i18next';
import axios from 'axios';
import { string, setLocale } from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './view.js';
import parse from './parser.js';
import init from './init.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    formTitle: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    inputLabel: document.querySelector('label'),
    submitButton: document.querySelector('button[type="submit"]'),
    exampleElement: document.querySelector('p.text-muted'),
    feedbackElement: document.querySelector('p.feedback'),
    postsContainer: document.querySelector('div.posts'),
    feedsContainer: document.querySelector('div.feeds'),
    inputElement: document.querySelector('input'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    readFullButton: document.querySelector('a.full-article'),
    modalCloseButton: document.querySelector('button.btn-secondary'),
  };

  const state = {
    feeds: [],
    posts: [],
    error: '',
    uiState: {
      posts: new Set(),
    },
    formState: 'initial',
  };

  const validateRss = (url, watchedState) => {
    const links = watchedState.feeds.map((feed) => {
      const { rss } = feed;
      return rss;
    });
    const schema = string().url().notOneOf(links).matches(/[^\s]/);
    return schema.validate(url);
  };
  const getUrlWithProxy = (url) => {
    const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app/');
    urlWithProxy.searchParams.set('disableCache', 'true');
    urlWithProxy.searchParams.set('url', url);
    return urlWithProxy.toString();
  };

  const checkNewPosts = (watchedState) => {
    watchedState.feeds.forEach((feed) => {
      const { rss, id } = feed;
      const url = getUrlWithProxy(rss);
      axios.get(url)
        .then((response) => {
          const { posts } = parse(rss, response);
          const newPosts = [];
          const currentChannelPosts = watchedState.posts.filter((post) => post.feedId === id);
          const lastPubDate = currentChannelPosts[0].postPubDate;
          posts.forEach((post) => {
            if (post.postPubDate > lastPubDate) {
              const item = post;
              item.id = uniqueId();
              item.feedId = id;
              newPosts.push(item);
            }
          });
          watchedState.posts.unshift(...newPosts);
        });
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
          url: () => ({ key: 'responseSection.errors.url' }),
          matches: () => ({ key: 'responseSection.errors.matches' }),
        },
        mixed: {
          notOneOf: () => ({ key: 'responseSection.errors.notOneOf' }),
          parsingError: () => ({ key: 'responseSection.errors.hasNotRss' }),
          networkError: () => ({ key: 'responseSection.errors.networkError' }),
        },
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.formState = 'waiting response';
        const formData = new FormData(e.target);
        const rss = formData.get('url').trim();
        validateRss(rss, watchedState)
          .then((validRss) => {
            const urlWithProxy = getUrlWithProxy(validRss);
            return axios.get(urlWithProxy);
          })
          .then((response) => {
            watchedState.formState = 'processing';
            const { feed, posts } = parse(rss, response);
            const feedId = uniqueId();
            feed.id = feedId;
            watchedState.feeds.unshift(feed);
            posts.forEach((post) => {
              const item = post;
              item.id = uniqueId();
              item.feedId = feedId;
            });
            watchedState.posts.unshift(...posts);

            elements.postsContainer.addEventListener('click', (event) => {
              if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
                const targetID = event.target.getAttribute('data-id');
                const targetPost = state.posts.find((post) => post.id === targetID);
                elements.modalTitle.textContent = targetPost.title;
                elements.modalBody.textContent = targetPost.description;
                elements.readFullButton.setAttribute('href', targetPost.link);
                watchedState.uiState.posts.add(targetID);
              }
            });
            checkNewPosts(watchedState);
          })
          .catch((err) => {
            watchedState.error = '';
            watchedState.formState = 'processing';
            if (err.name === 'ValidationError') {
              watchedState.error = err.message.key;
            } else {
              watchedState.error = `responseSection.errors.${err.name}`;
            }
          });
      });
    });
  init(elements, i18nextInstance);
};
