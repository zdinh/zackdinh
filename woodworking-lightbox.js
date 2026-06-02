(function () {
  const gallery = document.querySelector(".woodworking-gallery");
  const dialog = document.querySelector(".woodworking-lightbox");
  if (!gallery || !dialog) return;

  const lightboxImg = dialog.querySelector(".woodworking-lightbox-image");
  const closeBtn = dialog.querySelector(".woodworking-lightbox-close");

  function openLightbox(img) {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    dialog.showModal();
  }

  gallery.querySelectorAll("img").forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", () => openLightbox(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    lightboxImg.removeAttribute("src");
  });
})();
