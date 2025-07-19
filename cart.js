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

function getAreaExtraCost() {
  const country = document.querySelector('input[name="country"]:checked').value;
  let extra = 0;

  if (country === "jordan") {
    const jordanSelect = document.getElementById("jordanSelect");
    extra = parseFloat(jordanSelect.value) || 0;
  } else if (country === "palestine") {
    const palestineSelect = document.getElementById("palestineSelect");
    extra = parseFloat(palestineSelect.value) || 0;
  }

  return extra;
}

function updateFinalPrice() {
  const total = calculateTotal();
  const extra = getAreaExtraCost();
  const finalPrice = total + extra;
  if (finalPriceEl) {
    finalPriceEl.textContent = finalPrice.toFixed(2);
  }
}

document.getElementById("placeOrderBtn").addEventListener("click", () => {
  document.getElementById("orderModal").style.display = "flex";
  updateFinalPrice();
});

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
}

document.querySelectorAll('input[name="country"]').forEach(radio => {
  radio.addEventListener("change", function () {
    const country = this.value;
    document.getElementById("jordanArea").style.display = country === "jordan" ? "block" : "none";
    document.getElementById("palestineArea").style.display = country === "palestine" ? "block" : "none";
    updateFinalPrice();
  });
});

document.getElementById("jordanSelect").addEventListener("change", updateFinalPrice);
document.getElementById("palestineSelect").addEventListener("change", updateFinalPrice);

// Telegram Bot Info
const TELEGRAM_BOT_TOKEN = "7908763432:AAFcY0MyQLFedrBcL4JVp0lAZee4IMOK3Do";
const TELEGRAM_CHAT_ID = "-100xxxxxxxxxx"; // عدله إلى ID القروب الصحيح

document.getElementById("sendOrder").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("سلة التسوق فارغة");
    return;
  }

  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const country = document.querySelector('input[name="country"]:checked').value;
  let location = "";

  if (!name || !phone) {
    alert("يرجى إدخال الاسم ورقم الهاتف");
    return;
  }

  if (country === "jordan") {
    location = document.getElementById("jordanSelect").options[document.getElementById("jordanSelect").selectedIndex].text;
  } else {
    location = document.getElementById("palestineSelect").options[document.getElementById("palestineSelect").selectedIndex].text;
  }

  const total = calculateTotal();
  const extra = getAreaExtraCost();
  const finalPrice = total + extra;

  let message = `📦 *طلب جديد من الموقع*\n`;
  message += `📍 *البلد:* ${country === "jordan" ? "الأردن" : "فلسطين"}\n`;
  message += `🏘️ *المنطقة:* ${location}\n`;
  message += `👤 *الاسم:* ${name}\n`;
  message += `📞 *رقم الهاتف:* ${phone}\n\n`;
  message += `🛍️ *المنتجات:*\n`;

  cart.forEach((item, idx) => {
    message += `#${idx + 1} - ${item.name}\n`;
    message += `اللون: ${item.color}, المقاس: ${item.size}, السعر: ${item.price}\n\n`;
  });

  message += `💰 *الإجمالي:* ${total.toFixed(2)} JD\n`;
  message += `🚚 *التوصيل:* ${extra.toFixed(2)} JD\n`;
  message += `🧾 *السعر النهائي:* ${finalPrice.toFixed(2)} JD`;

  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      document.getElementById("thankYouModal").style.display = "flex";
      localStorage.removeItem("cart");
      displayCart();
      closeOrderModal();
    } else {
      alert("حدث خطأ أثناء إرسال الطلب.");
      console.error(data);
    }
  })
  .catch(err => {
    alert("فشل الاتصال بتليجرام.");
    console.error(err);
  });
});

// تقييم النجوم
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

document.getElementById("closeThankYou").addEventListener("click", () => {
  let ratingMessage = selectedRating === 0
    ? "التقييم: لم يتم التقييم"
    : `التقييم: ${selectedRating} من 5 نجوم`;

  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: ratingMessage
    })
  }).finally(() => {
    document.getElementById("thankYouModal").style.display = "none";
  });
});
