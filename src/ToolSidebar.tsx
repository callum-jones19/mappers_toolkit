import { HelpCircle } from "react-feather";
import MappingButton from "./ui/MappingButton";
import type { ActiveAction } from "./App";

export interface ToolSidebarProps {
	activeAction: ActiveAction;
	onChangeActiveAction: (newActiveAction: ActiveAction) => void;
}

export default function ToolSidebar({
	activeAction,
	onChangeActiveAction
}: ToolSidebarProps) {
	return (
		<>
        <div id="tools-section" className="w-90 flex flex-col relative border-r border-neutral-400">
          <div className="bg-neutral-100 py-2 px-1 h-12 w-full border-b border-neutral-400 flex flex-row justify-between items-center">
            <p className="font-bold">Actions</p>
          </div>
          <div className="w-full h-full flex flex-col gap-2 overflow-auto p-2">
            <div className="bg-neutral-100 p-2 rounded-sm flex flex-col gap-1">
              <div className="border-b border-neutral-300 header-row flex flex-row justify-between items-center py-1">
                <h3 className="font-semibold">Add</h3>
								<HelpCircle
									className="font-normal h-4 text-neutral-500"
								/>
              </div>
              <MappingButton
                isActive={activeAction === "AddPoint"}
                onClick={() => {
                  if (activeAction === "AddPoint") {
                    onChangeActiveAction("Pan");
                  } else {
                    onChangeActiveAction("AddPoint");
                  }
                }}
              >
                Add point
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddLine"}
                onClick={() => {
                  if (activeAction === "AddLine") {
                    onChangeActiveAction("Pan");
                  } else {
                    onChangeActiveAction("AddLine");
                  }
                }}
              >
                Add line
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddGeojson"}
                onClick={() => {
                  if (activeAction === "AddGeojson") {
                    onChangeActiveAction("Pan");
                  } else {
                    onChangeActiveAction("AddGeojson");
                  }
                }}
              >
                Add GeoJSON
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddWKT"}
                onClick={() => {
                  if (activeAction === "AddWKT") {
                    onChangeActiveAction("Pan");
                  } else {
                    onChangeActiveAction("AddWKT");
                  }
                }}
              >
                Add Wellknown Text (WKT)
              </MappingButton>
            </div>
          </div>
        </div>

		</>
	)
}
