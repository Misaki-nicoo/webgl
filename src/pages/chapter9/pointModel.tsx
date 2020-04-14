import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'jointModel';
  const ANGLE_STEP: number = 3.0;
  let g_arm1Angle: number = 90.0;
  let g_jointAngle: number = 0.0;
  let g_modelMatrix: Matrix4 = new Matrix4();
  let g_mvpMatrix: Matrix4 = new Matrix4();
  let g_normalMatrix: Matrix4 = new Matrix4();

  const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal; // 法向量
    uniform mat4 u_MvpMatrix; // 计算后的矩阵
    uniform mat4 u_NormalMatrix; // 用来变换法向量的矩阵
    varying vec4 v_Color;
    varying vec3 v_Normal;

    void main() {
      gl_Position = u_MvpMatrix * a_Position;
      v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
      v_Color = vec4(1.0, 0.4, 0.0, 1.0);
    }
    `;
  const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightColor; // 光线颜色
    uniform vec3 u_LightDirection; // 光源位置，归一化的世界坐标
    uniform vec3 u_AmbientLight; // 环境光颜色
    varying vec4 v_Color;
    varying vec3 v_Normal;

    void main() {
      float nDotL = max(dot(u_LightDirection, v_Normal), 0.0);
      vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
      vec3 ambient = u_AmbientLight * v_Color.rgb;
      gl_FragColor = vec4(diffuse + ambient, v_Color.a);
    }
    `;
  useEffect(() => {
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

    initLight(gl);
    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if ( !u_MvpMatrix || !u_NormalMatrix ) {
      console.log('Failed to get uniform location.');
      return;
    }

    gl.clearColor(0, 0, 0, 1.0);
    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);

    const viewProjMatrix = new Matrix4();
    viewProjMatrix
      .setPerspective(50, canvas.clientWidth / canvas.clientHeight, 1, 100)
      .lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    document.onkeydown = function(ev) {
      keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    };
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  }, []);

  function keydown(
    ev: KeyboardEvent,
    gl: WebGLRenderingContext,
    n: number,
    viewProjMatrix: Matrix4,
    u_MvpMatrix: WebGLUniformLocation,
    u_NormalMatrix: WebGLUniformLocation,
  ) {
    switch (ev.keyCode) {
      case 38: // up
        if (g_jointAngle < 135.0) g_jointAngle += ANGLE_STEP;
        break;
      case 40: // down
        if (g_jointAngle > -135.0) g_jointAngle -= ANGLE_STEP;
        break;
      case 39: // right
        g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
        break;
      case 37: // left
        g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
        break;
      default:
        return;
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  }

  function draw(
    gl: WebGLRenderingContext,
    n: number,
    viewProjMatrix: Matrix4,
    u_MvpMatrix: WebGLUniformLocation,
    u_NormalMatrix: WebGLUniformLocation,
  ) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // arm1
    const arm1Length: number = 10.0;
    g_modelMatrix
      .setTranslate(0.0, -12.0, 0.0)
      .rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    // arm2
    g_modelMatrix
      .translate(0.0, arm1Length, 0.0)
      .rotate(g_jointAngle, 0.0, 0.0, 1.0)
      .scale(1.3, 1.0, 1.3);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  }

  function drawBox(
    gl: WebGLRenderingContext,
    n: number,
    viewProjMatrix: Matrix4,
    u_MvpMatrix: WebGLUniformLocation,
    u_NormalMatrix: WebGLUniformLocation,
  ) {
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_modelMatrix.elements);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  function initLight(gl: WebGLRenderingContext): boolean {
    // @ts-ignore
    const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    // @ts-ignore
    const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection', );
    // @ts-ignore
    const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_LightColor || !u_LightDirection || !u_AmbientLight) {
      console.log('Failed to get uniform location.');
      return false;
    }

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(u_LightDirection, 3.0, 4.0, 5.0);
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
    return true;
  }

  function initVertexBuffer(gl: WebGLRenderingContext): number {
    const vertices = new Float32Array([
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0, //front面 v0-4
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0, //right v0345
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0, //up v0561
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0, //left
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0, //down
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0, //back
    ]);
    //
    // const colors = new Float32Array([
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //front
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //front
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //front
    //   1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
    // ]);

    // const colors = new Float32Array([
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0, //front
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4, //right
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4,
    //   1.0,
    //   0.4,
    //   0.4, //up
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4, //left
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0, //btm
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0,
    //   0.4,
    //   1.0,
    //   1.0, //back
    // ]);

    const indices = new Uint8Array([
      0,
      1,
      2,
      0,
      2,
      3,
      4,
      5,
      6,
      4,
      6,
      7,
      8,
      9,
      10,
      8,
      10,
      11,
      12,
      13,
      14,
      12,
      14,
      15,
      16,
      17,
      18,
      16,
      18,
      19,
      20,
      21,
      22,
      20,
      22,
      23,
    ]);
    const indexBuffer: WebGLBuffer | null = gl.createBuffer();
    if (!indexBuffer) {
      console.log('Failed to create the buffer object.');
      return -1;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    if (!initArrayBuffer(gl, 'a_Position', vertices)) {
      console.log('Failed to initialize a_Position ArrayBuffer.');
      return -1;
    }
    // if (!initArrayBuffer(gl, 'a_Color', colors)) {
    //   console.log('Failed to initialize a_Color Array');
    // }

    // 法向量
    const normals = new Float32Array([
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
    ]);
    if (!initArrayBuffer(gl, 'a_Normal', normals)) {
      console.log('Failed to initialize a_Normal Array.');
      return -1;
    }
    return indices.length;
  }

  function initArrayBuffer(
    gl: WebGLRenderingContext,
    attribute: string,
    data: Float32Array,
  ): boolean {
    const buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create arrayBuffer.');
      return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // @ts-ignore
    const a_attribute = gl.getAttribLocation(gl.program, attribute);
    gl.vertexAttribPointer(a_attribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    return true;
  }

  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
