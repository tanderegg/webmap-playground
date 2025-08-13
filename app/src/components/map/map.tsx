import React from 'react';
import { useState, useEffect } from "react";

import {DeckGL} from "@deck.gl/react";
import {MapViewState} from "@deck.gl/core";
import {PMTilesSource, PMTilesMetadata} from '@loaders.gl/pmtiles';

import {GeoJsonLayer} from '@deck.gl/layers';

import Map from "react-map-gl";
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {TileSourceLayer} from '@/layers/tile-source-layer'

/*const callApiDatasetMetadata = async (uuid) => {
  // fetch the API endpoint (GET request)
  const response = await 
  if (!response.ok) {
    throw new Error('RW API Error! status: : ${response.status}')
  }
  console.log("Successful RW API Call.")
  return await response.json();
}*/

const WRIMap = () => {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -1.7138671,
    latitude: 42.0003167,
    zoom: 4,
    pitch: 0,
    bearing: 0
  });

  //let [tclMetadata, setTclMetadata] = useState(null);
  //let metadata = null;

  /*const worldLayer = new GeoJsonLayer({
    id: 'world-layer',
    data: '../world.geo.json',
    opacity: 0.5,
    stroked: true,
    filled: true,
    pickable: true,
    extruded: true,
    getLineColor: d => colorToRGBArray(d.properties.mapColor8),
    getLineWidth: 1
  });*/

  let [layers, setLayers] = useState([]);

  const style = {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap Contributors",
        maxzoom: 19
      }
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm" // This must match the source key above
      }
    ]
  };
  
  const data = [
    {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
  ];

  let euroCropLayerSource = new PMTilesSource({
    url: 'https://s3.us-west-2.amazonaws.com/us-west-2.opendata.source.coop/cholmes/eurocrops/eurocrops-all.pmtiles',
    attributions: ['https://beta.source.coop/repositories/cholmes/eurocrops/description/'],
    loadOptions: {tilejson: {maxValues: 10}}
  });

  //console.log("PMTileSource props: " + JSON.stringify(euroCropLayerSource.props, null, 2));

  const euroCropLayer = new TileSourceLayer({
    id: 'EuroCropLayer',
    tileSource: euroCropLayerSource
  });

  useEffect(() => {
    const updateLayers = async () => {
      //tclLayer = await getTCLLayer()
      setLayers([euroCropLayer]);
      //setLayers([tclLayer, euroCropLayer]);
    }

    const displayEuroCropsLayer = async () => {
      //console.log("PMTileSource metadata: " + JSON.stringify(await euroCropLayerSource.metadata, null, 2));
    }

    displayEuroCropsLayer().catch(console.error);
    updateLayers().catch(console.error);
  }, [viewState]);

  const onViewStateChange = ({ viewState }) => {
    setViewState(viewState);
  }

  return (
    <DeckGL 
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      controller={true}
      layers={layers}
    >
      <Map
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
}

export {
  WRIMap,
};