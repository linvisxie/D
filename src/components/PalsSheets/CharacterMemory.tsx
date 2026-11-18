import React from 'react';
import {View} from 'react-native';
import {Button, Checkbox, Text} from 'react-native-paper';
import {useFieldArray, useFormContext, Controller} from 'react-hook-form';
import {FormField} from './FormField';
import type {PalFormData} from './types';

export function CharacterMemory() {
  const {control} = useFormContext<PalFormData>();
  const {fields, append, remove} = useFieldArray({
    control,
    name: 'memoryNotes',
  });
  return (
    <View>
      <Text variant="titleMedium">角色记忆</Text>
      <Text>手动保存的记忆可跨会话使用。仅在本地模型对话中调用。</Text>
      {fields.map((field, index) => (
        <View key={field.id}>
          <FormField
            name={`memoryNotes.${index}.text`}
            label="记住什么"
            multiline
          />
          <FormField
            name={`memoryNotes.${index}.keywords`}
            label="触发词"
            placeholder="多个词用逗号分隔，留空则每次调用"
          />
          <Controller
            control={control}
            name={`memoryNotes.${index}.enabled`}
            render={({field: toggle}) => (
              <Checkbox.Item
                label="参与对话"
                status={toggle.value ? 'checked' : 'unchecked'}
                onPress={() => toggle.onChange(!toggle.value)}
              />
            )}
          />
          <Button onPress={() => remove(index)}>移除这条记忆</Button>
        </View>
      ))}
      <Button onPress={() => append({text: '', keywords: '', enabled: true})}>
        添加记忆
      </Button>
    </View>
  );
}
