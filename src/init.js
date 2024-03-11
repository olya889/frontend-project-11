export default (elements, i18n) => {
  const {
    formTitle,
    lead,
    inputLabel,
    submitButton,
    exampleElement,
    readFullButton,
    modalCloseButton,
  } = elements;

  formTitle.textContent = i18n.t('requestSection.mainTitle');
  lead.textContent = i18n.t('requestSection.leadText');
  inputLabel.textContent = i18n.t('requestSection.inputLabel');
  submitButton.textContent = i18n.t('requestSection.addButtonName');
  exampleElement.textContent = i18n.t('requestSection.exampleText');
  readFullButton.textContent = i18n.t('modalSection.readFullButton');
  modalCloseButton.textContent = i18n.t('modalSection.closeButton');
};
