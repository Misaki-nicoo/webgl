import React, { useEffect } from 'react';

export default function() {
  const id = 'helloCanvas';
  useEffect(() => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    // @ts-ignore
    const gl = canvas.getContext('webgl');
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);
  return <canvas id={id} style={{ width: '100%', height: '100%' }} />;
}
