import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../storage/storage.js';
import DurationPicker from '../components/DurationPicker.jsx';

function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  function updateDuration(defaultDuration) {
    saveSettings({ defaultDuration }).then(setSettings);
  }

  function toggleSound() {
    saveSettings({ soundEnabled: !settings.soundEnabled }).then(setSettings);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <div>
        <p className="mb-2 text-slate-400">Длительность по умолчанию</p>
        <DurationPicker value={settings.defaultDuration} onChange={updateDuration} />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={settings.soundEnabled} onChange={toggleSound} />
        Звук / голосовой режим
      </label>
    </div>
  );
}

export default Settings;
