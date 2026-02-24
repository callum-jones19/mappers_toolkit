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
      className={`text-start rounded-sm flex flex-row justify-start items-center text-sm gap-2 w-full px-1 py-2 disabled:italic disabled:outline-none disabled:text-neutral-600 disabled:cursor-not-allowed ${
        isActive ? "bg-blue-500 text-white font-semibold" : "hover:outline-blue-500 hover:outline-2 hover:text-blue-500"
      }`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
