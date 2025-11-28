'use client';

export default function Tabs({ activeTab, onTabChange }) {
  const tabs = ['HTML', 'CSS', 'Data'];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

