const fs = require('fs');
let main = fs.readFileSync('src/main.tsx', 'utf-8');
main = main.replace('import App from "./App";', 'import App from "./App";\nimport { ThemeProvider } from "./contexts/ThemeContext";');
fs.writeFileSync('src/main.tsx', main);
