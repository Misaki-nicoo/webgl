import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';

export default function() {
  const id = 'rotatedTriangle';

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    // uniform float u_CosB, u_SinB;
    // uniform vec2 u_CosBSinB;
    // 变换矩阵实现平移及旋转
    uniform mat4 u_xformMatrix;

    void main() {
      // gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
      // gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;

      // gl_Position.x = a_Position.x * u_CosBSinB.x - a_Position.y * u_CosBSinB.y;
      // gl_Position.y = a_Position.x * u_CosBSinB.y + a_Position.y * u_CosBSinB.x;
      //
      // gl_Position.z = a_Position.z;
      // gl_Position.w = 1.0;

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

    // const ANGLE = 90.0;
    // const radian = (Math.PI * ANGLE) / 180.0;
    // const cosB = Math.cos(radian);
    // const sinB = Math.sin(radian);
    // 平移的变量
    // const Tx = 0.5, Ty = 0.5, Tz = 0.0;
    // 缩放的变量, 纵坐标拉长
    const Sx = 1.0,
      Sy = 1.5,
      Sz = 1.0;

    // webGL 与 openGL一样，矩阵元素是按列主序存储在数组中的, 如以下 3X3 矩阵
    // [ 1, 2, 3, ]
    // | 4, 5, 6, |
    // [ 7, 8, 9, ]
    // 在数组中的存储顺序是[ 1, 4, 7, 2, 5, 8, 3, 6, 9,]
    // 旋转
    // const xformMatrix = new Float32Array([
    //   cosB, sinB, 0.0, 0.0,
    //   -sinB, cosB, 0.0, 0.0,
    //   0.0, 0.0, 1.0, 0.0,
    //   0.0, 0.0, 0.0, 1.0
    // ]);
    //
    // 平移
    // const xformMatrix = new Float32Array([
    //   1.0, 0.0, 0.0, 0.0,
    //   0.0, 1.0, 0.0, 0.0,
    //   0.0, 0.0, 1.0, 0.0,
    //   Tx, Ty, Tz, 1.0
    // ]);
    //
    // 缩放
    const xformMatrix = new Float32Array([
      Sx,
      0.0,
      0.0,
      0.0,
      0.0,
      Sy,
      0.0,
      0.0,
      0.0,
      0.0,
      Sz,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);

    // const u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
    // const u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
    // const u_CosBSinB = gl.getUniformLocation(gl.program, 'u_CosBSinB');
    const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');

    // if (!u_CosB || !u_SinB) {
    // if (!u_CosBSinB) {
    //   console.log('Failed to get u_CosB or u_SinB location.');
    //   return;
    // }

    if (!u_xformMatrix) {
      console.log('Failed to get u_xformMatrix location');
      return;
    }
    // gl.uniform1f(u_CosB, cosB);
    // gl.uniform1f(u_SinB, sinB);
    // gl.uniform2f(u_CosBSinB, cosB, sinB);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  function initVertexBuffer(gl: WebGLRenderingContext): number {
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
