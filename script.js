const SEND_API_URL = "http://localhost:8080/api/send-bulk-message";
const SMS_BALANCE_API_URL = "http://localhost:8080/api/get-sms-balance";

const form = document.getElementById("messageForm");
const messageInput = document.getElementById("message");
const contactInput = document.getElementById("contacts");
const submitBtn = document.getElementById("submitBtn");
const alertBox = document.getElementById("alert");
const charCount = document.getElementById("charCount");
const smsCount = document.getElementById("smsCount");
const stats = document.getElementById("smsCount");

// Fetch SMS Balance
document.addEventListener("DOMContentLoaded", () => {
  fetchSMSBalance();
});

// Update character and SMS count
messageInput.addEventListener("input", () => {
  const text = messageInput.value;
  const length = text.length;
  const smsLength = 160;
  const sms = Math.ceil(length / smsLength) || 0;

  charCount.textContent = length;
  smsCount.textContent = sms;
});

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertBox.className = "alert";
  }, 5000);
}

function parseContacts(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const senderId = document.getElementById("senderId").value.trim();
  const messageType = document.getElementById("messageType").value;
  const message = messageInput.value.trim();
  const contactsText = contactInput.value.trim();
  const deliveryUrl = document.getElementById("deliveryUrl").value.trim();

  const contacts = parseContacts(contactsText);

  if (contacts.length === 0) {
    showAlert("Please enter at least one phone number", "error");
    return;
  }

  const payload = {
    senderId,
    messageType,
    message,
    contacts,
    deliveryReportUrl: deliveryUrl || undefined,
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>Sending...';

  try {
    const response = await fetch(SEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      showAlert(
        `Successfully sent messages to ${contacts.length} recipient(s)!`,
        "success"
      );

      // Update stats
      document.getElementById("totalSent").textContent = contacts.length;
      document.getElementById("totalRecipients").textContent = contacts.length;
      stats.style.display = "grid";

      // Clear form
      form.reset();
      charCount.textContent = "0";
      smsCount.textContent = "0";

      //   load SMS Balance
      fetchSMSBalance();
    } else {
      showAlert(`Error: ${data.message}`, "error");
    }
  } catch (error) {
    showAlert(
      `Network error: ${error.message}. Make sure the backend is running.`,
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Send Messages";
  }
});

async function fetchSMSBalance() {
  const smsBalance = document.getElementById("smsBalance");

  try {
    const response = await fetch(SMS_BALANCE_API_URL, {
      method: "GET",
    });

    const data = await response.json();

    if (data.success) {
      smsBalance.textContent = data?.data?.data?.totalSms;
    }
  } catch (error) {
    showAlert(`Error Fetching SMS Balance: ${error.message}`, "error");
  }
}
