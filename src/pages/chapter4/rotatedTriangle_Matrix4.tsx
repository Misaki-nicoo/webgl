import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'rotatedTriangle_Matrix4';

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    // 变换矩阵实现平移及旋转
    uniform mat4 u_xformMatrix;

    void main() {
      gl_Position = u_xformMatrix * a_Position;
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

    const ANGLE = 90.0;

    // 缩放
    const xformMatrix = new Matrix4();
    xformMatrix.setRotate(ANGLE, 0, 0, 1);

    const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');

    if (!u_xformMatrix) {
      console.log('Failed to get u_xformMatrix location');
      return;
    }

    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  function initVertexBuffer(gl: WebGL2RenderingContext): number {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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
