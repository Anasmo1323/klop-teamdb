const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const topBarRegex = /<TopBar[\s\S]*?flaggedCount=\{flaggedCount\}\s*\/>/;

code = code.replace(topBarRegex, (match) => {
  return `{activeTab === "contacts" && (\n          ${match}\n        )}`;
});

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx TopBar conditionally rendered");
