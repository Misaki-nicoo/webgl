import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';

export default function() {
  const id = 'triangle_FragColor';

  useEffect(() => {
    const VSHADER_SOURCE = `
      attribute vec4 a_Position;

      void main() {
        gl_Position = a_Position;
        gl_PointSize = 10.0;
      }
    `;
    const FSHADER_SOURCE = `
      precision mediump float;
      uniform float u_Width;
      uniform float u_Height;

      void main() {
        // gl_FragColor = v_Color;
        gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
      }
    `;
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.log("can't found element canvas");
      return;
    }
    // @ts-ignore
    const gl = canvas.getContext('webgl');
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to initialize shaders.');
      return;
    }

    const n = initVertexBuffer(gl);
    if (n < 0) {
      return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, n);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    // gl.drawArrays(gl.LINE_STRIP, 0, n);
    // gl.drawArrays(gl.LINE_LOOP, 0, n);
  });

  function initVertexBuffer(gl: WebGL2RenderingContext): number {
    const verticesSizes = new Float32Array([
      0.0,
      0.5,
      1.0,
      0.0,
      0.0,
      -0.5,
      -0.5,
      0.0,
      1.0,
      0.0,
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0,
    ]);
    const n = 3;

    const vertexBuffer = gl.createBuffer();

    if (!vertexBuffer) {
      console.log('Failed to create Buffer.');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    const FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    // @ts-ignore
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get a_Position location.');
      return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    // @ts-ignore
    const u_Width = gl.getUniformLocation(gl.program, 'u_Width');
    // @ts-ignore
    const u_Height = gl.getUniformLocation(gl.program, 'u_Height');
    if (!u_Width || !u_Height) {
      console.log('Failed to get uniform location.');
      return -1;
    }
    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);

    return n;
  }
  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
