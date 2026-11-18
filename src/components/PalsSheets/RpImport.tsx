import React from 'react';
import {Alert} from 'react-native';
import {Button} from 'react-native-paper';
import {useFormContext} from 'react-hook-form';
import {pickJsonFile, readJsonFile} from '../../utils/importUtils';
import {readBook, readCard, readPreset} from '../../utils/rpImport';
import {FormField} from './FormField';
import type {PalFormData} from './types';

export function RpImport() {
  const {setValue} = useFormContext<PalFormData>();
  const load = async (kind: '角色卡' | '预设' | '世界书') => {
    try {
      const uri = await pickJsonFile();
      if (!uri) return;
      const json = await readJsonFile(uri);
      const options = {shouldDirty: true};
      if (kind === '角色卡') {
        const card = readCard(json);
        setValue('name', card.name, options);
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
  return (
    <>
      {(['角色卡', '预设', '世界书'] as const).map(kind => (
        <Button key={kind} onPress={() => load(kind)}>
          导入{kind} JSON
        </Button>
      ))}
      <FormField name="dPreset" label="对话预设" multiline />
      <FormField name="dWorldBook" label="世界书 JSON" multiline />
    </>
  );
}
