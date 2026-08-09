const ALLOWED_LANGS = ['en', 'ru', 'hy'];

let currentLangData = null;

const prices = {
  document: 1,
  website: 2,
  subtitles: 3,
  certified: 5,
  interpretation: 10,
  other: 0
};

async function setLanguage(lang) {
  if (!ALLOWED_LANGS.includes(lang)) return;
  const res = await fetch(`../../data/${lang}.json`);
  if (!res.ok) return;
  const data = await res.json();

  document.getElementById('page-title').textContent = data.pageTitle;
  document.getElementById('page-description').textContent = data.pageDescription;
  document.getElementById('submit-button').textContent = data.submitButton;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (data[key]) el.textContent = data[key];
  });

  currentLangData = data;
  updateTotal();
}

function updateTotal() {
  const selects = document.querySelectorAll('select[name="service[]"]');
  let total = 0;
  selects.forEach(select => {
    total += prices[select.value] || 0;
  });

  const priceText = currentLangData?.totalPrice || 'Your total price is: $';
  document.getElementById('total-price').textContent = priceText + total;
}

let requestCounter = 1;

function addRequest() {
  const container = document.getElementById('requests-container');
  const block = document.querySelector('.request-block');
  const clone = block.cloneNode(true);
  const uid = ++requestCounter;

  clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

  const cloneSelect = clone.querySelector('select');
  const cloneTextarea = clone.querySelector('textarea');
  const selectId = `service-${uid}`;
  const textareaId = `description-${uid}`;
  cloneSelect.id = selectId;
  cloneTextarea.id = textareaId;

  clone.querySelector('label[data-i18n="labelService"]').setAttribute('for', selectId);
  clone.querySelector('label[data-i18n="labelDescription"]').setAttribute('for', textareaId);

  cloneTextarea.value = '';
  cloneSelect.selectedIndex = 0;
  cloneSelect.addEventListener('change', updateTotal);

  const btnContainer = clone.querySelector('.request-buttons');

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-btn';
  addBtn.textContent = '+';
  addBtn.setAttribute('aria-label', 'Add request');
  addBtn.addEventListener('click', addRequest);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '−';
  removeBtn.setAttribute('aria-label', 'Remove request');
  removeBtn.addEventListener('click', () => removeRequest(removeBtn));

  while (btnContainer.firstChild) btnContainer.removeChild(btnContainer.firstChild);
  btnContainer.appendChild(addBtn);
  btnContainer.appendChild(removeBtn);

  container.appendChild(clone);
  updateTotal();
}

function removeRequest(button) {
  button.closest('.request-block').remove();
  updateTotal();
}

function validateAndSubmit(e) {
  const descriptions = document.querySelectorAll('textarea[name="description[]"]');
  const hasContent = Array.from(descriptions).some(t => t.value.trim());
  if (!hasContent) {
    e.preventDefault();
    alert(currentLangData?.validationError || 'Please describe at least one request.');
  }
}

window.addEventListener('load', () => {
  setLanguage('en');

  document.querySelectorAll('.lang-icon[data-lang]').forEach(img => {
    img.addEventListener('click', () => setLanguage(img.dataset.lang));
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setLanguage(img.dataset.lang);
      }
    });
  });

  document.getElementById('request-form').addEventListener('submit', validateAndSubmit);

  document.querySelector('.request-buttons .add-btn').addEventListener('click', addRequest);

  document.querySelector('select[name="service[]"]').addEventListener('change', updateTotal);
});
