import type { Point } from "./App";

export interface ActionSidebarProps {
	selectedPoint: null | Point;
	onDeletePoint: (targetPoint: Point) => void;
};

export default function ActionSidebar({
	selectedPoint,
	onDeletePoint
}: ActionSidebarProps) {
	return (
		<>
			<div className="w-full h-full flex flex-col gap-2">
        <div className="bg-neutral-100 py-2 px-1 h-12 w-full border-b border-neutral-400 flex flex-row justify-between items-center">
          <p className="font-bold">Context</p>
        </div>
				{selectedPoint !== null &&
					<div className="w-full p-2 flex flex-col gap-4">
						<table className="w-full border">
							<tr className="border">
								<th className="border text-start">Latitude</th>
								<td className="pl-1">{selectedPoint.position.latitude}</td>
							</tr>
							<tr className="border">
								<th className="border text-start">Longitude</th>
								<td className="pl-1">{selectedPoint.position.longitude}</td>
							</tr>
							<tr className="border">
								<th className="border text-start">ID</th>
								<td className="pl-1">{selectedPoint.id}</td>
							</tr>
						</table>

						<button
						  className="bg-red-500 hover:bg-red-600 text-white text-center rounded-sm p-1"
							onClick={() => {
								onDeletePoint(selectedPoint);
							}}
						>
							<p>Delete Point</p>
						</button>
					</div>
				}
			</div>
		</>
	);
}
