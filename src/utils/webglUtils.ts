export function initShaders(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
): boolean {
  const program: WebGLProgram | null = createProgram(gl, vsSource, fsSource);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  // @ts-ignore
  gl.program = program;
  return true;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vertexShader: WebGLShader | null = loadShader(
    gl,
    gl.VERTEX_SHADER,
    vsSource,
  );
  const fragmentShader: WebGLShader | null = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fsSource,
  );

  const shaderProgram: WebGLProgram | null = gl.createProgram();
  if (!shaderProgram || !vertexShader || !fragmentShader) return null;

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }
  return shaderProgram;
}

function loadShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader: WebGLShader | null = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
