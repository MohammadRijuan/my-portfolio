import Pager from '@/components/Pager';
import Home from '@/components/pages/Home';
import About from '@/components/pages/About';
import Projects from '@/components/pages/Projects';
import Skills from '@/components/pages/Skills';
import Experience from '@/components/pages/Experience';
import Contact from '@/components/pages/Contact';

export default function Page() {
  return (
    <Pager pages={[
      { id: 'home', label: 'Home', node: <Home /> },
      { id: 'about', label: 'About', node: <About /> },
      { id: 'projects', label: 'Projects', node: <Projects /> },
      { id: 'skills', label: 'Skills', node: <Skills /> },
      { id: 'experience', label: 'Experience', node: <Experience /> },
      { id: 'contact', label: 'Contact', node: <Contact /> },
    ]} />
  );
}
