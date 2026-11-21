"use strict";

function remember(key, value) {
  try {
    const name = "skillharbor." + key;
    if (value === undefined) return JSON.parse(localStorage.getItem(name));
    localStorage.setItem(name, JSON.stringify(value));
    return true;
  } catch {
    return null;
  }
}

const search = document.querySelector(".head input[type=search]");
const cards = [...document.querySelectorAll(".courses-page .course")];
if (cards.length) {
  const category = document.querySelector("#course-category");
  const savedOnly = document.querySelector("#saved-only");
  const status = document.querySelector("#course-status");
  const saved = new Set(remember("courses") || []);
  search.value = new URLSearchParams(location.search).get("q") || "";

  function updateCatalog() {
    let count = 0;
    const query = search.value.trim().toLowerCase();
    for (const card of cards) {
      const title = card.querySelector("h4").textContent;
      const selected = saved.has(title);
      const button = card.querySelector("button");
      button.textContent = selected ? "Saved" : "Save course";
      button.setAttribute("aria-pressed", selected);
      card.hidden = !(
        (title + " " + card.querySelector(".description").textContent).toLowerCase().includes(query)
        && (category.value === "All" || card.dataset.category === category.value)
        && (!savedOnly.checked || selected)
      );
      if (!card.hidden) count++;
    }
    status.textContent = count ? count + (count === 1 ? " course" : " courses") : "No matching courses.";
  }

  for (const card of cards) {
    card.querySelector("button").addEventListener("click", () => {
      const title = card.querySelector("h4").textContent;
      if (saved.has(title)) saved.delete(title);
      else saved.add(title);
      const persisted = remember("courses", [...saved]);
      updateCatalog();
      if (!persisted) status.textContent += " Browser storage is unavailable. Changes apply to this page only.";
    });
  }

  search.addEventListener("input", updateCatalog);
  category.addEventListener("change", updateCatalog);
  savedOnly.addEventListener("change", updateCatalog);
  updateCatalog();
} else {
  search.addEventListener("keydown", event => {
    if (event.key === "Enter") location.href = "courses.html?q=" + encodeURIComponent(search.value.trim());
  });
}

const draft = document.querySelector(".quick-draft form");
if (draft) {
  const title = draft.querySelector("[type=text]");
  const body = draft.querySelector("textarea");
  title.setAttribute("aria-label", "Note title");
  body.setAttribute("aria-label", "Study note");
  const previous = remember("note") || {};
  title.value = previous.title || "";
  body.value = previous.body || "";
  draft.addEventListener("submit", event => {
    event.preventDefault();
    const stored = remember("note", { title: title.value, body: body.value });
    document.querySelector("#draft-status").textContent = stored
      ? "Study note saved on this device."
      : "Browser storage is unavailable. Your note is still in the form.";
  });
}

const buttons = [...document.querySelectorAll("[data-plan]")];
if (buttons.length) {
  const status = document.querySelector("#plan-status");
  function choose(plan, persisted) {
    for (const button of buttons) {
      const active = button.closest(".plan").querySelector("h2").textContent === plan;
      button.textContent = active ? "Selected" : "Select for comparison";
      button.setAttribute("aria-pressed", active);
    }
    if (plan) status.textContent = plan + (persisted ? " preference saved on this device." : " selected for this visit.");
  }
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const plan = button.closest(".plan").querySelector("h2").textContent;
      choose(plan, remember("plan", plan));
    });
  }
  choose(remember("plan"), true);
}

for (const row of document.querySelectorAll(".tasks .task-row")) {
  const title = row.querySelector("h3").textContent.trim();
  const key = "task." + title;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("aria-label", "Mark complete: " + title);
  checkbox.checked = remember(key) ?? row.classList.contains("done");
  row.classList.toggle("done", checkbox.checked);
  row.querySelector(".delete").replaceWith(checkbox);
  checkbox.addEventListener("change", () => {
    row.classList.toggle("done", checkbox.checked);
    remember(key, checkbox.checked);
  });
}
