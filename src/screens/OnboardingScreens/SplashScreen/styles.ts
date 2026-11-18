import {StyleSheet} from 'react-native';

import type {Theme} from '../../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    mark: {
      fontSize: 80,
      fontWeight: '700',
      color: theme.dark ? '#f5ddb4' : '#294d49',
    },
    root: {
      flex: 1,
      // Figma `Color/Background/Muted` (#fafafa) — maps to `colors.surfaceVariant`.
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
