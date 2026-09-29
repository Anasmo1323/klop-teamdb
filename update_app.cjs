const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

const hook = `
export function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}
`;

app = app.replace('export function App() {', hook + '\nexport function App() {');
// we also need to pass the toggleTheme to SidebarNav and TopBar later, or use context. Since it's a massive component, let's just create a context in another file to keep it clean.
fs.writeFileSync('src/App.tsx', app);
