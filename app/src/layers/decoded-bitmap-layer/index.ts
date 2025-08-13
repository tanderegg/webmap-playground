import {
  COORDINATE_SYSTEM,
  LayerProps,
  LayerDataSource,
  DefaultProps,
  ExtraPropsT
} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';

import decodeFS from './decoded-bitmap-fragment';

const defaultProps: DefaultProps<DecodedBitmapLayerProps> = {
  decodeParams: {type: 'object', value: {}},
  decodeFunction: {type: 'string', value: null},
  zoom: {type: 'number', value: 0}
};

/** All properties supported by DecodedBitmapLayer. */
export type DecodedBitmapLayerProps<DataT = unknown> = 
  _DecodedBitmapLayerProps<DataT> & LayerProps;

/** Properties added by DecodedBitmapLayer */
type _DecodedBitmapLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The parameters used by the Decode Function.
   */
  decodeParams?: object;

  /**
   * The decode function, a string of GLSL to be inserted into the shader.
   */
  decodeFunction?: string;

  /**
   * The current zoom level;
   */
  zoom?: number;
}

export default class DecodedBitmapLayer extends BitmapLayer<
  ExtraPropsT & Required<_DecodedBitmapLayerProps>> 
  {
  static layerName = 'DecodedBitmapLayer';
  static defaultProps = defaultProps;

  getShaders() {
    const decodeParams = this.props.decodeParams;
    const decodeFunction = this.props.decodeFunction;

    const shaders = super.getShaders();
    shaders.fs = decodeFS.replace(
      '{decodeParams}',
      Object.keys(decodeParams)
        .map((p) => `uniform float ${p};`)
        .join(' '),
    )
    .replace('{decodeFunction}', decodeFunction || '');
    return shaders;
  }

  draw(params) {
    Object.assign(params.uniforms, this.props.decodeParams);

    if (this.props.zoom) {
      params.uniforms.zoom = this.props.zoom;
    }
    super.draw(params);
  }
};