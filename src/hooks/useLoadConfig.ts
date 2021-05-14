import { useCallback, useContext } from 'react';
import { store as appStateStore } from '../context/AppStateContext';
import { fetchLocalConfigState } from '../persistence/GitStorage';
import configStub from '../stubs/configStub';
import type { GitConfig } from '../types';

const useLoadConfig = () => {
  const appStateContext = useContext(appStateStore);

  return useCallback(() => {
    if (!appStateContext.state.config) {
      let config: GitConfig = fetchLocalConfigState()?.config;

      if (!config) {
        const element = document.querySelector('meta[name="gf:config"]');
        if (element) {
          try {
            config = JSON.parse(
              decodeURIComponent(
                // @ts-ignore
                element.content
              )
            );
          } catch (e) {
            console.error('Could not parse config meta tag', e);
          }
        }
      }

      if (!config) {
        config = JSON.parse(JSON.stringify(configStub));
      }

      appStateContext.dispatch({ type: 'LOAD_CONFIG', payload: config });
    }
  }, [appStateContext.state]);
};

export default useLoadConfig;
