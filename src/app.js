import i18next from 'i18next';
//import { runtime } from 'webpack';
import ru from './locales/ru.js'
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
    resourses: {
      ru,
    }
  })
  .then(() => {
  console.log(i18nextInstance.t('author'));

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
        watchedState.error = 'RSS уже существует';
        // watchedState.error = errors.notUnique;
      }
    })
    .catch((err) => {
      watchedState.error = err.errors;
    });
  });
});
};
/*    const watchedState = onChange(state, (path, value) => {
        switch (path) {
            case 'error': renderError(feedbackElement, inputElement, watchedState, i18nInstance);
            break;

            case 'rssList': renderRSS(form, postsContainer, feedsContainer, inputElement, watchedState, i18nInstance);
            break;

            case 'postsList': renderPosts(postsContainer, value, watchedState, i18nInstance);
            break;

            default:
                break;
        }
    }); */
