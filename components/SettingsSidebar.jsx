'use client';
import { NAVIGATION_ITEMS } from '../constants/settings';
import { ChevronRightIcon, ArrowUpIcon, FileTextIcon, MessageIcon } from './Icons';

export default function SettingsSidebar({ activeSection, onSectionChange, userName }) {

  return (
    <aside className="settings-sidebar">
      <div className="sidebar-user">
        <span className="user-name">{userName}</span>
        <ChevronRightIcon className="user-arrow" />
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = item.Icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">
                <IconComponent />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="upgrade-btn">
          <ArrowUpIcon className="upgrade-icon" />
          <span>UPGRADE NOW!</span>
        </button>
        <button className="footer-link">
          <FileTextIcon className="footer-icon" />
          <span>Documentation</span>
        </button>
        <button className="footer-link">
          <MessageIcon className="footer-icon" />
          <span>What's new?</span>
          <span className="notification-badge">5</span>
        </button>
      </div>
    </aside>
  );
}

