(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function renderWorks() {
    var grid = document.getElementById("worksGrid");
    if (!grid || !window.WORKS) return;

    window.WORKS.forEach(function (work, index) {
      var frame = work.frames[0];
      var figure = document.createElement("figure");
      figure.className = "work-tile";
      figure.setAttribute("data-reveal", "");
      figure.style.setProperty("--aspect", frame.w + " / " + frame.h);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "work-frame";
      button.setAttribute("data-work", work.key);
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute(
        "aria-label",
        "查看《" + work.titleZh + "》静帧"
      );

      var img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      img.src = work.dir + frame.thumb;

      var caption = document.createElement("figcaption");
      var h = document.createElement("h3");
      h.className = "work-title";
      h.textContent = work.titleZh;
      var role = document.createElement("p");
      role.className = "work-role";
      role.textContent = work.roleZh;
      var meta = document.createElement("p");
      meta.className = "work-meta";
      meta.textContent = work.meta;

      caption.appendChild(h);
      caption.appendChild(role);
      caption.appendChild(meta);
      button.appendChild(img);
      figure.appendChild(button);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });
  }

  function renderFramesStrip() {
    var scroller = document.getElementById("framesScroller");
    if (!scroller || !window.WORKS) return;

    window.WORKS.forEach(function (work) {
      var frame =
        work.frames.length > 1 ? work.frames[1] : work.frames[0];
      if (!frame) return;

      var slide = document.createElement("figure");
      slide.className = "frame-slide";
      slide.setAttribute("data-reveal", "");

      var button = document.createElement("button");
      button.type = "button";
      button.className = "work-frame";
      button.setAttribute("data-work", work.key);
      button.style.setProperty("--aspect", frame.w + " / " + frame.h);
      button.setAttribute(
        "aria-label",
        "查看《" + work.titleZh + "》完整静帧"
      );

      var img = document.createElement("img");
      img.src = work.dir + frame.thumb;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";

      var caption = document.createElement("figcaption");
      var title = document.createElement("p");
      title.className = "work-title";
      title.textContent = work.titleZh;
      var role = document.createElement("p");
      role.className = "work-role";
      role.textContent = work.roleZh;
      var meta = document.createElement("p");
      meta.className = "work-meta";
      meta.textContent = work.meta;
      caption.appendChild(title);
      caption.appendChild(role);
      caption.appendChild(meta);

      button.appendChild(img);
      slide.appendChild(button);
      slide.appendChild(caption);
      scroller.appendChild(slide);
    });

    var prev = document.getElementById("framesPrev");
    var next = document.getElementById("framesNext");
    function scrollBy(direction) {
      var distance = Math.max(360, Math.round(scroller.clientWidth * 0.78));
      scroller.scrollBy({
        left: direction * distance,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }
    if (prev) prev.addEventListener("click", function () { scrollBy(-1); });
    if (next) next.addEventListener("click", function () { scrollBy(1); });
    scroller.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollBy(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollBy(1);
      }
    });

    // Mouse drag to browse; suppress the click that follows a real drag.
    var pointerDown = false;
    var startX = 0;
    var startScroll = 0;
    var dragMoved = false;

    scroller.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse") return;
      pointerDown = true;
      dragMoved = false;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
      scroller.style.scrollBehavior = "auto";
    });

    document.addEventListener("pointermove", function (event) {
      if (!pointerDown) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 5) dragMoved = true;
      scroller.scrollLeft = startScroll - delta;
    });

    function endDrag() {
      pointerDown = false;
      scroller.style.scrollBehavior = "";
    }

    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    scroller.addEventListener(
      "click",
      function (event) {
        if (dragMoved) {
          dragMoved = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );
  }

  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length || reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el, index) {
      el.style.transitionDelay = (index % 6) * 40 + "ms";
      observer.observe(el);
    });

    var hero = document.querySelector(".hero-copy");
    if (hero) {
      requestAnimationFrame(function () {
        hero.classList.add("in-view");
      });
    }
  }

  var lightbox;
  var lightboxState = {
    index: 0,
    work: null
  };

  function openLightbox(key) {
    var work = window.WORKS.find(function (w) {
      return w.key === key;
    });
    if (!work) return;
    lightboxState.work = work;
    lightboxState.index = 0;
    updateLightbox();
    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }
  }

  function closeLightbox() {
    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
  }

  function updateLightbox() {
    var work = lightboxState.work;
    if (!work) return;
    var frame = work.frames[lightboxState.index];

    document.getElementById("lightboxTitle").textContent =
      work.titleZh + " · " + work.roleZh;

    var image = document.getElementById("lightboxImage");
    image.src = work.dir + frame.full;
    image.alt = "《" + work.titleZh + "》静帧 " + (lightboxState.index + 1);

    document.getElementById("lightboxCaption").textContent =
      "静帧 " + (lightboxState.index + 1) + " / " + work.frames.length;

    var thumbWrap = document.getElementById("lightboxThumbs");
    thumbWrap.innerHTML = "";

    work.frames.forEach(function (f, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "查看第 " + (i + 1) + " 张静帧");
      if (i === lightboxState.index) btn.classList.add("is-active");

      var thumb = document.createElement("img");
      thumb.src = work.dir + f.thumb;
      thumb.alt = "";
      thumb.loading = "lazy";
      btn.appendChild(thumb);
      btn.addEventListener("click", function () {
        lightboxState.index = i;
        updateLightbox();
      });
      thumbWrap.appendChild(btn);
    });
  }

  function stepLightbox(delta) {
    var work = lightboxState.work;
    if (!work) return;
    var total = work.frames.length;
    lightboxState.index = (lightboxState.index + delta + total) % total;
    updateLightbox();
  }

  function setupLightbox() {
    lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    document.addEventListener("click", function (event) {
      var opener = event.target.closest("[data-work]");
      if (opener) {
        openLightbox(opener.getAttribute("data-work"));
      }
    });

    document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    document.querySelector(".nav-prev").addEventListener("click", function () {
      stepLightbox(-1);
    });
    document.querySelector(".nav-next").addEventListener("click", function () {
      stepLightbox(1);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    var stage = document.querySelector(".lightbox-stage");
    var swipeX = 0;
    var swipeY = 0;
    var swipeStart = false;

    stage.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "touch") return;
      swipeStart = true;
      swipeX = event.clientX;
      swipeY = event.clientY;
    });

    stage.addEventListener("pointerup", function (event) {
      if (!swipeStart || event.pointerType !== "touch") return;
      swipeStart = false;
      var dx = event.clientX - swipeX;
      var dy = event.clientY - swipeY;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        stepLightbox(dx < 0 ? 1 : -1);
      }
    });

    stage.addEventListener("pointercancel", function () {
      swipeStart = false;
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.open) return;
      if (event.key === "ArrowLeft") {
        stepLightbox(-1);
      } else if (event.key === "ArrowRight") {
        stepLightbox(1);
      }
    });

    lightbox.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeLightbox();
    });
  }

  function renderContact() {
    var wrap = document.getElementById("contactChannels");
    if (!wrap || !window.SITE) return;
    wrap.innerHTML = "";

    var channels = [
      { label: "邮箱", value: window.SITE.email, href: window.SITE.email ? "mailto:" + window.SITE.email : "", external: false },
      { label: "手机", value: window.SITE.phone, href: window.SITE.phone ? "tel:+86" + window.SITE.phone : "", external: false },
      { label: "小红书 / 抖音 / IG", value: window.SITE.social, href: "", external: false },
      { label: "简历", value: "查看 2026 版", href: window.SITE.resume || "", external: true }
    ];

    channels.forEach(function (channel) {
      if (!channel.value) return;
      var el = document.createElement("a");
      el.className = "contact-channel";
      if (channel.href) el.href = channel.href;
      if (channel.external) el.target = "_blank";
      el.rel = "noopener";
      var label = document.createElement("span");
      label.textContent = channel.label;
      var value = document.createElement("strong");
      value.textContent = channel.value;
      el.appendChild(label);
      el.appendChild(value);
      wrap.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderWorks();
    renderFramesStrip();
    setupLightbox();
    renderContact();
    if (!reduceMotion) {
      var heroVideo = document.querySelector(".hero-video");
      if (heroVideo) {
        var play = heroVideo.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {
            // 浏览器阻止自动播放时静默退回海报画面。
          });
        }
      }
    }
    requestAnimationFrame(setupReveal);
  });
})();
