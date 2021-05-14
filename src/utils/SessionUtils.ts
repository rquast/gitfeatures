export function setSessionValue(
  currentRepositoryURL: string,
  key: string,
  value: string | null
): void {
  let state;
  try {
    state = JSON.parse(
      sessionStorage.getItem(`${currentRepositoryURL}:state`) || '{}'
    );
  } catch (e) {
    state = {};
  }
  state[key] = value;
  sessionStorage.setItem(
    `${currentRepositoryURL}:state`,
    JSON.stringify(state)
  );
}

export function getSessionValue(
  currentRepositoryURL: string,
  key: string
): string | null {
  const state = JSON.parse(
    sessionStorage.getItem(`${currentRepositoryURL}:state`) || '{}'
  );
  if (!state[key]) {
    return null;
  } else {
    return state[key];
  }
}

export function resetSessionValues(currentRepositoryURL: string) {
  sessionStorage.removeItem(`${currentRepositoryURL}:state`);
}
