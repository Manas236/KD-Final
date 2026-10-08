/* ============================================================
   Job postings on /careers — the edit-mode half
   ------------------------------------------------------------
   Loaded only for a signed-in editor (the same hint cookie BaseLayout
   gates inline-edit.js on); /api/careers checks the real session.

   Adds two things to the "Current openings" grid, both marked
   data-nt-ui so the text editor leaves them alone, and both hidden by
   public/editor-ui.css until "Edit text" is on:

     · an "Add a job posting" card at the end: title, details, the
       LinkedIn and/or Indeed link, and how many days (1–30) to list it
     · on every posting card, the date it comes down by itself and a
       "Remove posting" button

   Either one reloads the page on success, because the cards are
   rendered by the server. Changing a posting's WORDING needs neither:
   its title and details are ordinary editable text.
   ============================================================ */
const grid = document.querySelector("#openings ul");
if (grid) {
  for (const card of grid.querySelectorAll(":scope > li[data-posting]")) addRemove(card);
  grid.appendChild(addCard());
}

function addRemove(card) {
  if (card.dataset.expires) {
    const note = document.createElement("p");
    note.className = "nt-jobs-expiry";
    note.setAttribute("data-nt-ui", "");
    const when = new Date(card.dataset.expires);
    note.textContent = `Comes down by itself on ${when.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}, ${when.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
    card.appendChild(note);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "nt-jobs-remove";
  button.setAttribute("data-nt-ui", "");
  button.textContent = "Remove posting";
  button.addEventListener("click", async () => {
    const title = card.querySelector("h3")?.textContent?.trim() || "this posting";
    if (!window.confirm(`Remove "${title}" from the careers page?`)) return;
    button.disabled = true;
    const res = await send({ action: "remove", id: Number(card.dataset.posting) });
    if (res.ok) location.reload();
    else {
      button.disabled = false;
      window.alert(res.error);
    }
  });
  card.appendChild(button);
}

function addCard() {
  const li = document.createElement("li");
  li.className = "nt-jobs-add";
  li.setAttribute("data-nt-ui", "");
  li.innerHTML = `
    <form novalidate>
      <p class="nt-jobs-head">Add a job posting</p>
      <label>Job title
        <input name="title" required maxlength="120" placeholder="Site Engineer — Civil" />
      </label>
      <label>Details <span>optional</span>
        <input name="details" maxlength="200" placeholder="Navi Mumbai · 3–5 years · Full-time" />
      </label>
      <label>LinkedIn post link
        <input name="linkedin" type="url" inputmode="url" placeholder="https://www.linkedin.com/jobs/view/…" />
      </label>
      <label>Indeed post link
        <input name="indeed" type="url" inputmode="url" placeholder="https://in.indeed.com/viewjob?jk=…" />
      </label>
      <p class="nt-jobs-note">One link is enough; add both if the role is on both sites.</p>
      <label>Show it for
        <select name="days">${dayOptions()}</select>
      </label>
      <p class="nt-jobs-note">After this the card comes off the site by itself, so a closed
        posting is never left up. To keep a role up longer, add it again.</p>
      <p class="nt-jobs-error" role="alert" hidden></p>
      <button type="submit" class="nt-jobs-submit">Add posting</button>
    </form>
    <a class="nt-jobs-link" href="/studio/applications">See applications sent from this page</a>`;

  const form = li.querySelector("form");
  const error = li.querySelector(".nt-jobs-error");
  const submit = li.querySelector("button");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    const data = Object.fromEntries(new FormData(form));
    const res = await send({ action: "add", ...data });
    if (res.ok) {
      location.reload();
      return;
    }
    submit.disabled = false;
    error.textContent = res.error;
    error.hidden = false;
  });
  return li;
}

/* A short ladder rather than every day from 1 to 30: nobody picks 17.
   The server accepts any whole number of days from 1 to 30. */
const DAYS = [
  [1, "1 day"],
  [3, "3 days"],
  [7, "1 week"],
  [14, "2 weeks"],
  [21, "3 weeks"],
  [30, "30 days (the most)"],
];

function dayOptions() {
  return DAYS.map(
    ([d, label]) => `<option value="${d}"${d === 30 ? " selected" : ""}>${label}</option>`
  ).join("");
}

async function send(body) {
  try {
    const res = await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401)
      return { ok: false, error: "Your editing session has ended — sign in again, then retry." };
    if (!res.ok) return { ok: false, error: data.error || "Could not save." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "No connection — nothing was saved." };
  }
}
