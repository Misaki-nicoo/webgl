import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';
import { Matrix4 } from '@/utils/matrix4';

export default function() {
  const id = 'pointLightedCube_animation';
  let g_last = Date.now();
  const ANGLE_STEP = 10;
  let angle = 0;

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal; // 法向量
    uniform mat4 u_MvpMatrix; // 计算后的矩阵
    uniform mat4 u_ModelMatrix; // 模型矩阵
    uniform mat4 u_NormalMatrix; // 用来变换法向量的矩阵
    varying vec4 v_Color;
    varying vec4 v_VertexPosition;
    varying vec3 v_Normal;

    void main() {
      gl_Position = u_MvpMatrix * u_ModelMatrix * a_Position;
      // 计算法向量， 对法向量进行归一化
      v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
      // 计算顶点的世界坐标
      v_VertexPosition = u_ModelMatrix * a_Position;
      v_Color = a_Color;
    }
    `;
    const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightColor; // 光线颜色
    uniform vec3 u_LightPosition; // 光源位置，归一化的世界坐标
    uniform vec3 u_AmbientLight; // 环境光颜色
    varying vec4 v_Color;
    varying vec4 v_VertexPosition;
    varying vec3 v_Normal;

    void main() {
      // 计算光线方向，并进行归一化
      vec3 lightDirection = normalize(u_LightPosition - vec3(v_VertexPosition));
      // 计算光线方向和法向量的点积
      float nDotL = max(dot(lightDirection, v_Normal), 0.0);
      // 计算漫反射光的颜色
      vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
      // 计算环境光产生的反射光颜色
      vec3 ambient = u_AmbientLight * v_Color.rgb;
      gl_FragColor = vec4(diffuse + ambient, v_Color.a);
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
    const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    const u_LightPosition = gl.getUniformLocation(
      gl.program,
      'u_LightPosition',
    );
    const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (
      !u_MvpMatrix ||
      !u_LightColor ||
      !u_LightPosition ||
      !u_AmbientLight ||
      !u_ModelMatrix ||
      !u_NormalMatrix
    ) {
      console.log('Failed to get uniform location.');
      return;
    }

    // 光线颜色
    gl?.uniform3f(u_LightColor, 1, 1, 1);
    gl?.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
    // 环境光
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    gl.clearColor(0, 0, 0, 1.0);
    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);

    const aspect: number = canvas.clientWidth / canvas.clientHeight;

    const modelMatrix = new Matrix4();
    const mvpMatrix = new Matrix4();
    const normalMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, aspect, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    const tick = function(){
      angle = animation(angle)
      modelMatrix.setRotate(angle, 0, 1, 0);
      normalMatrix.setInverseOf(modelMatrix); // modelMatrix的逆矩阵
      normalMatrix.transpose(); // 转置

      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
      requestAnimationFrame(tick)
    }
    tick();
  }, []);

  function animation(angle: number) {
    const now = Date.now()
    const escape = now - g_last;
    g_last = now;
    const newAngle = angle + ANGLE_STEP * escape / 1000;
    return newAngle % 360;
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

    const colors = new Float32Array([
      0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, //front
      0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, //right
      1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //up
      1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, //left
      1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, //btm
      0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0 //back
    ]);

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
    if (!initArrayBuffer(gl, 'a_Color', colors)) {
      console.log('Failed to initialize a_Color Array');
    }

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
