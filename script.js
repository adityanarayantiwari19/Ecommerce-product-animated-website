const canvas = document.getElementById("watchCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress span");
const panels = [...document.querySelectorAll(".story-panel")];
const story = document.querySelector(".story");

const crystalCanvas = document.getElementById("crystalCanvas");
const crystalContext = crystalCanvas.getContext("2d");
let pointerX = 0.5;
let pointerY = 0.5;
let crystalWidth = 0;
let crystalHeight = 0;

const frameCount = 235;
const images = new Array(frameCount);
let activeBeat = "";
let firstFrameReady = false;

function frameUrl(index) {
  return `1/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  drawFrame(currentFrame());
}

function resizeCrystal() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  crystalWidth = Math.round(window.innerWidth * dpr * 1.16);
  crystalHeight = Math.round(window.innerHeight * dpr * 1.16);
  crystalCanvas.width = crystalWidth;
  crystalCanvas.height = crystalHeight;
}

function renderCrystal(time) {
  const ctx = crystalContext;
  ctx.clearRect(0, 0, crystalWidth, crystalHeight);

  const t = time * 0.00012;
  const centerX = crystalWidth * (0.46 + pointerX * 0.08);
  const centerY = crystalHeight * (0.43 + pointerY * 0.06);

  ctx.globalCompositeOperation = "screen";
  for (let band = 0; band < 9; band++) {
    const phase = t * (0.8 + band * 0.06) + band * 0.72;
    const baseY = crystalHeight * (0.12 + band * 0.095);
    ctx.beginPath();
    for (let x = -50; x <= crystalWidth + 50; x += 18) {
      const y = baseY
        + Math.sin(x * 0.0048 + phase * 2.1) * (24 + band * 2)
        + Math.cos(x * 0.0092 - phase * 1.4) * 12
        + Math.sin((x - centerX) * 0.006 + phase) * 9;
      if (x === -50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const gradient = ctx.createLinearGradient(0, 0, crystalWidth, 0);
    gradient.addColorStop(0, "rgba(84,88,94,0)");
    gradient.addColorStop(.24, "rgba(206,214,222,.10)");
    gradient.addColorStop(.48, "rgba(112,118,126,.28)");
    gradient.addColorStop(.72, "rgba(226,232,238,.12)");
    gradient.addColorStop(1, "rgba(74,78,84,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 28 + band * 3;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, baseY + 18);
    ctx.lineTo(crystalWidth, baseY - 18);
    ctx.strokeStyle = `rgba(232,238,244,${0.018 + band * 0.002})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  for (let i = 0; i < 16; i++) {
    const orbit = t * (18 + i * 1.7);
    const angle = i * 2.399 + orbit;
    const radiusX = crystalWidth * (0.08 + (i % 5) * 0.045);
    const radiusY = crystalHeight * (0.06 + (i % 4) * 0.045);
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle * 0.83) * radiusY;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 38 + i * 2);
    glow.addColorStop(0, "rgba(222,229,236,.13)");
    glow.addColorStop(.42, "rgba(128,135,144,.055)");
    glow.addColorStop(1, "rgba(128,135,144,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 70, y - 70, 140, 140);
  }

  requestAnimationFrame(renderCrystal);
}

function currentFrame() {
  const start = story.offsetTop;
  const distance = story.offsetHeight - window.innerHeight;
  const progressValue = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
  const sequenceProgress = progressValue;
  return Math.max(0, Math.min(frameCount - 1, Math.round(sequenceProgress * (frameCount - 1))));
}

function drawFrame(index) {
  const image = images[index];
  if (!image?.complete) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const portrait = window.innerHeight > window.innerWidth;
  const scale = portrait
    ? Math.min(canvas.width / image.width, canvas.height / image.height) * 1.34
    : Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

function updateStory() {
  const rect = story.getBoundingClientRect();
  const distance = story.offsetHeight - window.innerHeight;
  const progressValue = Math.max(0, Math.min(1, -rect.top / distance));
  nav.classList.toggle("visible", window.scrollY > 24);
  progress.style.height = `${progressValue * 72}px`;

  let beat = "hero";
  if (progressValue >= 0.86) beat = "final";
  else if (progressValue >= 0.64) beat = "craft";
  else if (progressValue >= 0.40) beat = "chronograph";
  else if (progressValue >= 0.16) beat = "engineering";

  if (beat !== activeBeat) {
    activeBeat = beat;
    panels.forEach(panel => {
      panel.classList.toggle("active", panel.dataset.beat === beat);
    });
  }

  drawFrame(currentFrame());
}

for (let i = 1; i <= frameCount; i++) {
  const image = new Image();
  image.src = frameUrl(i);
  image.onload = () => {
    if (i === 1) {
      firstFrameReady = true;
      resizeCanvas();
    }
  };
  images[i - 1] = image;
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateStory();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", resizeCrystal);
window.addEventListener("pointermove", event => {
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
}, { passive: true });

resizeCanvas();
resizeCrystal();
updateStory();
requestAnimationFrame(renderCrystal);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.16 });
document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

const drawer = document.querySelector(".bag-drawer");
const overlay = document.querySelector(".overlay");
const bagCount = document.querySelector(".bag-count");
const bagProduct = document.querySelector(".bag-product");
const bagEmpty = document.querySelector(".bag-empty");
const checkoutButton = document.querySelector(".checkout-button");
let bagAdded = false;

