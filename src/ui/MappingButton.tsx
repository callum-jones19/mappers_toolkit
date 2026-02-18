import type { ReactNode } from "react";

export interface MappingButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
{
  children: ReactNode | string;
  isActive?: boolean;
}

export default function MappingButton({ isActive, children, ...buttonProps }: MappingButtonProps) {
  return (
    <button
      className={`w-full p-1 disabled:bg-neutral-400 disabled:text-neutral-600 disabled:cursor-not-allowed ${
        isActive ? "bg-blue-600 text-white font-semibold" : "hover:bg-neutral-200"
      }`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
