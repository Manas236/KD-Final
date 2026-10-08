/* ============================================================
   The "Apply here" form on /careers — the visitor's half
   ------------------------------------------------------------
   Checks the fields in the browser (the server checks them all again),
   reads the resume into base64 and posts everything as JSON to
   /api/apply — JSON rather than a form post for the reason at the top
   of that file. On success the form is swapped for the thank-you card.

   `elapsed` is how long the form had been on screen: the server treats
   a send within two seconds as a script. `website` is the honeypot.
   ============================================================ */
const form = document.querySelector("[data-apply-form]");
const done = document.querySelector("[data-apply-done]");
const MAX_BYTES = 5 * 1024 * 1024;
const shownAt = Date.now();

if (form && done) {
  const error = form.querySelector(".apply-error");
  const button = form.querySelector("button[type=submit]");
  const label = button.querySelector("[data-edit]");
  const idle = label.textContent;

  const fail = (message, field) => {
    error.textContent = message;
    error.hidden = false;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  };

  form.addEventListener("input", (e) => e.target.removeAttribute?.("aria-invalid"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    const f = form.elements;

    if (!f.name.value.trim()) return fail("Please enter your name.", f.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()))
      return fail("Please enter a valid email address.", f.email);
    const digits = f.phone.value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
      return fail("Please enter a valid phone number.", f.phone);
    const file = f.resume.files[0];
    if (!file) return fail("Please attach your resume.", f.resume);
    if (!/\.(pdf|docx?)$/i.test(file.name))
      return fail("Please attach your resume as a PDF or Word file.", f.resume);
    if (file.size > MAX_BYTES)
      return fail("That file is too large. Please send a resume under 5 MB.", f.resume);

    button.disabled = true;
    label.textContent = form.dataset.sending || idle;
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.value,
          email: f.email.value,
          phone: f.phone.value,
          role: f.role.value,
          message: f.message.value,
          website: f.website.value,
          elapsed: Date.now() - shownAt,
          resume: { name: file.name, data: await toBase64(file) },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not send — please try again.");
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (err) {
      fail(
        err instanceof TypeError
          ? "No connection — please check your internet and try again."
          : err.message
      );
    } finally {
      button.disabled = false;
      label.textContent = idle;
    }
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read that file. Please choose it again."));
    reader.readAsDataURL(file);
  });
}