function openDrawer() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("visible");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
}

document.querySelectorAll("[data-open-bag]").forEach(button => button.addEventListener("click", openDrawer));
document.querySelectorAll("[data-close-drawer]").forEach(button => button.addEventListener("click", closeDrawer));
overlay.addEventListener("click", closeDrawer);

document.querySelectorAll("[data-add-to-bag]").forEach(button => {
  button.addEventListener("click", () => {
    bagAdded = true;
    bagCount.textContent = "1";
    bagCount.classList.add("visible");
    bagProduct.classList.add("visible");
    bagEmpty.classList.add("hidden");
    checkoutButton.disabled = false;
    button.querySelector("span").textContent = "Added to private bag";
    openDrawer();
  });
});

function openModal(modal) {
  closeDrawer();
  if (!modal.open) modal.showModal();
}

document.querySelectorAll("[data-open-login]").forEach(button => {
  button.addEventListener("click", () => openModal(document.querySelector(".account-modal")));
});
document.querySelectorAll("[data-open-checkout]").forEach(button => {
  button.addEventListener("click", () => openModal(document.querySelector(".checkout-modal")));
});
document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    const rect = modal.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) modal.close();
  });
});

document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.querySelector("span").textContent = "Account connected";
  setTimeout(() => event.currentTarget.closest("dialog").close(), 700);
});

document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.querySelector("span").textContent = "Request confirmed";
  button.disabled = true;
});

const animatedControls = document.querySelectorAll(
  ".liquid-button, .secondary-button, .primary-cta, .nav-buy, .icon-button, .drawer-close, .modal-close, .modal-link"
);

animatedControls.forEach(control => {
  control.addEventListener("pointermove", event => {
    const rect = control.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    control.style.setProperty("--metal-x", `${Math.max(0, Math.min(100, x))}%`);
  });

  control.addEventListener("pointerleave", () => {
    control.style.setProperty("--metal-x", "30%");
  });

  control.addEventListener("pointerdown", event => {
    const rect = control.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "metal-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    control.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

const globalCrystalCanvas = document.getElementById("globalCrystalCanvas");
const globalCrystalContext = globalCrystalCanvas.getContext("2d");
let globalCrystalWidth = 0;
let globalCrystalHeight = 0;
let globalPointerX = 0.5;
let globalPointerY = 0.5;

function resizeGlobalCrystal() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  globalCrystalWidth = Math.round(window.innerWidth * dpr * 1.24);
  globalCrystalHeight = Math.round(window.innerHeight * dpr * 1.24);
  globalCrystalCanvas.width = globalCrystalWidth;
  globalCrystalCanvas.height = globalCrystalHeight;
}

function renderGlobalCrystal(time) {
  if (!globalCrystalWidth || !globalCrystalHeight) return;
  const ctx = globalCrystalContext;
  ctx.clearRect(0, 0, globalCrystalWidth, globalCrystalHeight);
  const t = time * 0.00008;
  const centerX = globalCrystalWidth * (0.32 + globalPointerX * 0.36);
  const centerY = globalCrystalHeight * (0.42 + globalPointerY * 0.12);

  ctx.globalCompositeOperation = "screen";

  for (let band = 0; band < 13; band++) {
    const phase = t * (0.7 + band * 0.035) + band * 0.64;
    const baseY = globalCrystalHeight * (0.05 + band * 0.075);
    ctx.beginPath();
    for (let x = -80; x <= globalCrystalWidth + 80; x += 22) {
      const y = baseY
        + Math.sin(x * 0.0034 + phase * 1.9) * (30 + band * 2)
        + Math.cos(x * 0.0072 - phase * 1.15) * 16
        + Math.sin((x - centerX) * 0.0048 + phase) * 12;
      if (x === -80) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const gradient = ctx.createLinearGradient(0, 0, globalCrystalWidth, 0);
    gradient.addColorStop(0, "rgba(72,76,82,0)");
    gradient.addColorStop(.22, "rgba(201,208,216,.095)");
    gradient.addColorStop(.48, "rgba(116,122,130,.18)");
    gradient.addColorStop(.68, "rgba(229,234,239,.10)");
    gradient.addColorStop(1, "rgba(70,74,80,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 34 + band * 4;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, baseY + 24);
    ctx.lineTo(globalCrystalWidth, baseY - 24);
    ctx.strokeStyle = `rgba(232,238,244,${0.012 + band * 0.0014})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  for (let i = 0; i < 24; i++) {
    const angle = i * 2.17 + t * (12 + i * 0.38);
    const radiusX = globalCrystalWidth * (0.06 + (i % 6) * 0.055);
    const radiusY = globalCrystalHeight * (0.04 + (i % 5) * 0.052);
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle * 0.76) * radiusY;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 42 + i * 2);
    glow.addColorStop(0, "rgba(229,235,242,.11)");
    glow.addColorStop(.38, "rgba(125,132,141,.048)");
    glow.addColorStop(1, "rgba(125,132,141,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 80, y - 80, 160, 160);
  }

  requestAnimationFrame(renderGlobalCrystal);
}

window.addEventListener("resize", resizeGlobalCrystal);
window.addEventListener("pointermove", event => {
  globalPointerX = event.clientX / window.innerWidth;
  globalPointerY = event.clientY / window.innerHeight;
}, { passive: true });

resizeGlobalCrystal();
requestAnimationFrame(renderGlobalCrystal);
