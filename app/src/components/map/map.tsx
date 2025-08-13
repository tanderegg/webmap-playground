import React from 'react';
import { useState, useEffect } from "react";

import DeckGL from "@deck.gl/react";
import {MapViewState} from "@deck.gl/core";
import DecodedBitmapLayer from '../../layers/decoded-bitmap-layer'
import {TileLayer, TileLayerPickingInfo, GeoBoundingBox} from '@deck.gl/geo-layers';
import {PMTilesSource, PMTilesMetadata} from '@loaders.gl/pmtiles';

import type {GeoJsonLayer} from '@deck.gl/layers';

import Map from "react-map-gl";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// @ts-ignore
import {TileSourceLayer} from '@deck.gl-community/layers'

/*const callApiDatasetMetadata = async (uuid) => {
  // fetch the API endpoint (GET request)
  const response = await 
  if (!response.ok) {
    throw new Error('RW API Error! status: : ${response.status}')
  }
  console.log("Successful RW API Call.")
  return await response.json();
}*/

export default function WRIMap() {

  const decodeFunctions = {
    treeCoverLoss: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;

      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.r * 255.;

      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);

      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        color.r = 220. / 255.;
        color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
        color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
      } else {
        alpha = 0.;
      }
    `
  }

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

  const style = `{
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
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
  }`;
  
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
    const setTCLLayer = async () => {
      const tclID = 'b584954c-0d8d-40c6-859c-f3fdf3c2c5df';
    
      const response = await fetch('https://api.resourcewatch.org/v1/dataset/' + tclID + '?includes=layer,metadata');
      
      if (!response.ok) {
        throw new Error('Failed to get TCL Metadata from RW API.');
      }
    
      const metadata = await response.json();
      //console.log("Response JSON: " + JSON.stringify(metadata, null, 2));
      
      const layerConfig = metadata['data']['attributes']['layer'][0]['attributes']['layerConfig'];
      const defaultParams = layerConfig['params_config'];

      const decodeFunctionName = layerConfig['decode_function'];
      const decodeConfig = layerConfig['decode_config'] || [];
      const decodeFunction = decodeFunctions[decodeFunctionName];

      let url = layerConfig['source']['tiles'][0];

      for (const param of defaultParams) {
        url = url.replace('{' + param['key'] + '}', param['default'].toString());
      }

      // Set decodeParams to default values according to decodeConfig.
      const decodeConfigVars = [];
      for (const param of decodeConfig) {
        decodeConfigVars[param['key']] = param['default'];
      }

      const startDate = new Date(decodeConfigVars['startDate']);
      const startYear = startDate.getFullYear();

      const endDate = new Date(decodeConfigVars['endDate']);
      const endYear = endDate.getFullYear();

      let decodeParams = {
        'startYear': startYear,
        'endYear': endYear
      };

      //console.log("LayerConfig: " + JSON.stringify(layerConfig, null, 2));
      //console.log("URL: " + url);

      const tclLayer = new TileLayer({
        id: 'TCLLayer',
        data: url,
        maxZoom: 22,
        minZoom: 0,
  
        renderSubLayers: props => {
          const {west, north, east, south} = props.tile.bbox as GeoBoundingBox;
  
          return new DecodedBitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
            zoom: viewState.zoom,
            decodeParams: decodeParams,
            decodeFunction: decodeFunction
          });
        },
        pickable: true
      });

      setLayers([]);
      //setLayers([tclLayer, euroCropLayer]);
    }

    const displayEuroCropsLayer = async () => {
      //console.log("PMTileSource metadata: " + JSON.stringify(await euroCropLayerSource.metadata, null, 2));
    }

    displayEuroCropsLayer().catch(console.error);
    setTCLLayer().catch(console.error);
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
        mapStyle={style}
      />
    </DeckGL>
  );
}