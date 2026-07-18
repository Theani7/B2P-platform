// Minimal inline markdown for assistant messages (bold/italic/headers/lists/code).
// Covers the subset the LLM emits; add react-markdown if richer rendering is needed.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="bg-slate-custom/10 px-1 rounded text-[0.8em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>");
}

export function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  let html = "";
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      html += `<p class="font-semibold mt-2 mb-1">${inline(h[2])}</p>`;
      continue;
    }
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {
        html += "<ul class='list-disc pl-4 space-y-1'>";
        inList = true;
      }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }
    const num = line.match(/^\d+\.\s+(.*)$/);
    if (num) {
      if (!inList) {
        html += "<ol class='list-decimal pl-4 space-y-1'>";
        inList = true;
      }
      html += `<li>${inline(num[1])}</li>`;
      continue;
    }
    closeList();
    html += `<p class="mb-1">${inline(line)}</p>`;
  }
  closeList();
  return html;
}
