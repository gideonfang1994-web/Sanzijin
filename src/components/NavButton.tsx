
import React from 'react';

interface NavButtonProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, color }) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${active ? 'scale-110 -translate-y-2' : 'opacity-40 grayscale'}`}>
    <div className={`p-3 rounded-2xl ${active ? color.replace('text', 'bg').replace('500', '100') + ' ' + color : 'text-slate-500'}`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
    </div>
    <span className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default NavButton;
