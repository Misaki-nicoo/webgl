import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'lookAtTriangles';

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    // uniform mat4 u_ViewMatrix;
    // uniform mat4 u_ModelMatrix;
    uniform mat4 u_ModelViewMatrix;
    varying vec4 v_Color;

    void main() {
      // gl_Position = u_ViewMatrix * u_ModelMatrix * a_Position;
      gl_Position = u_ModelViewMatrix * a_Position;
      v_Color = a_Color;
    }
    `;
    const FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;

    void main() {
      gl_FragColor = v_Color;
    }
    `;
    const canvas = document.getElementById(id);
    if (!canvas) return;
    // @ts-ignore
    const gl = canvas.getContext('webgl');
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to initialize shaders.');
      return;
    }

    const n: number = initVertexBuffer(gl);
    if (n < 0) {
      console.log('Failed to set the positions of the vertices.');
      return;
    }

    // const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    // const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    // if (!u_ViewMatrix || !u_ModelMatrix) {
    //   console.log("Failed to get v_ViewMatrix location.");
    //   return;
    // }

    const u_ModelViewMatrix = gl.getUniformLocation(
      gl.program,
      'u_ModelViewMatrix',
    );
    if (!u_ModelViewMatrix) {
      console.log('Failed to get u_ModelViewMatrix location.');
      return;
    }
    // const viewMatrix = new Matrix4();
    // viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    //
    // const modelMatrix = new Matrix4();
    // modelMatrix.setRotate(-10, 0, 0, 1);

    // const modelViewMatrix = viewMatrix.multiply(modelMatrix);
    const modelViewMatrix = new Matrix4();
    modelViewMatrix
      .setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0)
      .rotate(-10, 0, 0, 1);

    // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    // gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  function initVertexBuffer(gl: WebGLRenderingContext): number {
    const verticesColors = new Float32Array([
      0.0,
      0.5,
      -0.4,
      0.4,
      1.0,
      0.4,
      -0.5,
      -0.5,
      -0.4,
      0.4,
      1.0,
      0.4,
      0.5,
      -0.5,
      -0.4,
      1.0,
      0.4,
      0.4,

      0.5,
      0.4,
      -0.2,
      1.0,
      0.4,
      0.4,
      -0.5,
      0.4,
      -0.2,
      1.0,
      1.0,
      0.4,
      0,
      -0.6,
      -0.2,
      1.0,
      1.0,
      0.4,

      0.0,
      0.5,
      0.0,
      0.4,
      0.4,
      1.0,
      -0.5,
      -0.5,
      0.0,
      0.4,
      0.4,
      1.0,
      0.5,
      -0.5,
      0.0,
      1.0,
      0.4,
      0.4,
    ]);
    const n = 9;
    const VERTICESCOLORS = verticesColors.BYTES_PER_ELEMENT;

    const vertexBuffer: WebGLBuffer | null = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object.');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    // @ts-ignore
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // @ts-ignore
    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0 || a_Color < 0) {
      console.log('Failed to get location.');
      return -1;
    }

    gl.vertexAttribPointer(
      a_Position,
      3,
      gl.FLOAT,
      false,
      VERTICESCOLORS * 6,
      0,
    );
    gl.vertexAttribPointer(
      a_Color,
      3,
      gl.FLOAT,
      false,
      VERTICESCOLORS * 6,
      VERTICESCOLORS * 2,
    );
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    return n;
  }
  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
