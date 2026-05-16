'use client';

import { useEffect, useState } from 'react';

const tabs = [
  { id: 'textbook', label: 'Textbook' },
  { id: 'lectures', label: 'Lectures' },
  { id: 'readings', label: 'Readings' },
];

export function LibraryTabs() {
  const [activeTab, setActiveTab] = useState('textbook');

  useEffect(() => {
    const updateFromScroll = () => {
      const anchorY = 132;
      let current = 'textbook';

      for (const tab of tabs) {
        const section = document.getElementById(tab.id);
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top <= anchorY) {
          current = tab.id;
        }
      }

      setActiveTab(current);
    };

    let animationFrame = 0;
    const queueScrollUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        updateFromScroll();
        animationFrame = 0;
      });
    };

    queueScrollUpdate();
    window.addEventListener('hashchange', queueScrollUpdate);
    window.addEventListener('scroll', queueScrollUpdate, { passive: true });

    return () => {
      window.removeEventListener('hashchange', queueScrollUpdate);
      window.removeEventListener('scroll', queueScrollUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <nav aria-label="Course materials sections" className="library-tabs">
      <div className="container library-tabs-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <a
              aria-current={isActive ? 'true' : undefined}
              href={`#${tab.id}`}
              key={tab.id}
            >
              {tab.label}
              {isActive ? <span className="library-tab-indicator" /> : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
