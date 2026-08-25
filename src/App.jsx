import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Workout from './screens/Workout.jsx';
import Complete from './screens/Complete.jsx';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/calendar" element={<div>Calendar placeholder</div>} />
            <Route path="/settings" element={<div>Settings placeholder</div>} />
          </Routes>
        </main>
        <nav className="flex justify-around border-t border-slate-800 py-3">
          <NavLink to="/" end className="text-sm">
            Главная
          </NavLink>
          <NavLink to="/calendar" className="text-sm">
            Календарь
          </NavLink>
          <NavLink to="/settings" className="text-sm">
            Настройки
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
