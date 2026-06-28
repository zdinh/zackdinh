(function () {
  const gallery = document.querySelector(".woodworking-gallery");
  const dialog = document.querySelector(".woodworking-lightbox");
  if (!gallery || !dialog) return;

  const lightboxCarousel = dialog.querySelector(".woodworking-lightbox-carousel");
  const lightboxImg = dialog.querySelector(".woodworking-lightbox-image");
  const lightboxContent = dialog.querySelector(".woodworking-lightbox-content");
  const closeBtn = dialog.querySelector(".woodworking-lightbox-close");
  const zoomDialog = document.querySelector(".image-lightbox");
  const zoomImg = zoomDialog?.querySelector(".image-lightbox-image");
  const zoomCloseBtn = zoomDialog?.querySelector(".image-lightbox-close");

  const detailFields = lightboxContent
    ? [
        {
          source: ".woodworking-gallery-caption-title",
          target: ".woodworking-lightbox-title",
          useHtml: false,
        },
        {
          source: ".woodworking-gallery-caption-text",
          target: ".woodworking-lightbox-subtitle",
          useHtml: false,
        },
        {
          source: ".woodworking-gallery-caption-meta",
          target: ".woodworking-lightbox-meta",
          useHtml: false,
        },
        {
          source: ".woodworking-gallery-caption-tags",
          target: ".woodworking-lightbox-tags",
          useHtml: false,
        },
        {
          source: ".woodworking-gallery-caption-description",
          target: ".woodworking-lightbox-description",
          useHtml: true,
        },
      ]
    : [];

  let slides = [];
  let slideIndex = 0;
  let currentProjectId = null;
  let imagePrevButton = null;
  let imageNextButton = null;
  let projectPrevButton = null;
  let projectNextButton = null;

  const hidePopupSubtitleIds = new Set(["wooden-purse", "coffee-table"]);

  function setDetailContent(targetSelector, content, useHtml) {
    const target = lightboxContent.querySelector(targetSelector);
    if (!target) return;

    if (useHtml) {
      target.innerHTML = content;
    } else {
      target.textContent = content;
    }

    target.hidden = !content;
  }

  const projects = [...gallery.querySelectorAll(".woodworking-gallery-item[id]")];

  function populateDetails(caption) {
    if (!lightboxContent || !caption) return;

    const figure = caption.closest(".woodworking-gallery-item");
    const hideSubtitle = figure && hidePopupSubtitleIds.has(figure.id);

    detailFields.forEach(({ source, target, useHtml }) => {
      if (target === ".woodworking-lightbox-subtitle" && hideSubtitle) {
        setDetailContent(target, "", useHtml);
        return;
      }

      const sourceEl = caption.querySelector(source);
      const content = useHtml
        ? sourceEl?.innerHTML.trim() || ""
        : sourceEl?.textContent?.trim() || "";
      setDetailContent(target, content, useHtml);
    });
  }

  function clearDetails() {
    if (!lightboxContent) return;

    detailFields.forEach(({ target, useHtml }) => {
      setDetailContent(target, "", useHtml);
    });
  }

  function getSlidesFromFigure(figure) {
    const thumb = figure.querySelector(".woodworking-gallery-trigger img");
    const template = figure.querySelector(".woodworking-gallery-images");
    const extras = template ? [...template.content.querySelectorAll("img")] : [];

    if (thumb) return [thumb, ...extras];
    return extras;
  }

  function setImageOrientation(img, source) {
    const reference = source?.naturalWidth ? source : img;
    const isPortrait =
      reference.naturalWidth && reference.naturalHeight
        ? reference.naturalHeight > reference.naturalWidth
        : true;

    img.classList.toggle("woodworking-lightbox-image--portrait", isPortrait);
    img.classList.toggle("woodworking-lightbox-image--landscape", !isPortrait);
  }

  function updateLightboxImage() {
    const slide = slides[slideIndex];
    if (!slide) return;

    setImageOrientation(lightboxImg, slide);
    lightboxImg.src = slide.currentSrc || slide.src;
    lightboxImg.alt = slide.alt;

    if (!slide.naturalWidth) {
      lightboxImg.addEventListener(
        "load",
        () => setImageOrientation(lightboxImg, lightboxImg),
        { once: true }
      );
    }

    if (zoomDialog?.open) updateZoomImage();
  }

  function updateZoomImage() {
    const slide = slides[slideIndex];
    if (!slide || !zoomImg) return;

    zoomImg.src = slide.currentSrc || slide.src;
    zoomImg.alt = slide.alt;
  }

  function openZoomLightbox() {
    if (!zoomDialog || !lightboxImg.src || !slides.length) return;

    updateZoomImage();
    zoomDialog.classList.toggle("image-lightbox--multiple", slides.length > 1);
    zoomDialog.showModal();
  }

  function initZoomLightbox() {
    if (!zoomDialog || !zoomImg || !lightboxImg || zoomDialog.dataset.zoomInit === "true") return;

    zoomDialog.dataset.zoomInit = "true";

    const zoomPrevButton = document.createElement("button");
    zoomPrevButton.type = "button";
    zoomPrevButton.className = "image-lightbox-control image-lightbox-control--prev";
    zoomPrevButton.setAttribute("aria-label", "Previous image");
    zoomPrevButton.innerHTML = "&#8249;";

    const zoomNextButton = document.createElement("button");
    zoomNextButton.type = "button";
    zoomNextButton.className = "image-lightbox-control image-lightbox-control--next";
    zoomNextButton.setAttribute("aria-label", "Next image");
    zoomNextButton.innerHTML = "&#8250;";

    zoomPrevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(slideIndex - 1);
    });

    zoomNextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(slideIndex + 1);
    });

    zoomDialog.append(zoomPrevButton, zoomNextButton);

    lightboxImg.addEventListener("click", () => {
      if (suppressImageClick) {
        suppressImageClick = false;
        return;
      }

      openZoomLightbox();
    });

    zoomCloseBtn?.addEventListener("click", () => zoomDialog.close());

    zoomDialog.addEventListener("click", (event) => {
      if (event.target === zoomDialog) zoomDialog.close();
    });

    zoomDialog.addEventListener("keydown", (event) => {
      if (!zoomDialog.open || slides.length < 2) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(slideIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(slideIndex + 1);
      }
    });

    zoomDialog.addEventListener("close", () => {
      zoomDialog.classList.remove("image-lightbox--multiple");
      zoomImg.removeAttribute("src");
    });
  }

  function showSlide(nextIndex) {
    if (!slides.length) return;

    slideIndex = (nextIndex + slides.length) % slides.length;
    updateLightboxImage();
  }

  let suppressImageClick = false;

  function bindHorizontalSwipe(element, onPrev, onNext) {
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    element.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;

        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    element.addEventListener(
      "touchend",
      (event) => {
        if (!tracking) return;

        tracking = false;
        if (slides.length < 2) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const threshold = 48;

        if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) return;

        suppressImageClick = true;
        if (deltaX < 0) onNext();
        else onPrev();
      },
      { passive: true }
    );

    element.addEventListener(
      "touchcancel",
      () => {
        tracking = false;
      },
      { passive: true }
    );
  }

  function initImageSwipe() {
    bindHorizontalSwipe(
      lightboxCarousel,
      () => showSlide(slideIndex - 1),
      () => showSlide(slideIndex + 1)
    );

    bindHorizontalSwipe(
      zoomDialog,
      () => showSlide(slideIndex - 1),
      () => showSlide(slideIndex + 1)
    );
  }

  function initCarouselControls() {
    if (!lightboxCarousel || dialog.dataset.carouselInit === "true") return;

    dialog.dataset.carouselInit = "true";

    imagePrevButton = document.createElement("button");
    imagePrevButton.type = "button";
    imagePrevButton.className = "image-carousel-control image-carousel-control--prev";
    imagePrevButton.setAttribute("aria-label", "Previous image");
    imagePrevButton.innerHTML = "&#8249;";

    imageNextButton = document.createElement("button");
    imageNextButton.type = "button";
    imageNextButton.className = "image-carousel-control image-carousel-control--next";
    imageNextButton.setAttribute("aria-label", "Next image");
    imageNextButton.innerHTML = "&#8250;";

    imagePrevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(slideIndex - 1);
    });

    imageNextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(slideIndex + 1);
    });

    lightboxCarousel.append(imagePrevButton, imageNextButton);
  }

  function initProjectNav() {
    if (projects.length < 2 || dialog.dataset.projectNavInit === "true") return;

    dialog.dataset.projectNavInit = "true";

    projectPrevButton = document.createElement("button");
    projectPrevButton.type = "button";
    projectPrevButton.className =
      "woodworking-lightbox-project-control woodworking-lightbox-project-control--prev";
    projectPrevButton.setAttribute("aria-label", "Previous project");
    projectPrevButton.innerHTML = "&#8249;";

    projectNextButton = document.createElement("button");
    projectNextButton.type = "button";
    projectNextButton.className =
      "woodworking-lightbox-project-control woodworking-lightbox-project-control--next";
    projectNextButton.setAttribute("aria-label", "Next project");
    projectNextButton.innerHTML = "&#8250;";

    projectPrevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showAdjacentProject(-1);
    });

    projectNextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showAdjacentProject(1);
    });

    dialog.append(projectPrevButton, projectNextButton);
    dialog.addEventListener("scroll", updateProjectNavPosition);
  }

  const compactLightboxQuery = window.matchMedia(
    "(max-width: 820px), (max-height: 500px) and (orientation: landscape)"
  );

  function updateProjectNavPosition() {
    if (!lightboxCarousel || !projectPrevButton || !projectNextButton || !dialog.open) return;

    if (compactLightboxQuery.matches) {
      resetProjectNavPosition();
      return;
    }

    const { top, height } = lightboxCarousel.getBoundingClientRect();
    const centerY = top + height / 2;
    projectPrevButton.style.top = `${centerY}px`;
    projectNextButton.style.top = `${centerY}px`;
  }

  function resetProjectNavPosition() {
    if (projectPrevButton) projectPrevButton.style.top = "";
    if (projectNextButton) projectNextButton.style.top = "";
  }

  function getProjectIndex(projectId) {
    return projects.findIndex((figure) => figure.id === projectId);
  }

  function showAdjacentProject(direction) {
    if (!currentProjectId || projects.length < 2) return;

    const index = getProjectIndex(currentProjectId);
    if (index < 0) return;

    const nextFigure = projects[(index + direction + projects.length) % projects.length];
    openProject(nextFigure);
  }

  function lockScroll() {
    document.body.classList.add("woodworking-lightbox-scroll-lock");
  }

  function unlockScroll() {
    document.body.classList.remove("woodworking-lightbox-scroll-lock");
  }

  function setHash(projectId) {
    const nextUrl = projectId
      ? `${window.location.pathname}${window.location.search}#${projectId}`
      : `${window.location.pathname}${window.location.search}`;

    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      history.replaceState(null, "", nextUrl);
    }
  }

  function openProject(figure, { updateHash = true } = {}) {
    const projectId = figure.id;
    if (!projectId) return;

    if (zoomDialog?.open) zoomDialog.close();

    slides = getSlidesFromFigure(figure);
    if (!slides.length) return;

    slideIndex = 0;
    showSlide(0);
    populateDetails(figure.querySelector(".woodworking-gallery-caption"));

    initCarouselControls();
    initProjectNav();
    lightboxCarousel?.classList.toggle("image-carousel--multiple", slides.length > 1);
    currentProjectId = projectId;

    if (!dialog.open) {
      dialog.showModal();
      lockScroll();
    }
    if (updateHash) setHash(projectId);

    requestAnimationFrame(() => {
      requestAnimationFrame(updateProjectNavPosition);
    });
  }

  function openSimpleLightbox(img) {
    slides = [img];
    slideIndex = 0;
    showSlide(0);
    populateDetails(img.closest("figure")?.querySelector(".woodworking-gallery-caption"));

    lightboxCarousel?.classList.remove("image-carousel--multiple");
    currentProjectId = null;
    dialog.showModal();
    lockScroll();
  }

  function closeLightbox() {
    dialog.close();
  }

  gallery.querySelectorAll(".woodworking-gallery-item[id]").forEach((figure) => {
    const trigger = figure.querySelector(".woodworking-gallery-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => openProject(figure));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProject(figure);
      }
    });
  });

  gallery.querySelectorAll(".woodworking-gallery-item:not([id]) img").forEach((img) => {
    if (img.closest("a, .woodworking-gallery-trigger")) return;

    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", () => openSimpleLightbox(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSimpleLightbox(img);
      }
    });
  });

  closeBtn.addEventListener("click", () => closeLightbox());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });

  dialog.addEventListener("keydown", (event) => {
    if (!dialog.open || zoomDialog?.open) return;

    if (event.key === "ArrowLeft" && slides.length > 1) {
      event.preventDefault();
      showSlide(slideIndex - 1);
      return;
    }

    if (event.key === "ArrowRight" && slides.length > 1) {
      event.preventDefault();
      showSlide(slideIndex + 1);
      return;
    }

    if (event.key === "ArrowLeft" && currentProjectId && projects.length > 1) {
      event.preventDefault();
      showAdjacentProject(-1);
      return;
    }

    if (event.key === "ArrowRight" && currentProjectId && projects.length > 1) {
      event.preventDefault();
      showAdjacentProject(1);
    }
  });

  window.addEventListener("resize", updateProjectNavPosition);

  dialog.addEventListener("close", () => {
    unlockScroll();
    if (zoomDialog?.open) zoomDialog.close();
    if (currentProjectId) setHash(null);
    currentProjectId = null;
    slides = [];
    slideIndex = 0;
    lightboxImg.removeAttribute("src");
    lightboxImg.classList.remove(
      "woodworking-lightbox-image--portrait",
      "woodworking-lightbox-image--landscape"
    );
    lightboxCarousel?.classList.remove("image-carousel--multiple");
    resetProjectNavPosition();
    clearDetails();
  });

  function openFromHash() {
    const projectId = window.location.hash.slice(1);
    if (!projectId) return;

    const figure = document.getElementById(projectId);
    if (!figure?.classList.contains("woodworking-gallery-item")) return;

    openProject(figure, { updateHash: false });
  }

  window.addEventListener("hashchange", () => {
    const projectId = window.location.hash.slice(1);

    if (!projectId) {
      if (dialog.open) closeLightbox();
      return;
    }

    if (projectId === currentProjectId && dialog.open) return;

    const figure = document.getElementById(projectId);
    if (figure?.classList.contains("woodworking-gallery-item")) {
      openProject(figure, { updateHash: false });
    }
  });

  openFromHash();
  initZoomLightbox();
  initImageSwipe();
})();
