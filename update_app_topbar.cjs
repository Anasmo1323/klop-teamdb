const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('import { ExchangeRateBanner } from "./contexts/ExchangeRateBanner";', 'import { GlobalTopBar } from "./contexts/GlobalTopBar";');
app = app.replace('<ExchangeRateBanner />', '<GlobalTopBar />');
fs.writeFileSync('src/App.tsx', app);
