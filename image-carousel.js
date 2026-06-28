(function () {
  document.querySelectorAll("[data-image-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".image-carousel-slide")];
    if (!slides.length) return;

    const page = carousel.closest("body");
    const dialog = page?.querySelector(".image-lightbox");
    const lightboxImg = dialog?.querySelector(".image-lightbox-image");
    const closeBtn = dialog?.querySelector(".image-lightbox-close");

    let index = slides.findIndex((slide) => !slide.hidden);
    if (index < 0) index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== index;
      });
    }

    showSlide(index);

    if (slides.length > 1) {
      carousel.classList.add("image-carousel--multiple");

      const prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.className = "image-carousel-control image-carousel-control--prev";
      prevButton.setAttribute("aria-label", "Previous image");
      prevButton.innerHTML = "&#8249;";

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "image-carousel-control image-carousel-control--next";
      nextButton.setAttribute("aria-label", "Next image");
      nextButton.innerHTML = "&#8250;";

      prevButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showSlide(index - 1);
      });

      nextButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showSlide(index + 1);
      });

      carousel.append(prevButton, nextButton);
    }

    function openLightbox(slide) {
      if (!dialog || !lightboxImg) return;

      lightboxImg.src = slide.currentSrc || slide.src;
      lightboxImg.alt = slide.alt;
      dialog.showModal();
    }

    slides.forEach((slide) => {
      slide.addEventListener("click", () => openLightbox(slide));
    });

    if (!dialog || !closeBtn) return;

    closeBtn.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      lightboxImg.removeAttribute("src");
    });
  });
})();
