'use client';

export default function SettingsHeader({ title, actionLabel, onAction }) {
  return (
    <div className="settings-header">
      <h1 className="settings-title">{title}</h1>
      {actionLabel && (
        <button className="add-template-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

