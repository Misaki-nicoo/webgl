import React, { useEffect } from 'react';
import { initShaders } from '@/utils/webglUtils';

export default function() {
  const id = 'clickedPoint';
  // let points: number[] = [];
  let points: number[][] = [];

  useEffect(() => {
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;

    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
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

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    canvas.onmousedown = function(ev) {
      click(ev, gl, canvas, a_Position);
    };

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
  }, []);

  function click(
    ev: MouseEvent,
    gl: WebGL2RenderingContext,
    canvas: HTMLElement,
    a_Position: number,
  ) {
    let x = ev.clientX;
    let y = ev.clientY;
    // @ts-ignore
    const rect = ev.target?.getBoundingClientRect();
    x = (x - rect.left - rect.width / 2) / (rect.width / 2); // or canvas.clientWidth
    y = (rect.height / 2 - (y - rect.top)) / (rect.height / 2); // or canvas.clientHeight
    // points.push(x);
    // points.push(y);
    points.push([x, y]);

    gl.clear(gl.COLOR_BUFFER_BIT);

    const len = points.length;
    // for (let i = 0; i < len; i += 2) {
    for (let i = 0; i < len; i++) {
      // gl.vertexAttrib3f(a_Position, points[i], points[i + 1], 0.0);
      gl.vertexAttrib3f(a_Position, points[i][0], points[i][1], 0.0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }

  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
