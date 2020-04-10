import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'lookAtTrianglesWithKeys';
  let g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25;

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;

    void main() {
      gl_Position = u_ViewMatrix * a_Position;
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

    const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log("Failed to get u_ModelViewMatrix location.");
      return;
    }
    const viewMatrix = new Matrix4();

    document.onkeydown = ev => {
      keydown(ev, gl, n, u_ViewMatrix, viewMatrix)
    };
    gl.clearColor(0, 0, 0, 1.0);

    draw(gl, n, u_ViewMatrix, viewMatrix);
  }, []);

  function initVertexBuffer(gl: WebGL2RenderingContext): number {
    const verticesColors = new Float32Array([
      0, 0.5, -0.4, 0.4, 1.0, 0.4,
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
      -0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
      0.0, 0.6, -0.2, 1.0, 1.0, 0.4,

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4
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

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, VERTICESCOLORS * 3, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, VERTICESCOLORS * 3, VERTICESCOLORS * 2);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    return n;
  }

  function keydown(ev: KeyboardEvent, gl: WebGL2RenderingContext, n: number, u_viewMatrix: WebGLUniformLocation, viewMatrix: Matrix4) {
    if (ev.keyCode == 39) {
      g_eyeX += 0.01
    } else if (ev.keyCode == 37) {
      g_eyeX -= 0.01
    } else {
      return;
    }
    draw(gl, n, u_viewMatrix, viewMatrix)
  }

  function draw(gl: WebGL2RenderingContext, n: number, u_viewMatrix: WebGLUniformLocation, viewMatrix: Matrix4) {
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 0, 1);
    gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
