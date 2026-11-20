import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {render} from '../../../../jest/test-utils';
import {mockLocalPal} from '../../../../jest/fixtures/pals';
import {StoryHome} from '../StoryHome';
import {palStore, chatSessionStore} from '../../../store';
import {PalSheet} from '../../../components/PalsSheets';
import {pickCharacterCard} from '../../../utils/pickCharacterCard';

jest.mock('../../../components/PalsSheets', () => ({
  PalSheet: jest.fn(() => null),
}));
jest.mock('../../../utils/pickCharacterCard', () => ({
  pickCharacterCard: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  palStore.pals = [mockLocalPal];
  chatSessionStore.sessions = [];
});

it('keeps a custom library usable when the featured character is absent', () => {
  const ui = render(<StoryHome />, {withNavigation: true});
  expect(ui.queryByTestId('home-featured-chat')).toBeNull();
  fireEvent.press(ui.getByLabelText('编辑Test Assistant的设定'));
  expect(jest.mocked(PalSheet).mock.calls[0][0].pal.id).toBe(mockLocalPal.id);
});

it('previews an imported card with its own prompt, greeting and world book before saving', async () => {
  jest.mocked(pickCharacterCard).mockResolvedValue({
    data: {
      name: '灯匠',
      first_mes: '请进。',
      description: '修灯的人',
      character_book: {entries: [{keys: ['灯塔'], content: '灯塔朝北'}]},
    },
  });
  const ui = render(<StoryHome />, {withNavigation: true});
  fireEvent.press(ui.getByTestId('home-import'));
  await waitFor(() => expect(PalSheet).toHaveBeenCalled());
  const draft = jest.mocked(PalSheet).mock.calls[0][0].pal;
  expect(draft).toMatchObject({name: '灯匠', greeting: {text: '请进。'}});
  expect(draft.id).toBeUndefined();
  expect(draft.systemPrompt).toContain('修灯的人');
  expect(JSON.parse(draft.parameters!.dWorldBook).entries[0].content).toBe(
    '灯塔朝北',
  );
});
