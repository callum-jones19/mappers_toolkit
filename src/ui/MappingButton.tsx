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
        isActive ? "bg-blue-300 hover:bg-blue-400" : "bg-neutral-200 hover:bg-neutral-400"
      }`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
