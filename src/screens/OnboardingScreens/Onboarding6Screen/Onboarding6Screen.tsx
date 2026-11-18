import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {observer} from 'mobx-react';

import {modelStore, uiStore} from '../../../store';
import {useTheme} from '../../../hooks';
import {
  entryId,
  resolvePalForTopic,
} from '../../../store/onboarding/onboardingPals';
import {OnboardingScaffold} from '../components/OnboardingScaffold';
import {OnboardingBottomBar} from '../components/OnboardingBottomBar';
import {ItalicAccentTitle} from '../components/ItalicAccentTitle';
import {DeviceInfoChip} from '../components/DeviceInfoChip';
import {ModelRadioGroup, type ModelOption} from '../components/ModelRadioGroup';
import {Button} from 'react-native-paper';
import {estimateMemoryFromFileSize} from '../../../utils/memoryEstimator';
import {PipMascot} from '../illustrations/PipMascot';
import {useOnboardingHandlers} from '../useOnboardingHandlers';
import {createStyles} from './styles';

const formatSize = (bytes: number | undefined): string => {
  if (!bytes || bytes <= 0) {
    return '';
  }
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  return `${Math.round(bytes / (1024 * 1024))} MB`;
};

export const Onboarding6Screen: React.FC = observer(() => {
  const {l10n, goBack, skip, finish, isFinishing} = useOnboardingHandlers(6);
  const theme = useTheme();
  const styles = createStyles(theme);
  const t = l10n.onboarding;
  const topic = uiStore.onboardingState.selectedTopic;
  const pal = resolvePalForTopic(topic);
  const selectedId = uiStore.onboardingState.selectedModelId;

  const budget = modelStore.availableMemoryCeiling;
  const fits = (bytes: number) =>
    budget === undefined || estimateMemoryFromFileSize(bytes) <= budget;
  const fitting = pal.models.filter(entry => fits(entry.sizeBytes));
  const suggested = fitting.find(entry => entry.recommended) ?? fitting[0];
  const initial = suggested ?? pal.models[0];
  useEffect(() => {
    if (!pal.models.some(entry => entryId(entry) === selectedId)) {
      uiStore.setOnboardingModelId(entryId(initial));
    }
  }, [pal, selectedId, initial]);

  const canFinish = selectedId !== null && !isFinishing;
  const isDownloaded = (id: string): boolean =>
    !!modelStore.models.find(m => m.id === id)?.isDownloaded;
  const options: ModelOption[] = pal.models.map(entry => {
    const id = entryId(entry);
    const sizeSegment = formatSize(entry.sizeBytes);
    const downloaded = isDownloaded(id);
    const segments = [entry.displayName];
    if (sizeSegment) {
      segments.push(sizeSegment);
    }
    if (!fits(entry.sizeBytes)) segments.push('预计超出本机可用内存');
    if (downloaded) {
      segments.push(t.screen6.downloaded);
    }
    return {
      id,
      title: t.screen6.modelTier[entry.tier],
      subtitle: segments.join(' · '),
      recommended: entry === suggested,
    };
  });
  const pickedEntry = selectedId
    ? pal.models.find(m => entryId(m) === selectedId)
    : undefined;
  const pickedDownloaded = selectedId ? isDownloaded(selectedId) : false;
  const sizeLabel = formatSize(pickedEntry?.sizeBytes);
  const palBody =
    topic === 'roleplay' ? pal.description : t.screen6.pal[pal.key].body;
  const primaryLabel = pickedDownloaded
    ? t.screen6.useTemplate.replace('{{name}}', pal.name)
    : sizeLabel
      ? t.screen6.ctaTemplate
          .replace('{{name}}', pal.name)
          .replace('{{size}}', sizeLabel)
      : t.screen6.cta.replace('{{name}}', pal.name);
  const subtitle = t.screen6.subtitleTemplate.replace('{{name}}', pal.name);
  return (
    <OnboardingScaffold
      step={6}
      layout="top"
      content={
        <>
          <View style={styles.header}>
            <PipMascot width={66} />
            <ItalicAccentTitle title={pal.name} align="center" />
            <Text style={styles.palBody}>{palBody}</Text>
          </View>
          <DeviceInfoChip
            ramSuffix={t.screen6.deviceRamSuffix}
            freeSuffix={t.screen6.deviceFreeSuffix}
          />
          <View style={styles.options}>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <ModelRadioGroup
              options={options}
              selectedId={selectedId}
              recommendedBadgeLabel={t.screen6.recommended}
              onSelect={id => uiStore.setOnboardingModelId(id)}
            />
            <Button onPress={skip}>稍后下载，先浏览角色</Button>
          </View>
        </>
      }
      bottomBar={
        <OnboardingBottomBar
          primaryLabel={primaryLabel}
          primaryGlyph={pickedDownloaded ? 'arrow-right' : 'download'}
          primaryGlyphPosition={pickedDownloaded ? 'trailing' : 'leading'}
          primaryDisabled={!canFinish}
          onPrimary={finish}
          onBack={goBack}
          backAccessibilityLabel={t.back}
        />
      }
    />
  );
});
