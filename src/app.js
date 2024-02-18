import i18next from 'i18next';
import { string, setLocale } from 'yup';
import resources from './locales/index.js';
import watch from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    feedbackElement: document.querySelector('p.feedback'),
    postsContainer: document.querySelector('div.posts'),
    feedsContainer: document.querySelector('div.feeds'),
    inputElement: document.querySelector('input'),
  };

  const state = {
    rssList: [],
    postsList: [],
    error: '',
  };

  const validateRss = (rss, links) => {
    const schema = string().url().notOneOf(links).matches(/[^\s]/);
    return schema.validate(rss);
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
          notOneOf: () => ({ key: 'errors.notOneOf' }),
          matches: () => ({ key: 'errors.matches' }),
        },
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rss = formData.get('url').trim();
        validateRss(rss, watchedState.rssList)
          .then((url) => {
            watchedState.rssList.push(url);
            watchedState.postsList.push(url);
          })
          .catch((err) => {
            watchedState.error = err.type;
          });
      });
    });
};
