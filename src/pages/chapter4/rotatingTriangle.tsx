import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'rotatingTriangle';
  let g_last = Date.now();
  let ANGLE_STEP: number = 45.0;

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;

    void main() {
      gl_Position = u_ModelMatrix * a_Position;
    }
    `;
    const FSHADER_SOURCE = `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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

    // @ts-ignore
    const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

    if (!u_ModelMatrix) {
      console.log('Failed to get u_ModelMatrix location');
      return;
    }

    gl.clearColor(0, 0, 0, 1.0);

    const modelMatrix = new Matrix4();
    let currentAngle: number = 0.0;

    const tick = function() {
      currentAngle = animate(currentAngle);
      draw(gl, u_ModelMatrix, n, currentAngle, modelMatrix);
      requestAnimationFrame(tick);
    };
    tick();
  }, []);

  function animate(angle: number): number {
    const now = Date.now();
    const elapsed = now - g_last;
    g_last = now;
    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000;
    return newAngle % 360;
  }

  function draw(
    gl: WebGLRenderingContext,
    u_ModelMatrix: WebGLUniformLocation,
    n: number,
    currentAngle: number,
    modelMatrix: Matrix4,
  ) {
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    modelMatrix.translate(0.35, 0, 0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  function initVertexBuffer(gl: WebGLRenderingContext): number {
    const vertices = new Float32Array([0, 0.2, -0.2, -0.2, 0.2, -0.2]);
    const n = 3;

    const vertexBuffer: WebGLBuffer | null = gl.createBuffer();

    if (!vertexBuffer) {
      console.log('Failed to create the buffer object.');
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
    return n;
  }
  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
