import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'helloCubes';

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix; // 计算后的矩阵
    varying vec4 v_Color;

    void main() {
      gl_Position = u_MvpMatrix * a_Position;
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

    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      console.log('Failed to get u_MvpMatrix location.');
      return;
    }

    const modelMatrix = new Matrix4();
    const viewMatrix = new Matrix4();
    const projMatrix = new Matrix4();
    modelMatrix.setTranslate(0.75, 0.0, 0.0);
    viewMatrix.setLookAt(0.0, 0.0, 5.0, 0.0, 0.0, -100.0, 0.0, 1.0, 0.0);
    projMatrix.setPerspective(
      30,
      canvas.clientWidth / canvas.clientHeight,
      1,
      100,
    );

    gl.clearColor(0, 0, 0, 1.0);
    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);

    const mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }, []);

  function initVertexBuffer(gl: WebGLRenderingContext): number {
    const verticesColors = new Float32Array([
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0, //v0 white
      -1.0,
      1.0,
      1.0,
      1.0,
      0.0,
      1.0, //v1 品红
      -1.0,
      -1.0,
      1.0,
      1.0,
      0.0,
      0.0, //v2 红色
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      0.0, //v3 黄色
      1.0,
      -1.0,
      -1.0,
      0.0,
      1.0,
      0.0, //v4 绿色
      1.0,
      1.0,
      -1.0,
      0.0,
      1.0,
      1.0, //v5 青色
      -1.0,
      1.0,
      -1.0,
      0.0,
      0.0,
      1.0, //v6 蓝色
      -1.0,
      -1.0,
      -1.0,
      0.0,
      0.0,
      0.0, //v7 黑色
    ]);

    const indices = new Uint8Array([
      0,
      1,
      2,
      0,
      2,
      3, //front
      0,
      3,
      4,
      0,
      4,
      5, //right
      0,
      5,
      6,
      0,
      6,
      1, //up
      1,
      6,
      7,
      1,
      7,
      2, //left
      7,
      4,
      3,
      7,
      3,
      2, //bottom
      4,
      7,
      6,
      4,
      6,
      5, //behind
    ]);

    const VERTICESCOLORS = verticesColors.BYTES_PER_ELEMENT;

    const vertexBuffer: WebGLBuffer | null = gl.createBuffer();
    const indexBuffer: WebGLBuffer | null = gl.createBuffer();
    if (!vertexBuffer || !indexBuffer) {
      console.log('Failed to create the buffer object.');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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
    return indices.length;
  }

  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
