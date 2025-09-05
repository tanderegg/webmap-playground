import React, {useState, useEffect, useCallback, useRef} from "react";

import {MapViewState, DeckProps} from "@deck.gl/core";
import {MapboxOverlay} from "@deck.gl/mapbox";
import {PMTilesSource} from '@loaders.gl/pmtiles';
import {GeoJsonLayer} from '@deck.gl/layers';

import {
  Map,
  Source,
  Layer,
  useControl,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Popup
} from "react-map-gl/maplibre";
import { CircleLayer, LineLayer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

// Custom Layer Types
import {TileSourceLayer} from '@/layers/tile-source-layer'

// Basemap style
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

// PowerWatch Dataset Style
const powerwatchStyle: CircleLayer = {
  id: "powerwatch-layer",
  type: "circle",
  source: "powerwatch",
  "source-layer": "default",
  paint: {
    "circle-radius": [
      "interpolate",
      ['linear'],
      ["zoom"],
      0,
      [ "+", 0.1,
        [ "/", ["sqrt", ["/", ["get", "capacity_mw"], ["pi"]]], 20 ]
      ],
      12,
      [
        "+", 4,
        [ "/", [ "sqrt", [ "/", [ "get", "capacity_mw" ], ["pi"] ] ], 3 ]
      ]
    ],
    "circle-color": [
      "match",
      ["get", "primary_fuel"],
      "Gas", "rgb(188, 128, 189)",
      "Oil", "rgb(177, 89, 40)",
      "Hydro", "rgb(31, 120, 180)",
      "Nuclear", "rgb(227, 26, 28)",
      "Solar", "rgb(255, 127, 0)",
      "Waste", "rgb(106, 61, 154)",
      "wind", "rgb(92, 162, 209)",
      "Geothermal", "rgb(253, 191, 111)",
      "Biomass", "rgb(34, 154, 0)",
      "rgb(178, 223, 138)"
    ],
    "circle-opacity": 0.7
  }
}

// GADM Style
const gadmStyle: LineLayer = {
  id: "gadm-layer",
  type: "line",
  source: "gadm",
  "source-layer": "default",
  paint: {
    "line-color": "#FF0000"
  }
};

// Test CQL2 query
const cql2Query = `country = 'FRA'`

// Main "WRI Map" component
const WRIMap = () => {
  const mapRef = useRef(null);
  const [plantPopupInfo, setPlantPopupInfo] = useState(null);
  const [layers, setLayers] = useState([]);
  const [cursor, setCursor] = useState<string>('auto');

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -1.7138671,
    latitude: 42.0003167,
    zoom: 4
  });

  const mapClick = useCallback((e) => {
    const feature = e.features && e.features[0];
    if (feature) {
      setPlantPopupInfo({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        ...e.features[0].properties
      })
    };
  }, []);

  const mouseEnter = useCallback(() => setCursor('pointer'), []);
  const mouseLeave = useCallback(() => setCursor('auto'), []);
  
  function DeckGLOverlay(props: DeckProps) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
  };

  //let [tclMetadata, setTclMetadata] = useState(null);
  //let metadata = null;

  const worldLayer = new GeoJsonLayer({
    id: 'world-layer',
    data: '../world.geo.json',
    opacity: 0.5,
    stroked: true,
    filled: true,
    pickable: true,
    extruded: true,
    getLineColor: d => d.properties.mapColor8,
    getLineWidth: 1
  });

  /*let euroCropLayerSource = new PMTilesSource({
    url: 'https://s3.us-west-2.amazonaws.com/us-west-2.opendata.source.coop/cholmes/eurocrops/eurocrops-all.pmtiles',
    attributions: ['https://beta.source.coop/repositories/cholmes/eurocrops/description/'],
    loadOptions: {tilejson: {maxValues: 10}}
  });

  const euroCropLayer = new TileSourceLayer({
    id: 'EuroCropLayer',
    tileSource: euroCropLayerSource
  });*/

  useEffect(() => {
    const updateDeckGLLayers = async () => {
      //tclLayer = await getTCLLayer()
      setLayers([
        // worldLayer,
        // tclLayer, - Doesn't work
        // euroCropLayer - Causes crashes
      ]);
    }

    if (layers.length === 0) {
      updateDeckGLLayers().catch(console.error);
    }
  }, [viewState]);

  /*const onViewStateChange = ({ viewState }) => {
    setViewState(viewState);
  }*/

  return (
    <Map
      ref={mapRef}
      initialViewState={viewState}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      cursor={cursor} // Redundant because DeckGL owns the mouse, but needed if I remove the DeckGLOverlay
      onClick={mapClick}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      interactiveLayerIds={['powerwatch-layer']}
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />

      {plantPopupInfo && (
        <Popup
          anchor="top"
          longitude={Number(plantPopupInfo.longitude)}
          latitude={Number(plantPopupInfo.latitude)}
          onClose={() => setPlantPopupInfo(null)}
        >
          <div>
            <h2>Country</h2>
            {plantPopupInfo.country}
            <h2>Name</h2>
            {plantPopupInfo.name}
            <h2>Fuel Type</h2>
            {plantPopupInfo.primary_fuel}
            <h2>Owner</h2>
            {plantPopupInfo.owner || '-'}
            <h2>Capacity</h2>
            {plantPopupInfo.capacity_mw}
            <h2>Data Source</h2>
            {plantPopupInfo.source}
            <h2>Reported Generation (2018)</h2>
            {plantPopupInfo.generation_gwh_2018 || 'Unknown'}
            <h2>Estimated Generation (2017)</h2>
            {plantPopupInfo.estimated_generation_gwh_2017 || 'Unknown'}
          </div>
        </Popup>
      )}

      <Source
        id="powerwatch"
        type="vector"
        tiles={["https://eoapi.datalab.foo/vector/collections/public.powerwatch_data_20180102/tiles/WebMercatorQuad/{z}/{x}/{y}?filter="+encodeURIComponent(cql2Query)]}
        minzoom={0}
        maxzoom={14}
      >
        <Layer {...powerwatchStyle} />
      </Source>

      <Source
        id="gadm"
        type="vector"
        tiles={["https://eoapi.datalab.foo/vector/collections/public.gadm/tiles/WebMercatorQuad/{z}/{x}/{y}"]}
      >
        <Layer {...gadmStyle} />
      </Source>

      <DeckGLOverlay
        getCursor={() => cursor}
        layers={layers}
        interleaved
      />
    </Map>
  );
}

export {
  WRIMap,
};