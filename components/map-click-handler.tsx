"use client";

import { useState } from "react";
import { useMapEvents, Popup, CircleMarker } from "react-leaflet";
import { LatLng } from "leaflet";

export default function MapClickHandler() {
	const [position, setPosition] = useState<LatLng | null>(null);

	useMapEvents({
		click(e) {
			setPosition(e.latlng);
		},
	});

	return position === null ? null : (
		<CircleMarker center={position} radius={5} color="red">
			<Popup>
				<div className="text-sm font-mono p-1">
					<div>Lat: {position.lat.toFixed(6)}</div>
					<div>Lng: {position.lng.toFixed(6)}</div>
				</div>
			</Popup>
		</CircleMarker>
	);
}
