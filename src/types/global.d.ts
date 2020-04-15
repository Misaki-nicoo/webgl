export interface IMenu {
  path: string;
  title: string;
  children?: IMenu[];
}

export interface UserBuffer {
  buffer: WebGLBuffer;
  num: number;
  type: GLsizei;
}
