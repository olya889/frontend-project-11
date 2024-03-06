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
    uiState: {
      posts: [],
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
          const parser = new DOMParser();
          const xmlString = response.data.contents;
          const responseData = parser.parseFromString(xmlString, 'text/xml');
          const channel = responseData.querySelector('channel');
          const newPosts = [];
          const currentChannelPosts = watchedState.posts.filter((post) => post.feedId === id);
          const lastPubDate = currentChannelPosts[0].postPubDate;
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
        watchedState.formState = 'waiting response';
        const formData = new FormData(e.target);
        const rss = formData.get('url').trim();
        validateRss(rss, watchedState)
          .then((validRss) => getUrlWithProxy(validRss))
          .then((url) => axios.get(url))
          .then((response) => {
            watchedState.formState = 'processing';
            const { feed, posts } = parse(rss, response);
            watchedState.feeds.unshift(feed);
            watchedState.posts.unshift(...posts);
            checkNewPosts(watchedState);
          })
          .catch((err) => {
            watchedState.formState = 'processing';
            if (err.name === 'ValidationError') {
              watchedState.error = err.message.key;
            } else {
              watchedState.error = `errors.${err.name}`;
            }
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const readFullButton = document.querySelector('a.full-article');
        const targetID = e.target.getAttribute('data-id');
        const targetPost = state.posts.find((post) => post.id === targetID);
        modalTitle.textContent = targetPost.title;
        modalBody.textContent = targetPost.description;
        readFullButton.setAttribute('href', targetPost.link);
        watchedState.uiState.posts.push({ id: targetID });
      });
    });
};
