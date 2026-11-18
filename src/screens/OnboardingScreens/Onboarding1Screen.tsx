import React from 'react';
import {observer} from 'mobx-react';

import {Image, StyleSheet} from 'react-native';
import {OnboardingScaffold} from './components/OnboardingScaffold';
import {OnboardingBottomBar} from './components/OnboardingBottomBar';
import {OnboardingContent} from './components/OnboardingContent';
import {ItalicAccentTitle} from './components/ItalicAccentTitle';
import {HighlightText} from './components/HighlightText';
import {useOnboardingHandlers} from './useOnboardingHandlers';

export const Onboarding1Screen: React.FC = observer(() => {
  const {l10n, selectTopic} = useOnboardingHandlers(1);
  const t = l10n.onboarding;
  return (
    <OnboardingScaffold
      step={1}
      illustration={
        <Image
          accessibilityLabel="雾港码头的莉娅"
          source={require('../../assets/roleplay/fog-harbor.jpg')}
          style={styles.harbor}
        />
      }
      content={
        <OnboardingContent
          eyebrow="D"
          title={<ItalicAccentTitle title="和莉娅一起走进雾港" />}
          body={
            <HighlightText
              body="先下载一个适合这台设备的模型。下载完成后，你可以离线与角色对话，也可以导入自己的角色卡。聊天记录保存在这台设备上。"
              phrases={[]}
            />
          }
        />
      }
      bottomBar={
        <OnboardingBottomBar
          primaryLabel="选择本地模型"
          onPrimary={() => selectTopic('roleplay')}
          showBack={false}
          backAccessibilityLabel={t.back}
        />
      }
    />
  );
});

const styles = StyleSheet.create({
  harbor: {width: '94%', maxWidth: 760, aspectRatio: 2.15, borderRadius: 18},
});
