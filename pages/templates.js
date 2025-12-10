import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { MOCK_TEMPLATES } from '../constants/settings';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import SettingsContent from '../components/SettingsContent';
import ChatWidget from '../components/ChatWidget';

export default function Templates() {
  const [activeSection, setActiveSection] = useState('Templates');
  const { userName } = useUser();
  const [templates] = useState(MOCK_TEMPLATES);

  const handleAddTemplate = () => {
    // TODO: Implementar lógica para agregar template
    console.log('Add template clicked');
  };

  const handleAddFolder = () => {
    // TODO: Implementar lógica para agregar folder
    console.log('Add folder clicked');
  };

  return (
    <div className="settings-layout">
      <SettingsSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={userName}
      />

      <main className="settings-main">
        <SettingsHeader 
          title="Templates"
          actionLabel="Add a Template"
          onAction={handleAddTemplate}
        />

        <SettingsContent 
          templates={templates}
          onAddFolder={handleAddFolder}
        />
      </main>

      <ChatWidget />
    </div>
  );
}

