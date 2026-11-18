import React from 'react';
import {observer} from 'mobx-react';

import {Screen1Hero} from '../../assets/onboarding/illustrations';
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
      illustration={<Screen1Hero width={112} height={112} />}
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
