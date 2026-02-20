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
      className={`text-start border-b border-neutral-200 flex flex-row justify-start items-center text-sm gap-2 w-full px-1 py-2 disabled:bg-white disabled:italic disabled:text-neutral-600 disabled:cursor-not-allowed ${
        isActive ? "bg-blue-500 text-white font-semibold" : "hover:bg-blue-500 hover:text-blue-50"
      }`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
