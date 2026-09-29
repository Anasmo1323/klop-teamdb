const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
const fonts = `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet">
  </head>`;
html = html.replace('</head>', fonts);
fs.writeFileSync('index.html', html);
