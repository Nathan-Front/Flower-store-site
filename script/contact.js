import { validateEmail } from "./emailValidator.js";
export function contactIntersection() {
  const interSect = document.querySelectorAll(".contact-intersecting");
  if (!interSect) return;
  const observer = new IntersectionObserver(
    (entries, observe) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("contact-intersect");
          observe.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    },
  );
  interSect.forEach((item) => observer.observe(item));
}

//form
export function sendMessage() {
  const form = document.getElementById("get-in-touch");
  if (!form) return; //This stop sending blank form to emailjs when loading page
  const emailInput = document.getElementById("email");
  const sendBtn = document.querySelector(".send-button");
  emailInput.addEventListener("input", () => {
    if (validateEmail(emailInput.value)) {
      emailInput.classList.remove("error");
    }
  });
  let lastSent = 0;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    //Check email input format
    const isValidEmail = validateEmail(emailInput.value);
    if (!isValidEmail) {
      emailInput.classList.add("error");
      return;
    }
    //Setup trap
    const trap = form.querySelector(".honeypot");
    if (trap.value !== "") {
      return;
    }
    //Setup timer to stop multi sending 30s
    const now = Date.now();
    if (now - lastSent < 30000) {
      alert("Please wait before sending another message!");
      return;
    }
    lastSent = now; //current timer
    sendBtn.disabled = true; //disable button during timer
    const spinner = document.querySelector(".spinner");
    spinner.classList.add("activeSpinner");
    const overlay = document.querySelector(".contact-overlay");
    overlay.classList.add("activeOverlay");
    //store input and textArea value to object
    const inputParams = {
      name: document.getElementById("name").value,
      email: emailInput.value,
      phone: document.getElementById("phone").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };
    try {
      const formData = new FormData(form); //form should be the value to be able to get the hidden input formType
      Object.entries(inputParams).forEach(([key, value]) => {
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
        alert("Message sent!");
        form.reset();
      }
    } catch (error) {
      console.log("FAILED...", error);
      alert("Oops looks like we have an error!");
    } finally {
      spinner.classList.remove("activeSpinner");
      overlay.classList.remove("activeOverlay");
      sendBtn.disabled = false;
    }
  });
}
