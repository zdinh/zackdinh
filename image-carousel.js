(function () {
  let lightboxState = null;

  function initLightboxNav(dialog) {
    if (!dialog || dialog.dataset.navInit === "true") return;

    dialog.dataset.navInit = "true";

    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "image-lightbox-control image-lightbox-control--prev";
    prevButton.setAttribute("aria-label", "Previous image");
    prevButton.innerHTML = "&#8249;";

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "image-lightbox-control image-lightbox-control--next";
    nextButton.setAttribute("aria-label", "Next image");
    nextButton.innerHTML = "&#8250;";

    prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!lightboxState) return;
      lightboxState.showSlide(lightboxState.getIndex() - 1);
    });

    nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!lightboxState) return;
      lightboxState.showSlide(lightboxState.getIndex() + 1);
    });

    dialog.append(prevButton, nextButton);

    dialog.addEventListener("keydown", (event) => {
      if (!lightboxState || lightboxState.slides.length < 2) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        lightboxState.showSlide(lightboxState.getIndex() - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        lightboxState.showSlide(lightboxState.getIndex() + 1);
      }
    });
  }

  document.querySelectorAll("[data-image-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".image-carousel-slide")];
    if (!slides.length) return;

    const page = carousel.closest("body");
    const dialog = page?.querySelector(".image-lightbox");
    const lightboxImg = dialog?.querySelector(".image-lightbox-image");
    const closeBtn = dialog?.querySelector(".image-lightbox-close");

    initLightboxNav(dialog);

    let index = slides.findIndex((slide) => !slide.hidden);
    if (index < 0) index = 0;

    function updateLightboxImage() {
      if (!lightboxImg) return;

      const slide = slides[index];
      lightboxImg.src = slide.currentSrc || slide.src;
      lightboxImg.alt = slide.alt;
    }

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== index;
      });

      if (dialog?.open) updateLightboxImage();
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

      const slideIndex = slides.indexOf(slide);
      if (slideIndex >= 0) showSlide(slideIndex);

      lightboxState = {
        slides,
        getIndex: () => index,
        showSlide,
      };

      updateLightboxImage();
      dialog.classList.toggle("image-lightbox--multiple", slides.length > 1);
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
      lightboxState = null;
      dialog.classList.remove("image-lightbox--multiple");
      lightboxImg.removeAttribute("src");
    });
  });
})();
