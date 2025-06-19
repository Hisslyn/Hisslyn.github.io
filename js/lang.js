async function setLanguage(lang) {
  const res = await fetch(`lang/${lang}.json`);
  const data = await res.json();

  document.getElementById("page-title").textContent = data.pageTitle;
  document.getElementById("page-description").textContent = data.pageDescription;
  document.getElementById("label-service").textContent = data.labelService;
  document.getElementById("label-description").textContent = data.labelDescription;
  document.getElementById("label-upload").textContent = data.labelUpload;
  document.getElementById("submit-button").textContent = data.submitButton;

  // Store current language for price label
  currentLangData = data;
  updateTotal();
}

let currentLangData = null;

const prices = {
  document: 1,
  website: 2,
  subtitles: 3,
  certified: 5,
  interpretation: 10,
  other: 0
};

function updateTotal() {
  const selects = document.querySelectorAll('select[name="service"]');
  let total = 0;
  selects.forEach(select => {
    total += prices[select.value] || 0;
  });

  const priceText = currentLangData?.totalPrice || "Your total price is: $";
  document.getElementById("total-price").textContent = priceText + total;
}

function addRequest(button) {
  const container = document.getElementById('requests-container');
  const block = document.querySelector('.request-block');
  const clone = block.cloneNode(true);

  // Reset values
  clone.querySelector('textarea').value = '';
  clone.querySelector('input[type="file"]').value = '';
  const select = clone.querySelector('select');
  select.selectedIndex = 0;
  select.addEventListener('change', updateTotal);

  const btnContainer = clone.querySelector('.request-buttons');
  btnContainer.innerHTML = `
    <button type="button" class="add-btn" onclick="addRequest(this)">+</button>
    <button type="button" class="remove-btn" onclick="removeRequest(this)">−</button>
  `;

  container.appendChild(clone);
  updateTotal();
}

function removeRequest(button) {
  const block = button.closest('.request-block');
  block.remove();
  updateTotal();
}

// Initial language
window.onload = () => {
  setLanguage('en');
  document.querySelector('select[name="service"]').addEventListener('change', updateTotal);
};
