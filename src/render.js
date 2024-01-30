export default (path, value) => {
  const feedbackElement = document.querySelector('p.feedback');
  const postsContainer = document.querySelector('div.posts');
  const feedsContainer = document.querySelector('div.feeds');
  const inputElement = document.querySelector('input');
  const form = document.querySelector('form');
  switch (path) {
    case 'error':
      feedbackElement.textContent = value;
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      inputElement.classList.add('is-invalid');
      break;

    case 'rssList': {
      postsContainer.replaceChildren();
      feedsContainer.replaceChildren();
      inputElement.classList.remove('is-invalid');
      const feedsBody = document.createElement('div');
      feedsBody.classList.add('card', 'border-0');
      const feedsTitleDiv = document.createElement('div');
      const feedsTitle = document.createElement('h2');
      feedsTitle.textContent = 'Фиды';
      feedsTitleDiv.classList.add('card-body');
      feedsTitle.classList.add('card-title', 'h4');
      feedsTitleDiv.append(feedsTitle);
      const feedsUL = document.createElement('ul');
      feedsUL.classList.add('list-group', 'border-0', 'rounded-0');
      feedsBody.append(feedsTitleDiv, feedsUL);
      feedsContainer.append(feedsBody);
      value.forEach((element) => {
        const feedItem = document.createElement('li');
        feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
        const feedItemTitle = document.createElement('h3');
        feedItemTitle.classList.add('h6', 'm-0');
        feedItemTitle.textContent = 'I am feed title';
        const feedItemBody = document.createElement('p');
        feedItemBody.classList.add('m-0', 'small', 'text-black-50');
        feedItemBody.textContent = element;
        feedItem.append(feedItemTitle, feedItemBody);
        feedsUL.append(feedItem);
      });
      form.reset();
      inputElement.focus();
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = 'RSS успешно загружен';
      break;
    }
    case 'postsList': {
      const postsBody = document.createElement('div');
      postsBody.classList.add('card', 'border-0');
      const postsTitleDiv = document.createElement('div');
      const postsTitle = document.createElement('h2');
      postsTitle.textContent = 'Посты';
      postsTitleDiv.classList.add('card-body');
      postsTitle.classList.add('card-title', 'h4');
      postsTitleDiv.append(postsTitle);
      const postsUL = document.createElement('ul');
      postsUL.classList.add('list-group', 'border-0', 'rounded-0');
      postsBody.append(postsTitleDiv, postsUL);
      postsContainer.append(postsBody);
      value.forEach((element) => {
        const postItem = document.createElement('li');
        postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const postLink = document.createElement('a');
        postLink.setAttribute('href', element);
        postLink.classList.add('fw-bold');
        postLink.setAttribute('data-id', 207);
        postLink.setAttribute('target', '_blank');
        postLink.setAttribute('rel', 'noopener');
        postLink.setAttribute('rel', 'noreferrer');
        postLink.textContent = element;
        const postButton = document.createElement('button');
        postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        postButton.setAttribute('type', 'button');
        postButton.setAttribute('data-id', '208');
        postButton.setAttribute('data-bs-toggle', 'modal');
        postButton.setAttribute('data-bs-target', '#modal');
        postButton.textContent = 'Просмотр';
        postItem.append(postLink);
        postItem.append(postButton);
        postsUL.append(postItem);
      });
      break;
    }

    default:
      break;
  }
};
