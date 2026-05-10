/**
 * LinkedIn CSS selectors — isolated here for easy maintenance when LinkedIn changes its UI.
 * Last verified: 2026-05-09
 *
 * When selectors break, update ONLY this file.
 */
export const SELECTORS = {
  // ─── Login ───────────────────────────────────────────────────────────────
  LOGIN_EMAIL: '#username',
  LOGIN_PASSWORD: '#password',
  LOGIN_SUBMIT: 'button[type="submit"]',

  // ─── Jobs search list (left panel) ───────────────────────────────────────
  JOBS_LIST_CONTAINER: '.scaffold-layout__list-container',
  JOBS_LIST_SCROLL: '.jobs-search-results-list',
  JOB_CARD: '.job-card-container',
  JOB_CARD_LINK: 'a.job-card-list__title--link',
  JOB_CARD_TITLE: '.job-card-list__title--link',
  JOB_CARD_COMPANY: '.job-card-container__primary-description',
  JOB_CARD_LOCATION: '.job-card-container__metadata-item',

  // ─── Job detail panel (right side) ───────────────────────────────────────
  JOB_DETAIL_TITLE: '.job-details-jobs-unified-top-card__job-title',
  JOB_DETAIL_COMPANY: '.job-details-jobs-unified-top-card__company-name',
  JOB_DETAIL_LOCATION: '.job-details-jobs-unified-top-card__bullet',
  JOB_DETAIL_DESCRIPTION: '.jobs-description__content',
  JOB_DETAIL_DESCRIPTION_TEXT: '.jobs-description-content__text',
  JOB_DETAIL_EASY_APPLY_BTN: 'button.jobs-apply-button',
  JOB_DETAIL_POSTED_TIME: '.jobs-unified-top-card__posted-date',
  JOB_DETAIL_POSTED_TIME_ALT: '.tvm__text--low-emphasis',

  // ─── Pagination ───────────────────────────────────────────────────────────
  NO_RESULTS: '.jobs-search-no-results-banner',
  PAGINATION_NEXT: 'button[aria-label="View next page"]',
} as const;
