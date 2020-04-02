import { IMenu } from '@/types/global';

export const menus: IMenu[] = [
  {
    path: '/chapter2',
    title: 'webGL入门',
    children: [
      { path: '/chapter2/drawRectangle', title: '2维矩形' },
      { path: '/chapter2/helloCanvas', title: 'webgl清空画布' },
      { path: '/chapter2/helloPoint1', title: '画点1' },
      { path: '/chapter2/helloPoint2', title: '画点2(attribute使用)' },
      { path: '/chapter2/clickedPoint', title: '鼠标画点' },
      { path: '/chapter2/coloredPoint', title: '鼠标画点并改变颜色' },
    ],
  },
  {
    path: '/chapter3',
    title: '绘制和变换三角形',
    children: [
      { path: '/chapter3/multiPoints', title: '绘制多个点' },
      { path: '/chapter3/helloTriangle', title: '绘制三角形' },
      { path: '/chapter3/translatedTriangle', title: '平移三角形' },
    ],
  },
];
