// Builds the website from content/site.json.
// Vercel runs this on every change: node build.js -> public/index.html
// No packages needed. Edit content through Pages CMS, not here.

const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "public");
const c = JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src", "styles.css"), "utf8");

// ---------- helpers ----------
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const has = (v) => (Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "");
const lines = (v) => esc(v).split(/\r?\n/).join("<br>");
const list = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
const url = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(s)) return s;
  return "https://" + s;
};
const pretty = (v) => String(v ?? "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

const p = c.profile || {};
const contact = c.contact || {};
const name = p.name || "";
const year = new Date().getFullYear();
const description = p.tagline || "";

// ---------- sections ----------
const nav = [
  has(c.about) && ["about", "About"],
  has(c.experience) && ["experience", "Experience"],
  has(c.work) && ["work", "Work"],
  has(c.events) && ["events", "Events"],
  has(c.writing) && ["writing", "Writing"],
  has(c.gallery) && ["gallery", "Gallery"],
  (has(c.education) || has(c.skills)) && ["education", "Education &amp; Skills"],
  ["contact", "Contact"],
].filter(Boolean);

const hero = `
  <div class="hero">
    <div class="wrap hero-grid${has(p.photo) ? " with-photo" : ""}">
      ${has(p.photo) ? `<img class="portrait" src="${esc(url(p.photo))}" alt="Portrait of ${esc(name)}" width="220" height="264">` : ""}
      <div>
        ${has(p.headline) ? `<span class="kicker">${esc(p.headline)}</span>` : ""}
        <h1>${esc(name)}</h1>
        ${has(p.tagline) ? `<p class="lede">${esc(p.tagline)}</p>` : ""}
        <div class="actions">
          <a class="btn primary" href="#contact">Get in touch</a>
          ${has(c.work) ? `<a class="btn ghost" href="#work">See my work</a>` : ""}
          ${has(contact.linkedin) ? `<a class="btn ghost" href="${esc(url(contact.linkedin))}">LinkedIn</a>` : ""}
        </div>
      </div>
      <dl class="facts">
        ${has(p.current_role) ? `<div><dt>Current role</dt><dd>${esc(p.current_role)}</dd></div>` : ""}
        ${has(p.based_in) ? `<div><dt>Based in</dt><dd>${esc(p.based_in)}</dd></div>` : ""}
        ${has(p.focus) ? `<div><dt>Focus</dt><dd>${esc(p.focus)}</dd></div>` : ""}
      </dl>
    </div>
  </div>`;

const about = !has(c.about) ? "" : `
  <section id="about">
    <div class="wrap about-grid">
      <div class="prose">
        <h2>About</h2>
        ${list(c.about).map((t) => `<p>${esc(t)}</p>`).join("\n        ")}
      </div>
      ${has(c.highlights) ? `<div class="stats" aria-label="Highlights">
        ${list(c.highlights).map((h) => `<div class="stat"><b>${esc(h.number)}</b><span>${esc(h.label)}</span></div>`).join("\n        ")}
      </div>` : ""}
    </div>
  </section>`;

const experience = !has(c.experience) ? "" : `
  <section id="experience">
    <div class="wrap">
      <div class="sec-head"><h2>Experience</h2></div>
      <ol class="timeline">
        ${list(c.experience).map((e) => `<li>
          <h3>${esc(e.title)}</h3>
          <p class="role-meta">${[e.organisation, e.location, e.dates].filter(has).map(esc).join(" · ")}</p>
          ${has(e.description) ? `<p class="role-text">${lines(e.description)}</p>` : ""}
        </li>`).join("\n        ")}
      </ol>
    </div>
  </section>`;

const card = (w) => {
  const title = has(w.link) ? `<a href="${esc(url(w.link))}">${esc(w.title)}</a>` : esc(w.title);
  return `<article class="card">
          ${has(w.image) ? `<img class="card-img" src="${esc(url(w.image))}" alt="" loading="lazy">` : ""}
          ${has(w.tag) ? `<span class="tag">${esc(w.tag)}</span>` : ""}
          <h3>${title}</h3>
          ${has(w.description) ? `<p>${lines(w.description)}</p>` : ""}
          ${has(w.place) ? `<span class="place">${esc(w.place)}</span>` : ""}
        </article>`;
};

const work = !has(c.work) ? "" : `
  <section id="work">
    <div class="wrap">
      <div class="sec-head">
        <h2>Selected work</h2>
        ${has(c.work_intro) ? `<p>${esc(c.work_intro)}</p>` : ""}
      </div>
      <div class="work">
        ${list(c.work).map(card).join("\n        ")}
      </div>
    </div>
  </section>`;

const events = !has(c.events) ? "" : `
  <section id="events">
    <div class="wrap">
      <div class="sec-head">
        <h2>Regional events</h2>
        ${has(c.events_intro) ? `<p>${esc(c.events_intro)}</p>` : ""}
      </div>
      <div class="events">
        ${list(c.events).map((e) => `<div class="event">
          ${has(e.label) ? `<div class="when">${esc(e.label)}</div>` : ""}
          <h3>${esc(e.title)}</h3>
          ${has(e.description) ? `<p>${lines(e.description)}</p>` : ""}
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;

const writing = !has(c.writing) ? "" : `
  <section id="writing">
    <div class="wrap">
      <div class="sec-head"><h2>Writing and research</h2></div>
      <div class="work">
        ${list(c.writing).map(card).join("\n        ")}
      </div>
    </div>
  </section>`;

const gallery = !has(c.gallery) ? "" : `
  <section id="gallery">
    <div class="wrap">
      <div class="sec-head"><h2>Gallery</h2></div>
      <div class="gallery">
        ${list(c.gallery).filter((g) => has(g.image)).map((g) => `<figure>
          <img src="${esc(url(g.image))}" alt="${esc(g.caption)}" loading="lazy">
          ${has(g.caption) ? `<figcaption>${esc(g.caption)}</figcaption>` : ""}
        </figure>`).join("\n        ")}
      </div>
    </div>
  </section>`;

const education = !(has(c.education) || has(c.skills)) ? "" : `
  <section id="education">
    <div class="wrap cols">
      ${has(c.education) ? `<div>
        <h2>Education</h2>
        <ul class="edu">
          ${list(c.education).map((e) => `<li><strong>${esc(e.qualification)}</strong><span>${lines(e.details)}</span></li>`).join("\n          ")}
        </ul>
      </div>` : ""}
      <div>
        ${has(c.skills) ? `<h2>Skills</h2>
        <ul class="chips">
          ${list(c.skills).map((s) => `<li>${esc(s)}</li>`).join("\n          ")}
        </ul>` : ""}
        ${has(c.tools) ? `<h3 class="sub">Tools</h3><p class="muted">${esc(c.tools)}</p>` : ""}
        ${has(c.languages) ? `<h3 class="sub">Languages</h3><p class="muted">${esc(c.languages)}</p>` : ""}
      </div>
    </div>
  </section>`;

const contactSec = `
  <section id="contact" class="last">
    <div class="wrap">
      <div class="contact">
        <div>
          <h2>${esc(contact.heading || "Get in touch")}</h2>
          ${has(contact.intro) ? `<p class="contact-intro">${esc(contact.intro)}</p>` : ""}
        </div>
        <dl>
          ${has(contact.email) ? `<div><dt>Email</dt><dd><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></dd></div>` : ""}
          ${has(contact.phone) ? `<div><dt>Phone</dt><dd><a href="tel:${esc(String(contact.phone).replace(/\s+/g, ""))}">${esc(contact.phone)}</a></dd></div>` : ""}
          ${has(contact.linkedin) ? `<div><dt>LinkedIn</dt><dd><a href="${esc(url(contact.linkedin))}">${esc(pretty(contact.linkedin))}</a></dd></div>` : ""}
          ${has(contact.location) ? `<div><dt>Location</dt><dd>${esc(contact.location)}</dd></div>` : ""}
        </dl>
      </div>
    </div>
  </section>`;

// ---------- page ----------
const title = `${name} | ${p.short_title || "Regional Communications"}`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${has(p.photo) ? `<meta property="og:image" content="${esc(url(p.photo))}">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
${css}</style>
</head>
<body>

<header class="top">
  <div class="wrap">
    <a class="brand" href="#top">${esc(name)}</a>
    <nav aria-label="Sections">
      <ul>
        ${nav.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("\n        ")}
      </ul>
    </nav>
  </div>
</header>

<main id="top">${hero}${about}${experience}${work}${events}${writing}${gallery}${education}${contactSec}
</main>

<footer>
  <div class="wrap">
    <span>© ${year} ${esc(name)}. All rights reserved.</span>
    ${has(c.footer_tagline) ? `<span>${esc(c.footer_tagline)}</span>` : ""}
  </div>
</footer>
</body>
</html>
`;

// ---------- write ----------
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
const media = path.join(root, "media");
if (fs.existsSync(media)) fs.cpSync(media, path.join(out, "media"), { recursive: true });
console.log("Built public/index.html");
