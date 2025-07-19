// العناصر الأساسية
const modal = document.getElementById("productModal");
const closeModal = document.querySelector(".close-modal");
const mainImage = document.getElementById("mainModalImage");
const productNameEl = document.getElementById("modalProductName");
const colorContainer = document.getElementById("modalColors");
const sizeContainer = document.getElementById("modalSizeContainer");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
const confirmAddToCart = document.getElementById("confirmAddToCart");

window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.display = 'none';  // تخفي شاشة التحميل بعد تحميل الصفحة
});


let productImages = [];
let currentImageIndex = 0;
let selectedColor = "";
let selectedSize = "";

// دالة عرض رسالة التوست
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
  }, 2000); // تظهر الرسالة لمدة ثانيتين
}

// تحديث الصورة مع تأثيرات fade
function updateImage(newIndex) {
  mainImage.classList.add("fade-out");
  setTimeout(() => {
    currentImageIndex = newIndex;
    mainImage.src = productImages[currentImageIndex];
    mainImage.classList.remove("fade-out");
    mainImage.classList.add("fade-in");
    setTimeout(() => {
      mainImage.classList.remove("fade-in");
    }, 300);
  }, 300);
}

// فتح المودال مع تحميل بيانات المنتج
function openModal(product) {
  modal.style.display = "flex";
  modal.classList.remove("fade-out");
  modal.classList.add("fade-in");

  productNameEl.textContent = product.name;

  productImages = product.images;
  currentImageIndex = 0;
  mainImage.src = productImages[currentImageIndex];

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

  selectedColor = "";
  selectedSize = "";
}

// إغلاق المودال مع تأثير fade
closeModal.addEventListener("click", () => {
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
});

// التحكم بأسهم تغيير الصور
leftArrow.addEventListener("click", () => {
  let newIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
  updateImage(newIndex);
});
rightArrow.addEventListener("click", () => {
  let newIndex = (currentImageIndex + 1) % productImages.length;
  updateImage(newIndex);
});

// زر إضافة المنتج للسلة مع التحقق من الاختيارات وحفظ في localStorage
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

  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
});

// فتح المودال عند الضغط على أزرار view وتحميل بيانات المنتج من data attributes
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

// دعم السحب (swipe) لتغيير الصور على الهواتف
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
