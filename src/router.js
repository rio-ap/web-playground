const routes = new Map();

export function registerRoute(path, view) {
  routes.set(path, view);
}

export function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function renderRoute() {
  const app = document.getElementById('app');
  const path = currentPath();
  const view = routes.get(path);

  if (!view) {
    window.location.hash = '#/';
    return;
  }

  app.innerHTML = '';
  app.dataset.view = view.name;
  view.mount(app);
}

export function startRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
