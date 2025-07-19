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

// ========== السعر النهائي ==========
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

// ========== فتح المودال ==========
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

// ========== إعدادات تلجرام ==========
const TELEGRAM_BOT_TOKEN = "7908763432:AAFcY0MyQLFedrBcL4JVp0lAZee4IMOK3Do";
const TELEGRAM_CHAT_ID = "-1002472660040"; // ID القروب

document.getElementById("sendOrder").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("سلة التسوق فارغة");
    return;
  }

  const country = document.querySelector('input[name="country"]:checked').value;
  let location = "";
  if (country === "jordan") {
    location = document.getElementById("jordanSelect").selectedOptions[0].text;
  } else {
    location = document.getElementById("palestineSelect").selectedOptions[0].text;
  }

  const phone = document.getElementById("userPhone").value.trim();
  if (!phone) {
    alert("يرجى إدخال رقم الهاتف");
    return;
  }

  const total = calculateTotal();
  const extra = getAreaExtraCost();
  const finalPrice = total + extra;

  // ========== الرسالة ==========
  let message = `📦 *طلب جديد من الموقع:*\n`;
  message += `📍 *البلد:* ${country === "jordan" ? "الأردن" : "فلسطين"}\n`;
  message += `🏘️ *المنطقة:* ${location}\n`;
  message += `📞 *رقم الهاتف:* ${phone}\n\n`;
  message += `🛍️ *المنتجات:*\n`;

  cart.forEach((item, idx) => {
    message += `\n#${idx + 1} - ${item.name}\n`;
    message += `- اللون: ${item.color}\n`;
    message += `- المقاس: ${item.size}\n`;
    message += `- السعر: ${item.price}\n`;
  });

  message += `\n💰 *الإجمالي:* ${total.toFixed(2)} JD`;
  message += `\n🚚 *التوصيل:* ${extra.toFixed(2)} JD`;
  message += `\n🧾 *السعر النهائي:* ${finalPrice.toFixed(2)} JD`;

  // إرسال الرسالة
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
      alert("فشل في إرسال الطلب.");
      console.error(data);
    }
  })
  .catch(err => {
    alert("خطأ بالاتصال. حاول لاحقاً.");
    console.error(err);
  });
});

// ========== التقييم ==========
document.getElementById("closeThankYou").addEventListener("click", () => {
  const ratingMessage = selectedRating
    ? `⭐ تم تقييم الطلب: ${selectedRating} نجوم`
    : "📭 لم يتم تقييم الطلب";

  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: ratingMessage
    })
  })
  .finally(() => {
    document.getElementById("thankYouModal").style.display = "none";
  });
});

const starRating = document.getElementById("starRating");
let selectedRating = 0;

if (starRating) {
  const stars = starRating.querySelectorAll("span");
  stars.forEach(star => {
    star.addEventListener("mouseenter", () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener("mouseleave", () => highlightStars(selectedRating));
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      highlightStars(selectedRating);
    });
  });

  function highlightStars(rating) {
    stars.forEach(star => {
      const val = parseInt(star.dataset.value);
      star.textContent = val <= rating ? "★" : "☆";
      star.style.color = val <= rating ? "#f39c12" : "#000";
    });
  }

  highlightStars(0);
}
