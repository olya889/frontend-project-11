import onChange from 'on-change';
import { string } from 'yup';
import render from './render.js';

export default () => {
  const state = {
    rssList: [],
    postsList: [],
    error: '',
  };

  const watchedState = onChange(state, render);
  const userSchema = string().required().url();
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
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
        }
      })
      .catch((err) => {
        watchedState.error = err.errors;
      });
  });
};
