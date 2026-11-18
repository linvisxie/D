import {Alert} from 'react-native';

import {chatSessionStore, modelStore} from '../store';
import {ROUTES} from './navigationConstants';
import type {Pal} from '../types/pal';
import type {Model} from './types';

interface NavigationLike {
  navigate: (route: string) => void;
}

const loadPalDefaultModel = async (localPal: Pal) => {
  const palDefaultModel = modelStore.availableModels.find(
    m => m.id === localPal.defaultModel?.id,
  );
  if (!palDefaultModel) {
    return;
  }
  if (!modelStore.activeModel) {
    await modelStore.selectModel(palDefaultModel);
  } else if (palDefaultModel.id !== modelStore.activeModelId) {
    Alert.alert(
      'Switch Model?',
      `Switch to "${palDefaultModel.name}" for this pal?`,
      [
        {text: 'Keep Current', style: 'cancel'},
        {
          text: 'Switch',
          onPress: () => {
            modelStore.selectModel(palDefaultModel);
          },
        },
      ],
    );
  }
};

export const activatePalWithModel = async (
  localPal: Pal,
  navigation: NavigationLike,
  model?: Model,
): Promise<void> => {
  if (model) await modelStore.selectModel(model);

  // Enter the character's own thread from the library. The picker inside
  // a chat still allows deliberately changing the cast of that thread.
  const current = chatSessionStore.sessions.find(
    session => session.id === chatSessionStore.activeSessionId,
  );
  if (!current || current.activePalId !== localPal.id) {
    const previous = chatSessionStore.sessions
      .filter(session => session.activePalId === localPal.id)
      .sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];
    if (previous) {
      await chatSessionStore.setActiveSession(previous.id);
    } else {
      if (chatSessionStore.activeSessionId)
        chatSessionStore.resetActiveSession();
      await chatSessionStore.setActivePal(localPal.id);
    }
  }

  if (!model) await loadPalDefaultModel(localPal);
  navigation.navigate(ROUTES.CHAT);
};
