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
      className={`text-start w-full px-1 py-2 disabled:bg-white disabled:italic disabled:text-neutral-600 disabled:cursor-not-allowed ${
        isActive ? "bg-blue-600 text-white font-semibold" : "hover:bg-blue-600 hover:text-blue-100"
      }`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
