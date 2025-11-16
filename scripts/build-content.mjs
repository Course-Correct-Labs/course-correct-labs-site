import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

function loadContent() {
  const jsonPath = path.join(rootDir, "data", "content.json");
  const raw = readFileSync(jsonPath, "utf8");
  return JSON.parse(raw);
}

function renderPaperCardHome(paper) {
  const externalLinksHtml = paper.externalLinks.map(link =>
    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn" style="font-size:.8rem;padding:.4rem .7rem">${link.label}</a>`
  ).join('\n                ');

  const pillsHtml = externalLinksHtml
    ? `${externalLinksHtml}\n                <a href="${paper.url}" class="btn" style="font-size:.8rem;padding:.4rem .7rem">Read →</a>`
    : `<a href="${paper.url}" class="btn" style="font-size:.8rem;padding:.4rem .7rem">Read →</a>`;

  return `          <div class="highlight">
            <img class="himg" src="${paper.imageSrc}" alt="${paper.imageAlt}" loading="lazy" />
            <div class="body">
              <strong>${paper.title}</strong>
              <p style="font-style:italic;color:rgba(255,255,255,.6);font-size:.85rem;margin-top:.25rem">${paper.status}</p>
              <p>${paper.description}</p>
              <p class="why">Why it matters: ${paper.whyItMatters}</p>
              <div class="pills">
                ${pillsHtml}
              </div>
            </div>
          </div>`;
}

function renderStudyCardHome(study) {
  const externalLinksHtml = study.externalLinks.map(link =>
    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn" style="font-size:.85rem;padding:.5rem .8rem">${link.label}</a>`
  ).join('\n                ');

  const pillsHtml = externalLinksHtml
    ? `${externalLinksHtml}\n                <a href="${study.url}" class="btn" style="font-size:.85rem;padding:.5rem .8rem">Read →</a>`
    : `<a href="${study.url}" class="btn" style="font-size:.85rem;padding:.5rem .8rem">Read →</a>`;

  return `          <div class="highlight">
            <img class="himg" src="${study.imageSrc}" alt="${study.imageAlt}" loading="lazy" />
            <div class="body">
              <strong>${study.title}</strong>
              <p style="font-style:italic;color:var(--muted);font-size:.9rem;margin-bottom:.75rem">${study.subtitle}</p>
              <p>${study.description}</p>
              <div class="pills" style="margin-top:1rem">
                ${pillsHtml}
              </div>
            </div>
          </div>`;
}

function renderPaperCardPage(paper) {
  const externalLinksHtml = paper.externalLinks.map(link =>
    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn" style="font-size:.8rem;padding:.4rem .7rem">${link.label}</a>`
  ).join('\n                ');

  const pillsHtml = externalLinksHtml
    ? `${externalLinksHtml}\n                <a href="${paper.url}" class="btn" style="font-size:.8rem;padding:.4rem .7rem">Read →</a>`
    : `<a href="${paper.url}" class="btn" style="font-size:.8rem;padding:.4rem .7rem">Read →</a>`;

  return `          <div class="highlight">
            <img class="himg" src="${paper.imageSrc}" alt="${paper.imageAlt}" loading="lazy" />
            <div class="body">
              <strong>${paper.title}</strong>
              <p style="font-style:italic;color:rgba(255,255,255,.6);font-size:.85rem;margin-top:.25rem">${paper.status}</p>
              <p>${paper.description}</p>
              <p class="why">Why it matters: ${paper.whyItMatters}</p>
              <div class="pills">
                ${pillsHtml}
              </div>
            </div>
          </div>`;
}

function renderStudyCardPage(study) {
  const externalLinksHtml = study.externalLinks.map(link =>
    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn" style="font-size:.85rem;padding:.5rem .8rem">${link.label}</a>`
  ).join('\n                ');

  const pillsHtml = externalLinksHtml
    ? `${externalLinksHtml}\n                <a href="${study.url}" class="btn" style="font-size:.85rem;padding:.5rem .8rem">Read →</a>`
    : `<a href="${study.url}" class="btn" style="font-size:.85rem;padding:.5rem .8rem">Read →</a>`;

  return `          <div class="highlight">
            <img class="himg" src="${study.imageSrc}" alt="${study.imageAlt}" loading="lazy" />
            <div class="body">
              <strong>${study.title}</strong>
              <p style="font-style:italic;color:var(--muted);font-size:.9rem;margin-bottom:.75rem">${study.subtitle}</p>
              <p>${study.description}</p>
              <div class="pills" style="margin-top:1rem">
                ${pillsHtml}
              </div>
            </div>
          </div>`;
}

function replaceBetweenMarkers(html, startMarker, endMarker, newContent) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    console.warn(`Markers not found or misordered: ${startMarker}, ${endMarker}`);
    return html;
  }

  const before = html.slice(0, start + startMarker.length);
  const after = html.slice(end);

  // ensure there is a newline around generated content
  return `${before}\n${newContent}\n${after}`;
}

function updateFile(relativePath, replacements) {
  const filePath = path.join(rootDir, relativePath);
  let html = readFileSync(filePath, "utf8");

  Object.entries(replacements).forEach(
    ([markerPair, content]) => {
      const [startMarker, endMarker] = markerPair.split("|");
      html = replaceBetweenMarkers(html, startMarker, endMarker, content);
    }
  );

  writeFileSync(filePath, html);
  console.log(`Updated ${relativePath}`);
}

function main() {
  const { papers, studies } = loadContent();

  const papersHomeHtml = papers.map(renderPaperCardHome).join("\n");
  const studiesHomeHtml = studies.map(renderStudyCardHome).join("\n");
  const papersPageHtml = papers.map(renderPaperCardPage).join("\n");
  const studiesPageHtml = studies.map(renderStudyCardPage).join("\n");

  updateFile("index.html", {
    "<!-- PAPERS_HOME_START -->|<!-- PAPERS_HOME_END -->": papersHomeHtml,
    "<!-- STUDIES_HOME_START -->|<!-- STUDIES_HOME_END -->": studiesHomeHtml
  });

  updateFile("research.html", {
    "<!-- PAPERS_PAGE_START -->|<!-- PAPERS_PAGE_END -->": papersPageHtml
  });

  updateFile("studies.html", {
    "<!-- STUDIES_PAGE_START -->|<!-- STUDIES_PAGE_END -->": studiesPageHtml
  });
}

main();
