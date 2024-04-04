import React from 'react';
import { useState } from "react";

import DeckGL from "@deck.gl/react";
import {GeoJsonLayer} from '@deck.gl/layers';
import {MapView} from '@deck.gl/core';

import Map from "react-map-gl";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MyMap() {
  const [viewState, setViewState] = useState({
    longitude: -122.41669,
    latitude: 37.7853,
    zoom: 14,
    pitch: 0,
    bearing: 0
  });

  const style = {
    "version": 8,
    "sources": {
      "osm": {
        "type": "raster",
        "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
        "tileSize": 256,
        "attribution": "&copy; OpenStreetMap Contributors",
        "maxzoom": 19
      }
    },
    "layers": [
      {
        "id": "osm",
        "type": "raster",
        "source": "osm" // This must match the source key above
      }
    ]
  };

  const data = [
    {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
  ];

  const worldLayer = new GeoJsonLayer({
    id: 'world-layer',
    data: '../world.geo.json',
    opacity: 0.5,
    stroked: true,
    filled: true,
    pickable: true,
    extruded: true,
    getLineColor: d => colorToRGBArray(d.properties.mapColor8),
    getLineWidth: 1
  });

  const layers = [
    worldLayer
  ];

  return (
    <DeckGL 
      viewState={viewState}
      onViewStateChange={({ viewState }) => setViewState(viewState)}
      controller={true}
      layers={layers}
    >
      <Map
        mapLib={maplibregl}
        mapStyle={style}
      />
    </DeckGL>
  );
}