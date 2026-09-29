const fs = require('fs');
let main = fs.readFileSync('src/main.tsx', 'utf-8');
main = main.replace("import App from './App.tsx'", "import App from './App.tsx'\nimport { ThemeProvider } from './contexts/ThemeContext.tsx'");
main = main.replace("<App />", "<ThemeProvider><App /></ThemeProvider>");
fs.writeFileSync('src/main.tsx', main);
