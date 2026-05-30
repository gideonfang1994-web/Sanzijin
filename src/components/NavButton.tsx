
import React from 'react';

interface NavButtonProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, color }) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${active ? 'scale-105 -translate-y-1' : 'opacity-75 hover:opacity-100'}`}>
    <div className={`p-2.5 rounded-2xl ${active ? color.replace('text', 'bg').replace('500', '100') + ' ' + color : 'text-slate-400 hover:text-slate-600'}`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
    </div>
    <span className={`text-[10px] font-black mt-1 uppercase tracking-tight leading-none ${active ? color + ' font-black' : 'text-slate-400 font-bold'}`}>{label}</span>
  </button>
);

export default NavButton;
