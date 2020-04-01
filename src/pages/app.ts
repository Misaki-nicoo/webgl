// @ts-ignore
export const onRouteChange = ({ location }) => {
  // back top
  if (location.pathname !== window.location.pathname) {
    const el = document.scrollingElement || document.documentElement;
    if (el.scrollTop !== 0) {
      el.scrollTop = 0;
    }
  }
};
