let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

const container = document.getElementById("cartItemsContainer");
const emptyMessage = document.getElementById("emptyMessage");
const finalPriceEl = document.getElementById("finalPrice");

function calculateTotal() {
  let total = 0;
  cartItems.forEach(item => {
    let priceNum = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
    total += priceNum;
  });
  return total;
}

function displayCart() {
  container.innerHTML = "";

  if (cartItems.length === 0) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }

  cartItems.forEach((item, index) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("cart-item");

    productDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p>اللون: ${item.color}</p>
        <p>المقاس: ${item.size}</p>
        <p>السعر: ${item.price || "غير محدد"}</p>
      </div>
      <button class="remove-btn" data-index="${index}">حذف</button>
    `;

    container.appendChild(productDiv);
  });

  const totalPriceEl = document.createElement("div");
  totalPriceEl.classList.add("total-price");
  totalPriceEl.textContent = "الإجمالي: " + calculateTotal().toFixed(2) + " JD";
  container.appendChild(totalPriceEl);

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      cartItems.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cartItems));
      displayCart();
    });
  });
}

displayCart();

// دالة لحساب التكلفة الإضافية حسب المنطقة
function getAreaExtraCost() {
  const country = document.querySelector('input[name="country"]:checked').value;
  let extra = 0;

  if (country === "jordan") {
    const jordanSelect = document.getElementById("jordanSelect");
    extra = parseFloat(jordanSelect.options[jordanSelect.selectedIndex].value) || 0;
  } else if (country === "palestine") {
    const palestineSelect = document.getElementById("palestineSelect");
    extra = parseFloat(palestineSelect.options[palestineSelect.selectedIndex].value) || 0;
  }

  return extra;
}

// تحديث السعر النهائي في المودال
function updateFinalPrice() {
  const total = calculateTotal();
  const extra = getAreaExtraCost();
  const finalPrice = total + extra;
  if (finalPriceEl) {
    finalPriceEl.textContent = finalPrice.toFixed(2);
  }
}

// فتح الدايالوق مع تحديث السعر
document.getElementById("placeOrderBtn").addEventListener("click", () => {
  document.getElementById("orderModal").style.display = "flex";
  updateFinalPrice();
});

// إغلاق الدايالوق
function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
}

// تبديل حسب البلد وتحديث السعر
document.querySelectorAll('input[name="country"]').forEach(radio => {
  radio.addEventListener("change", function () {
    const country = this.value;
    document.getElementById("jordanArea").style.display = country === "jordan" ? "block" : "none";
    document.getElementById("palestineArea").style.display = country === "palestine" ? "block" : "none";
    updateFinalPrice();
  });
});

// تحديث السعر عند تغيير المنطقة
document.getElementById("jordanSelect").addEventListener("change", updateFinalPrice);
document.getElementById("palestineSelect").addEventListener("change", updateFinalPrice);

// التوكن ورقم المحادثة (chat_id) لتليجرام:
const TELEGRAM_BOT_TOKEN = "7908763432:AAFcY0MyQLFedrBcL4JVp0lAZee4IMOK3Do";
const TELEGRAM_CHAT_ID = "7359956200";

document.getElementById("sendOrder").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("سلة التسوق فارغة");
    return;
  }

  const country = document.querySelector('input[name="country"]:checked').value;
  let location = "";

  if (country === "jordan") {
    location = document.getElementById("jordanSelect").options[document.getElementById("jordanSelect").selectedIndex].text;
  } else {
    location = document.getElementById("palestineSelect").options[document.getElementById("palestineSelect").selectedIndex].text;
  }

  const phone = document.getElementById("userPhone").value.trim();
  if (!phone) {
    alert("يرجى إدخال رقم الهاتف");
    return;
  }

  // حساب السعر النهائي مع الإضافة
  const total = calculateTotal();
  const extra = getAreaExtraCost();
  const finalPrice = total + extra;

  // تجهيز رسالة الطلب
  let message = `طلب جديد من ${country === "jordan" ? "الأردن" : "فلسطين"}\n`;
  message += `المنطقة: ${location}\n`;
  message += `رقم الهاتف: ${phone}\n\n`;
  message += `المنتجات:\n`;

  cart.forEach((item, idx) => {
    message += `#${idx + 1} - ${item.name}\n`;
    message += `اللون: ${item.color}, المقاس: ${item.size}, السعر: ${item.price}\n\n`;
  });

  message += `الإجمالي: ${total.toFixed(2)} JD\n`;
  message += `تكلفة التوصيل حسب المنطقة: ${extra.toFixed(2)} JD\n`;
  message += `السعر النهائي: ${finalPrice.toFixed(2)} JD`;

  // إرسال الرسالة لتليجرام عبر API بوت
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      // إظهار نافذة الشكر
      document.getElementById("thankYouModal").style.display = "flex";
      // تنظيف السلة
      localStorage.removeItem("cart");
      displayCart();
      // إغلاق مودال الطلب
      closeOrderModal();
    } else {
      alert("حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.");
      console.error(data);
    }
  })
  .catch(err => {
    alert("فشل الاتصال بتلجرام. تحقق من الانترنت وحاول مجدداً.");
    console.error(err);
  });
});

// زر إغلاق نافذة الشكر مع إرسال التقييم لتليجرام
document.getElementById("closeThankYou").addEventListener("click", () => {
  // تجهيز رسالة التقييم
  let ratingMessage = "";
  if (selectedRating === 0) {
    ratingMessage = "التقييم: لم يتم التقييم";
  } else {
    ratingMessage = `التقييم: ${selectedRating} من 5 نجوم`;
  }

  // إرسال التقييم لتليجرام
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: ratingMessage
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      console.error("فشل إرسال التقييم:", data);
    }
    // إغلاق نافذة الشكر بغض النظر عن نتيجة الإرسال
    document.getElementById("thankYouModal").style.display = "none";
  })
  .catch(err => {
    console.error("خطأ في الاتصال أثناء إرسال التقييم:", err);
    document.getElementById("thankYouModal").style.display = "none";
  });
});

const starRating = document.getElementById("starRating");
let selectedRating = 0;

if (starRating) {
  const stars = starRating.querySelectorAll("span");

  stars.forEach(star => {
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.getAttribute("data-value"));
      highlightStars(val);
    });

    star.addEventListener("mouseleave", () => {
      highlightStars(selectedRating);
    });

    star.addEventListener("click", () => {
      selectedRating = parseInt(star.getAttribute("data-value"));
      highlightStars(selectedRating);
      console.log("تم اختيار تقييم: " + selectedRating + " نجوم");
    });
  });

  function highlightStars(rating) {
    stars.forEach(star => {
      const val = parseInt(star.getAttribute("data-value"));
      star.textContent = val <= rating ? "★" : "☆";
      star.style.color = val <= rating ? "#f39c12" : "black";
    });
  }

  highlightStars(0);
}
