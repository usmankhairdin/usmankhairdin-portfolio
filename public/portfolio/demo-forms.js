/**
 * Safety boundary for archived portfolio showcases.
 *
 * Every form below /public/portfolio is presentation-only. This guard is
 * intentionally loaded before project scripts so legacy handlers cannot send
 * visitor data, while the original fields and controls remain visually intact.
 */
(function () {
  'use strict';

  if (window.portfolioDemoForms?.displayOnly) return;

  const DISPLAY_ONLY_TITLE = 'Display-only form — submission is disabled';

  function markDisplayOnly(form) {
    if (!(form instanceof HTMLFormElement)) return;

    form.removeAttribute('action');
    form.removeAttribute('method');
    form.removeAttribute('enctype');
    form.removeAttribute('target');
    form.removeAttribute('onsubmit');
    form.noValidate = true;
    form.dataset.displayOnly = 'true';

    form.querySelectorAll('button[type="submit"], input[type="submit"], input[type="image"]').forEach((control) => {
      control.setAttribute('aria-disabled', 'true');
      control.setAttribute('title', DISPLAY_ONLY_TITLE);
      if (!control.getAttribute('aria-label') && !control.textContent.trim() && !control.value) {
        control.setAttribute('aria-label', 'Display-only form action');
      }
    });
  }

  function markForms(root) {
    if (root instanceof HTMLFormElement) markDisplayOnly(root);
    if (root && root.querySelectorAll) root.querySelectorAll('form').forEach(markDisplayOnly);
  }

  function blockSubmission(event) {
    const form = event.target instanceof HTMLFormElement
      ? event.target
      : event.target.closest && event.target.closest('form');

    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    markDisplayOnly(form);
  }

  document.addEventListener('submit', blockSubmission, true);
  document.addEventListener('formdata', blockSubmission, true);
  document.addEventListener('click', (event) => {
    const control = event.target.closest && event.target.closest('button, input');
    if (!control || !control.form) return;

    const type = (control.getAttribute('type') || (control.tagName === 'BUTTON' ? 'submit' : '')).toLowerCase();
    if (type === 'submit' || type === 'image') blockSubmission(event);
  }, true);

  HTMLFormElement.prototype.submit = function () {
    markDisplayOnly(this);
  };
  if (HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function () {
      markDisplayOnly(this);
    };
  }

  function initialise() {
    markForms(document);
    new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(markForms));
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }

  window.portfolioDemoForms = Object.freeze({ displayOnly: true });
}());
