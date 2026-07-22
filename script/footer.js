import { validateEmail } from "./emailValidator.js";
export function newSubscriber() {
  console.log("newSubscriber initialized");
  const form = document.getElementById("subscribe-form");
  console.log("clicked");
  if (!form) return;
  const inputField = document.getElementById("subscribe");
  inputField.addEventListener("input", () => {
    if (validateEmail(inputField.value)) {
      inputField.classList.remove("error");
    }
  });
  const sendBtn = document.getElementById("subscribe-btn");
  let lastSent = 0; //for the timer
  form.addEventListener("submit", async (e) => {
    console.log("submit fired");
    e.preventDefault();
    //diable button
    //check email format
    const isValidEmail = validateEmail(inputField.value);
    if (!isValidEmail) {
      inputField.classList.add("error");
      return;
    }
    //setup trap
    const trap = document.querySelector(".footer-honeypot");
    if (trap.value !== "") {
      return;
    }
    //setup timer 30s
    const now = Date.now();
    if (now - lastSent < 30000) {
      alert("Please wait before sending another message!");
      return;
    }
    sendBtn.disabled = true;
    lastSent = now;
    //spinner and overlay
    const spinner = document.querySelector(".footer-spinner");
    const overlay = document.querySelector(".footer-overlay");
    spinner.classList.add("footSpinner");
    overlay.classList.add("footOverlay");
    //get inputfield
    const param = { subscriber: inputField.value };
    try {
      const formData = new FormData(form);
      Object.entries(param).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyNcdls_ikZMoc7rnJuZGukLEhBcHbVXx6WFGIAj-Z1bZBpi6MqTJ1b8RkhLrYUqKgf/exec",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
      if (result.success) {
        alert(
          "Thank you for subscribing. 🌸\n" +
            "Watch out for some news or related information in the future.",
        );
        form.reset();
      } else {
        alert(result.error);
        form.reset();
      }
    } catch (error) {
      console.log("FAILED...", error);
      alert("Oops looks like we have an error!");
    } finally {
      spinner.classList.remove("footSpinner");
      overlay.classList.remove("footOverlay");
      sendBtn.disabled = false;
    }
  });
}
