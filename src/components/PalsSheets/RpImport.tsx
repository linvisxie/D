import React from 'react';
import {Alert} from 'react-native';
import {Button} from 'react-native-paper';
import {useFormContext} from 'react-hook-form';
import {pickJsonFile, readJsonFile} from '../../utils/importUtils';
import {readBook, readCard, readPreset} from '../../utils/rpImport';
import {pickCharacterCard} from '../../utils/pickCharacterCard';
import {shareJsonData} from '../../utils/exportUtils';
import {generateFinalSystemPrompt} from '../../utils/palshub-template-parser';
import type {ParameterDefinition} from '../../types/pal';
import {FormField} from './FormField';
import type {PalFormData} from './types';

export function RpImport({schema}: {schema: ParameterDefinition[]}) {
  const [expanded, setExpanded] = React.useState(false);
  const {setValue, getValues} = useFormContext<PalFormData>();
  const load = async (kind: '角色卡' | '预设' | '世界书') => {
    try {
      const uri = kind === '角色卡' ? null : await pickJsonFile();
      const json =
        kind === '角色卡'
          ? await pickCharacterCard()
          : uri
            ? await readJsonFile(uri)
            : null;
      if (json === null) return;
      const options = {shouldDirty: true};
      if (kind !== '角色卡') setExpanded(true);
      if (kind === '角色卡') {
        const card = readCard(json);
        setValue('name', card.name, options);
        if (card.preset) setValue('dPreset', card.preset, options);
        setValue('description', card.description, options);
        setValue('systemPrompt', card.systemPrompt, options);
        setValue('greetingText', card.greetingText, options);
        setValue('isSystemPromptChanged', true, options);
        if (card.book)
          setValue(
            'dWorldBook',
            JSON.stringify({entries: card.book}, null, 2),
            options,
          );
      } else if (kind === '预设') {
        setValue('dPreset', readPreset(json), options);
      } else {
        setValue(
          'dWorldBook',
          JSON.stringify({entries: readBook(json)}, null, 2),
          options,
        );
      }
    } catch (error) {
      Alert.alert(
        '导入失败',
        error instanceof Error ? error.message : '无法读取 JSON',
      );
    }
  };
  const exportCard = async () => {
    try {
      const values = getValues();
      const name = values.name.trim();
      if (!name) throw new Error('请先填写角色名称');
      const variables = Object.fromEntries(
        schema.map(field => [field.key, values[field.key]]),
      );
      const prompt = schema.length
        ? generateFinalSystemPrompt(values.systemPrompt, variables)
        : values.systemPrompt;
      const entries = values.dWorldBook?.trim()
        ? readBook(JSON.parse(values.dWorldBook))
        : [];
      const data = {
        name,
        description: values.description || '',
        personality: '',
        scenario: '',
        first_mes: values.greetingText || '',
        mes_example: '',
        creator_notes: '',
        system_prompt: prompt,
        post_history_instructions: '',
        alternate_greetings: [],
        tags: [],
        creator: '',
        character_version: '',
        extensions: {d: {prompt, preset: values.dPreset || ''}},
        character_book: {
          extensions: {},
          entries: entries.map((entry, index) => ({
            ...entry,
            insertion_order: index,
            extensions: {},
          })),
        },
      };
      await shareJsonData(
        JSON.stringify(
          {spec: 'chara_card_v2', spec_version: '2.0', data},
          null,
          2,
        ),
        'D-card-' + Date.now() + '.json',
      );
    } catch (error) {
      Alert.alert(
        '导出失败',
        error instanceof Error ? error.message : '无法分享角色卡',
      );
    }
  };
  return (
    <>
      {(['角色卡', '预设', '世界书'] as const).map(kind => (
        <Button key={kind} onPress={() => load(kind)}>
          导入{kind} {kind === '角色卡' ? 'PNG / JSON' : 'JSON'}
        </Button>
      ))}
      <Button onPress={exportCard}>导出角色卡 JSON</Button>
      <Button onPress={() => setExpanded(!expanded)}>
        {expanded ? '收起预设和世界书' : '编辑预设和世界书'}
      </Button>
      {expanded && (
        <>
          <FormField name="dPreset" label="对话预设" multiline />
          <FormField name="dWorldBook" label="世界书 JSON" multiline />
        </>
      )}
    </>
  );
}
