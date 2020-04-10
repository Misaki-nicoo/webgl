import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'orthoView';
  let g_near = 0.0, g_far = 0.5;

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix;
    varying vec4 v_Color;

    void main() {
      gl_Position = u_ProjMatrix * a_Position;
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
    const nf = document.getElementById('nearFar');
    if (!canvas || !nf) return;
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

    const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
      console.log("Failed to get u_ProjMatrix location.");
      return;
    }
    const projMatrix = new Matrix4();

    document.onkeydown = ev => {
      keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf)
    };
    gl.clearColor(0, 0, 0, 1.0);

    draw(gl, n, u_ProjMatrix, projMatrix, nf);
  }, []);

  function initVertexBuffer(gl: WebGL2RenderingContext): number {
    const verticesColors = new Float32Array([
      0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
      -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
      0, -0.6, -0.2, 1.0, 1.0, 0.4,

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ]);
    const n = verticesColors.length / 6;
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

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, VERTICESCOLORS * 6, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, VERTICESCOLORS * 6, VERTICESCOLORS * 2);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    return n;
  }

  function keydown(ev: KeyboardEvent, gl: WebGL2RenderingContext, n: number, u_viewMatrix: WebGLUniformLocation, viewMatrix: Matrix4, nf: HTMLElement) {
    switch (ev.keyCode) {
      case 39: g_near += 0.01; break; // right
      case 37: g_near -= 0.01; break; // left
      case 38: g_far += 0.01; break; // up
      case 40: g_far -= 0.01; break; // down
    }
    draw(gl, n, u_viewMatrix, viewMatrix, nf)
  }

  function draw(gl: WebGL2RenderingContext, n: number, u_viewMatrix: WebGLUniformLocation, projMatrix: Matrix4, nf: HTMLElement) {
    projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);
    gl.uniformMatrix4fv(u_viewMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    nf.innerHTML = `near: ${Math.round(g_near * 100) / 100}, far: ${Math.round(g_far * 100) / 100}`
  }

  return <div style={{width: '100%', height: '100%', position: 'relative'}}>
    <canvas id={id} style={{ width: '100%', height: '100%' }} />
    <p id={'nearFar'} style={{position: 'absolute', top: 10, width: '100%', padding: 10, color: '#fff'}}>near far value:</p>
  </div>
}
