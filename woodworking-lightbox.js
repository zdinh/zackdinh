(function () {
  const gallery = document.querySelector(".woodworking-gallery");
  const dialog = document.querySelector(".woodworking-lightbox");
  if (!gallery || !dialog) return;

  const lightboxImg = dialog.querySelector(".woodworking-lightbox-image");
  const lightboxContent = dialog.querySelector(".woodworking-lightbox-content");
  const closeBtn = dialog.querySelector(".woodworking-lightbox-close");

  const detailFields = lightboxContent
    ? [
        {
          source: ".woodworking-gallery-caption-title",
          target: ".woodworking-lightbox-title",
        },
        {
          source: ".woodworking-gallery-caption-text",
          target: ".woodworking-lightbox-subtitle",
        },
        {
          source: ".woodworking-gallery-caption-meta",
          target: ".woodworking-lightbox-meta",
        },
        {
          source: ".woodworking-gallery-caption-tags",
          target: ".woodworking-lightbox-tags",
        },
        {
          source: ".woodworking-gallery-caption-description",
          target: ".woodworking-lightbox-description",
        },
      ]
    : [];

  function setDetailText(targetSelector, text) {
    const target = lightboxContent.querySelector(targetSelector);
    if (!target) return;

    target.textContent = text;
    target.hidden = !text;
  }

  function populateDetails(caption) {
    if (!lightboxContent || !caption) return;

    detailFields.forEach(({ source, target }) => {
      const sourceEl = caption.querySelector(source);
      setDetailText(target, sourceEl?.textContent?.trim() || "");
    });
  }

  function clearDetails() {
    if (!lightboxContent) return;

    detailFields.forEach(({ target }) => {
      setDetailText(target, "");
    });
  }

  function openLightbox(img) {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;

    if (lightboxContent) {
      populateDetails(img.closest("figure")?.querySelector(".woodworking-gallery-caption"));
    }

    dialog.showModal();
  }

  gallery.querySelectorAll("img").forEach((img) => {
    if (img.closest("a")) return;

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
    clearDetails();
  });
})();
