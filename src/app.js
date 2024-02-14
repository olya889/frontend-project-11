import i18next from 'i18next';
//import { runtime } from 'webpack';
//import ru from './locales/ru.js'
import resources from './locales/index.js'
import { string, setLocale } from 'yup';
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
  setLocale({
    mixed: {
      required: () => ({ key: 'errors.requiredField' }),
    },
  });
  const userSchema = string().url().matches(/[^\s]/); 
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources
  })
  .then(() => {

  const watchedState = watch(elements, i18nextInstance, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rss = formData.get('url').trim();
    userSchema.validate(rss)
    .then((url) => {
      if (!watchedState.rssList.includes(url)) {
        watchedState.rssList.push(url);
        watchedState.postsList.push(url);
      } else {
        watchedState.error = i18nextInstance.t('errors.notUnique');
        // watchedState.error = errors.notUnique;
      }
    })
    .catch((err) => {
      watchedState.error = err.errors;
    });
  });
});
};
