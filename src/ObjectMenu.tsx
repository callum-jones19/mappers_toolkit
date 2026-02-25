import { Eye, X } from "react-feather";

export interface ObjectMenuProps {
  objects: any;
  onDeleteObject: (deletedObject: unknown) => void;
  onHideObject: (hiddenObject: unknown, hidden: boolean) => void;
  onRenameObject: (updatedObject: unknown) => void;
}

export default function ObjectMenu({ objects }: ObjectMenuProps) {
  return (
    <>
      <div className="w-full h-40 bg-neutral-100 rounded-sm">
        <h2 className="w-full p-1 font-bold text-neutral-700 border-b border-b-neutral-400">Objects</h2>
        <div className="h-56 flex flex-col grow-0 overflow-auto pr-1 text-xs">
          <div className="w-full flex flex-row justify-between items-center p-1 border-b border-neutral-200 hover:bg-neutral-100">
            <p>point_1</p>
            <div className="flex flex-row gap-1">
              <button className="hover:text-blue-500">
                <Eye className="h-4" />
              </button>
              <button className="hover:text-blue-500">
                <X className="h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
