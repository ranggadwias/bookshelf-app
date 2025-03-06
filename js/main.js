const bookFormIsComplete = document.getElementById('bookFormIsComplete');
const bookFormSubmit = document.getElementById('bookFormSubmit');
const buttonText = bookFormSubmit.querySelector('span');

bookFormIsComplete.addEventListener("change", function () {
  if (bookFormIsComplete.checked) {
    buttonText.textContent = "Selesai dibaca";
  } else {
    buttonText.textContent = "Belum selesai dibaca";
  }
});