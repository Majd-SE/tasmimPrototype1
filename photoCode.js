// === العناصر الأساسية ===
const modal = document.getElementById("productModal");
const closeModalBtn = document.querySelector(".close-modal");
const mainImage = document.getElementById("mainModalImage");
const productNameEl = document.getElementById("modalProductName");
const colorContainer = document.getElementById("modalColors");
const sizeContainer = document.getElementById("modalSizeContainer");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
const confirmAddToCart = document.getElementById("confirmAddToCart");

// إخفاء شاشة التحميل عند تحميل الصفحة
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) loadingScreen.style.display = 'none';
});

let productImages = [];
let currentImageIndex = 0;
let selectedColor = "";
let selectedSize = "";

// رسالة التوست
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.visibility = "visible";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.visibility = "hidden";
    }, 500);
  }, 2000);
}

// تحديث الصورة مع أنيميشن السوايب (fade + slide)
function updateImage(newIndex) {
  if (newIndex === currentImageIndex) return; // لو نفس الصورة ما نعمل شيء

  // تحديد اتجاه السلايد (يمين أو يسار)
  let slideOutClass, slideInClass;
  if (newIndex > currentImageIndex || (newIndex === 0 && currentImageIndex === productImages.length - 1)) {
    slideOutClass = "slide-out-left";
    slideInClass = "slide-in-right";
  } else {
    slideOutClass = "slide-out-right";
    slideInClass = "slide-in-left";
  }

  // إضافة أنيميشن خروج
  mainImage.classList.add(slideOutClass);

  // بعد انتهاء أنيميشن الخروج، تغيير الصورة وبدأ أنيميشن الدخول
  mainImage.addEventListener("animationend", function handler() {
    mainImage.removeEventListener("animationend", handler);

    currentImageIndex = newIndex;
    mainImage.src = productImages[currentImageIndex];

    mainImage.classList.remove(slideOutClass);
    mainImage.classList.add(slideInClass);

    // إزالة أنيميشن الدخول بعد انتهائه
    mainImage.addEventListener("animationend", function handlerIn() {
      mainImage.removeEventListener("animationend", handlerIn);
      mainImage.classList.remove(slideInClass);
    });
  });
}

// فتح المودال مع حركة slide-in + fade-in
function openModal(product) {
  modal.style.display = "flex";

  // إزالة أي أنيميشن خروج وإضافة دخول
  modal.classList.remove("slide-out");
  modal.classList.add("slide-in");

  productNameEl.textContent = product.name;
  productImages = product.images;
  currentImageIndex = 0;
  mainImage.src = productImages[currentImageIndex];

  // إعادة تعيين التحديدات السابقة
  selectedColor = "";
  selectedSize = "";

  // إعداد أزرار الألوان
  colorContainer.innerHTML = "";
  product.colors.forEach(color => {
    const btn = document.createElement("button");
    btn.textContent = color;
    btn.classList.add("color-btn");
    btn.addEventListener("click", () => {
      selectedColor = color;
      document.querySelectorAll("#modalColors button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    colorContainer.appendChild(btn);
  });

  // إعداد أزرار المقاسات
  sizeContainer.innerHTML = "";
  product.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.textContent = size;
    btn.classList.add("size-btn");
    btn.addEventListener("click", () => {
      selectedSize = size;
      document.querySelectorAll("#modalSizeContainer button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    sizeContainer.appendChild(btn);
  });

  window.productPrice = product.price || "غير محدد";
}

// إغلاق المودال مع حركة slide-out + fade-out
function closeModalFunc() {
  modal.classList.remove("slide-in");
  modal.classList.add("slide-out");

  setTimeout(() => {
    modal.style.display = "none";
  }, 300); // مدة الأنيميشن متوافقة مع CSS
}

closeModalBtn.addEventListener("click", closeModalFunc);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModalFunc();
  }
});

// أسهم الصور (يمين ويسار)
leftArrow.addEventListener("click", () => {
  let newIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
  updateImage(newIndex);
});
rightArrow.addEventListener("click", () => {
  let newIndex = (currentImageIndex + 1) % productImages.length;
  updateImage(newIndex);
});

// دعم السحب لتغيير الصور (سوايب)
let touchStartX = 0;
let touchEndX = 0;

mainImage.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

mainImage.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (diff > 50) {
    let newIndex = (currentImageIndex + 1) % productImages.length;
    updateImage(newIndex);
  } else if (diff < -50) {
    let newIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateImage(newIndex);
  }
}

// إضافة للسلة
confirmAddToCart.addEventListener("click", () => {
  if (!selectedColor || !selectedSize) {
    alert("يرجى اختيار اللون والمقاس");
    return;
  }

  const addedProduct = {
    name: productNameEl.textContent,
    image: productImages[currentImageIndex],
    color: selectedColor,
    size: selectedSize,
    price: window.productPrice
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(addedProduct);
  localStorage.setItem("cart", JSON.stringify(cart));

  showToast("تمت الإضافة إلى السلة");

  closeModalFunc();
});

// عرض المنتج من زر view
document.querySelectorAll(".bu1").forEach(button => {
  button.addEventListener("click", () => {
    const product = {
      name: button.getAttribute("data-name"),
      images: JSON.parse(button.getAttribute("data-images")),
      colors: JSON.parse(button.getAttribute("data-colors")),
      sizes: JSON.parse(button.getAttribute("data-sizes")),
      price: button.getAttribute("data-price") || "غير محدد"
    };
    openModal(product);
  });
});

// عرض المنتج عند الضغط على الكرت كامل (باستثناء زر الإضافة)
document.querySelectorAll(".clickable-card").forEach(card => {
  card.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "button") return;

    const btn = card.querySelector(".bu1");
    if (!btn) return;

    const product = {
      name: btn.getAttribute("data-name"),
      images: JSON.parse(btn.getAttribute("data-images")),
      colors: JSON.parse(btn.getAttribute("data-colors")),
      sizes: JSON.parse(btn.getAttribute("data-sizes")),
      price: btn.getAttribute("data-price") || "غير محدد"
    };
    openModal(product);
  });
});
