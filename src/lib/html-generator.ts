export function generateEbookHTML(
  title: string,
  subtitle: string,
  chapters: { title: string; content: string }[]
) {
  return `
<html>
<head>
  <style>
    body { font-family: serif; line-height: 1.6; padding: 40px; }
    h1, h2 { page-break-after: avoid; }
    h1 { font-size: 32px; }
    h2 { font-size: 24px; margin-top: 40px; }
    p { font-size: 16px; white-space: pre-wrap; }
    .page-break { page-break-before: always; }
    .title-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 90vh;
    }
    .chapter-content {
        white-space: pre-wrap;
    }
  </style>
</head>
<body>

<div class="title-page">
  <h1>${title}</h1>
  <p>${subtitle}</p>
</div>

<div class="page-break"></div>

${chapters
  .map(
    (ch) => `
    <div class="chapter">
      <h2>${ch.title}</h2>
      <div class="chapter-content">${ch.content.replace(/\n/g, "<br/>")}</div>
    </div>
    <div class="page-break"></div>
  `
  )
  .join("")}

</body>
</html>
`;
}
