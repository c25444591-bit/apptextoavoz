import { useEffect, useRef } from 'react';

interface NoScrollWrapperProps {
  children: React.ReactNode;
}

export const NoScrollWrapper: React.FC<NoScrollWrapperProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Forzar sin scroll horizontal
    const enforceNoScroll = () => {
      container.style.overflowX = 'hidden';
      container.style.maxWidth = '100vw';
      container.style.width = '100%';
      
      // Aplicar a todos los hijos
      const children = container.querySelectorAll('*');
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          if (child.scrollWidth > child.clientWidth) {
            child.style.overflowX = 'hidden';
            child.style.maxWidth = '100%';
          }
        }
      });
    };

    enforceNoScroll();

    // Re-aplicar cada vez que cambie el contenido
    const observer = new MutationObserver(enforceNoScroll);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Re-aplicar en resize
    window.addEventListener('resize', enforceNoScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', enforceNoScroll);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="overflow-x-hidden max-w-full w-full"
      style={{ overflowX: 'hidden', maxWidth: '100vw', width: '100%' }}
    >
      {children}
    </div>
  );
};