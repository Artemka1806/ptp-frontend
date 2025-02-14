const changeTab = (router, path, tabName = path) => {
  const tabElement = document.querySelector(`[data-tab-name="${tabName}"]`);
  if (tabElement) {
    tabElement.click();
  }
  router.push('/' + path);
}

export { changeTab };
