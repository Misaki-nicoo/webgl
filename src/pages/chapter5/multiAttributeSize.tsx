import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';

export default function() {
  const id = 'multiAttributeSize';

  useEffect(() => {
    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      attribute float a_PointSize;

      void main() {
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
      }
    `;
    const FSHADER_SOURCE = `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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

    gl.drawArrays(gl.POINTS, 0, n);
  });

  function initVertexBuffer(gl: WebGL2RenderingContext): number {
    const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    const n = 3;
    const sizes = new Float32Array([10.0, 20.0, 30.0]);

    const vertexBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();

    if (!vertexBuffer || !sizeBuffer) {
      console.log('Failed to create Buffer.');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // @ts-ignore
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get a_Position location.');
      return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    // @ts-ignore
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_PointSize < 0) {
      console.log('Failed to get a_PointSize location.');
      return -1;
    }
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
  }
  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
