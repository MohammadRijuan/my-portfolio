'use client';
import { useState } from 'react';
import { TokenCtx, ToastCtx } from '@/components/admin/context';
import { useAdmin } from '@/components/admin/useAdmin';
import { Section } from '@/components/admin/types';
import Login from '@/components/admin/Login';
import Toasts from '@/components/admin/Toasts';
import { AdminTitle, MobileNav, Sidebar } from '@/components/admin/Navigation';
import Dashboard from '@/components/admin/sections/Dashboard';
import SiteContent from '@/components/admin/sections/SiteContent';
import ThemeSection from '@/components/admin/sections/ThemeSection';
import ProjectsSection from '@/components/admin/sections/ProjectsSection';
import SkillsSection from '@/components/admin/sections/SkillsSection';
import ExperienceSection from '@/components/admin/sections/ExperienceSection';
import MessagesSection from '@/components/admin/sections/MessagesSection';

/** Private CMS. State lives in useAdmin; each section is its own component under components/admin/sections. */
export default function Admin() {
  const admin = useAdmin();
  const [section, setSection] = useState<Section>('dashboard');

  if (!admin.isReady) return null;
  if (!admin.token) return <Login onLogin={admin.login} />;

  return (
    <TokenCtx.Provider value={admin.token}>
      <ToastCtx.Provider value={admin.showToast}>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-[1440px]">
            <Sidebar section={section} stats={admin.stats} onSelect={setSection} onLogout={admin.logout} />
            <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 pb-28 md:pb-10 max-w-6xl">
              <AdminTitle section={section} onLogout={admin.logout} />
              {section === 'dashboard' && <Dashboard stats={admin.stats} goTo={setSection} newProject={admin.setProjectForm} />}
              {section === 'settings' && <SiteContent admin={admin} />}
              {section === 'theme' && <ThemeSection admin={admin} />}
              {section === 'projects' && <ProjectsSection admin={admin} />}
              {section === 'skills' && <SkillsSection admin={admin} />}
              {section === 'experience' && <ExperienceSection admin={admin} />}
              {section === 'messages' && <MessagesSection admin={admin} />}
            </main>
          </div>
          <MobileNav section={section} stats={admin.stats} onSelect={setSection} />
          <Toasts toasts={admin.toasts} onDismiss={admin.dismissToast} />
        </div>
      </ToastCtx.Provider>
    </TokenCtx.Provider>
  );
}
