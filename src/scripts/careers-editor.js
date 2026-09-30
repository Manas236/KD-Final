/* ============================================================
   Job postings on /careers — the edit-mode half
   ------------------------------------------------------------
   Loaded only for a signed-in editor (the same hint cookie BaseLayout
   gates inline-edit.js on); /api/careers checks the real session.

   Adds two things to the "Current openings" grid, both marked
   data-nt-ui so the text editor leaves them alone, and both hidden by
   public/editor-ui.css until "Edit text" is on:

     · an "Add a job posting" card at the end: title, details, and the
       LinkedIn and/or Indeed link
     · a "Remove posting" button on every posting card

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
      <p class="nt-jobs-error" role="alert" hidden></p>
      <button type="submit" class="nt-jobs-submit">Add posting</button>
    </form>`;

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
