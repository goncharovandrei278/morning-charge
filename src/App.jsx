import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Workout from './screens/Workout.jsx';
import Complete from './screens/Complete.jsx';
import Calendar from './screens/Calendar.jsx';
import Settings from './screens/Settings.jsx';

function navLinkClassName({ isActive }) {
  return `text-sm ${isActive ? 'text-yellow-400 font-bold' : 'text-slate-100'}`;
}

function BottomNav() {
  const location = useLocation();
  if (location.pathname === '/workout') return null;

  return (
    <nav className="flex justify-around border-t border-slate-800 py-3">
      <NavLink to="/" end className={navLinkClassName}>
        Главная
      </NavLink>
      <NavLink to="/calendar" className={navLinkClassName}>
        Календарь
      </NavLink>
      <NavLink to="/settings" className={navLinkClassName}>
        Настройки
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default App;
