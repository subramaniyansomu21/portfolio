const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const typedTagline = document.getElementById("typed-tagline");
const contactForm = document.querySelector(".contact-form");
const formNote = document.getElementById("form-note");

const taglineText = "Enterprise CRM • AI Integrations • Workflow Automation";

function setMenuState(isOpen) {
  if (!navToggle || !navMenu) {
    return;
  }

  navToggle.setAttribute("aria-expanded", String(isOpen));
  navMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isExpanded);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setMenuState(false);
  });
});

document.addEventListener("click", (event) => {
  if (!navToggle || !navMenu) {
    return;
  }

  const clickedInsideMenu = navMenu.contains(event.target);
  const clickedToggle = navToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    setMenuState(false);
  }
});

function updateActiveLink() {
  const scrollPosition = window.scrollY + 140;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");

    if (scrollPosition >= top && scrollPosition < bottom) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

function typeTagline(index = 0) {
  if (!typedTagline) {
    return;
  }

  typedTagline.textContent = taglineText.slice(0, index);

  if (index < taglineText.length) {
    window.setTimeout(() => typeTagline(index + 1), 42);
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // Disable submit button
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        if (formNote) {
          formNote.textContent = "Message sent successfully! I'll get back to you soon.";
          formNote.style.color = "green";
        }
        contactForm.reset();
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      if (formNote) {
        formNote.textContent = "Failed to send message. Please try again or contact me directly.";
        formNote.style.color = "red";
      }
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send";
      }
    }
  });
}

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("load", () => {
  updateActiveLink();
  typeTagline();
});
