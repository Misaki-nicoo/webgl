import React, { useEffect } from 'react';

export default function() {
  const id = 'drawRectangle';
  useEffect(() => {
    const ctx = document.getElementById(id);
    if (!ctx) {
      return;
    }
    // @ts-ignore
    const context = ctx.getContext('2d');
    context.fillStyle = '#00f';
    context.fillRect(10, 10, 150, 150);
  }, []);
  return <canvas style={{ width: '100%', height: '100%' }} id={id} />;
}
