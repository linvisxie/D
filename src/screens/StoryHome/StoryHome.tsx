import React, {useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {observer} from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import {PalSheet} from '../../components/PalsSheets';
import {useTheme} from '../../hooks';
import {chatSessionStore, palStore} from '../../store';
import {LIYA} from '../../store/onboarding/liya';
import type {Pal} from '../../types/pal';
import {activatePalWithModel} from '../../utils/activatePal';
import {getFullThumbnailUri} from '../../utils/imageUtils';
import {ROUTES} from '../../utils/navigationConstants';
import {
  createNewRoleplayPal,
  preparePalForEditing,
} from '../../utils/pal-templates';
import {pickCharacterCard} from '../../utils/pickCharacterCard';
import {readCard} from '../../utils/rpImport';

const harbor = require('../../assets/roleplay/fog-harbor.jpg');

export const StoryHome = observer(() => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();
  const {dark} = useTheme();
  const ink = dark ? '#eef3ef' : '#173431';
  const muted = dark ? '#adc2bd' : '#496661';
  const paper = dark ? '#132624' : '#f4f6f1';
  const panel = dark ? '#203532' : '#ffffff';
  const [editor, setEditor] = useState<Partial<Pal> | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const entering = useRef(false);
  const pals = palStore.pals;
  const featured = pals.find(
    p => p.name === LIYA.name && p.description === LIYA.description,
  );
  const recent = [...chatSessionStore.sessions]
    .filter(s => s.activePalId && pals.some(p => p.id === s.activePalId))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  const recentPal = recent && pals.find(p => p.id === recent.activePalId);
  const term = query.trim().toLowerCase();
  const characters = pals.filter(p =>
    [p.name, p.description].some(value => value?.toLowerCase().includes(term)),
  );
  const enter = async (pal: Pal, sessionId?: string) => {
    if (entering.current) return;
    entering.current = true;
    try {
      if (sessionId) await chatSessionStore.setActiveSession(sessionId);
      await activatePalWithModel(pal, navigation);
    } catch {
      Alert.alert('无法打开对话', '请检查已选模型后再试。');
    } finally {
      entering.current = false;
    }
  };
  const importCard = async () => {
    try {
      const json = await pickCharacterCard();
      if (json === null) return;
      const card = readCard(json);
      const draft = createNewRoleplayPal();
      setEditor({
        ...draft,
        name: card.name,
        description: card.description,
        systemPrompt: card.systemPrompt,
        originalSystemPrompt: card.systemPrompt,
        isSystemPromptChanged: true,
        greeting: {text: card.greetingText},
        parameters: {
          ...draft.parameters,
          dPreset: card.preset,
          dWorldBook: card.book
            ? JSON.stringify({entries: card.book}, null, 2)
            : '',
        },
      });
    } catch (error) {
      Alert.alert(
        '导入失败',
        error instanceof Error ? error.message : '无法读取角色卡',
      );
    }
  };
  const action = (label: string, onPress: () => void, id?: string) => (
    <Pressable
      accessibilityRole="button"
      testID={id}
      onPress={onPress}
      style={[styles.action, {backgroundColor: panel, borderColor: muted}]}>
      <Text style={{color: ink, fontWeight: '600'}}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.root, {backgroundColor: paper}]}>
      <FlatList
        data={characters}
        keyExtractor={p => p.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
        ListHeaderComponent={
          <View style={styles.stack}>
            {featured && !searching && (
              <ImageBackground
                source={harbor}
                resizeMode="cover"
                style={[styles.hero, {minHeight: width >= 700 ? 360 : 260}]}>
                <LinearGradient
                  colors={['#071c2a00', '#081e2ce6']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroCopy}>
                  <Text style={styles.byline}>莉娅 · 雾港领航员</Text>
                  <Text accessibilityRole="header" style={styles.storyTitle}>
                    雾港末班船
                  </Text>
                  <Text style={styles.excerpt}>
                    “你也收到这张票了？奇怪，这条航线十年前就停了。”
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    testID="home-featured-chat"
                    onPress={() => enter(featured)}
                    style={styles.heroButton}>
                    <Text style={styles.heroButtonLabel}>
                      {chatSessionStore.sessions.some(
                        s => s.activePalId === featured.id,
                      )
                        ? '继续和莉娅对话'
                        : '与莉娅对话'}
                      　→
                    </Text>
                  </Pressable>
                </View>
              </ImageBackground>
            )}
            {recent && recentPal && !searching && (
              <Pressable
                accessibilityRole="button"
                testID="home-resume"
                onPress={() => enter(recentPal, recent.id)}
                style={[styles.resume, {backgroundColor: panel}]}>
                <Text style={{color: muted}}>上次聊到</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.resumeTitle, {color: ink}]}>
                  {recentPal.name}　·　{recent.title || '继续对话'}
                </Text>
              </Pressable>
            )}
            <View style={styles.sectionHead}>
              <Text
                accessibilityRole="header"
                style={[styles.heading, {color: ink}]}>
                我的角色
              </Text>
              {action(
                searching ? '收起搜索' : '搜索',
                () => {
                  setSearching(!searching);
                  setQuery('');
                },
                'home-search',
              )}
            </View>
            {searching && (
              <TextInput
                autoFocus
                testID="search-input"
                accessibilityLabel="搜索角色"
                placeholder="按角色名或简介搜索"
                placeholderTextColor={muted}
                value={query}
                onChangeText={setQuery}
                style={[styles.field, {backgroundColor: panel, color: ink}]}
              />
            )}
            <View style={styles.actions}>
              {action(
                '＋ 创建角色',
                () => setEditor(createNewRoleplayPal()),
                'home-create',
              )}
              {action('导入角色卡', importCard, 'home-import')}
              {action('管理模型', () => navigation.navigate(ROUTES.MODELS))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, {color: muted}]}>
            {term
              ? '没有找到匹配的角色'
              : '创建或导入一张角色卡，开始你的故事。'}
          </Text>
        }
        renderItem={({item}) => (
          <View style={[styles.row, {backgroundColor: panel}]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`和${item.name}对话`}
              testID={`start-pal-chat-${item.name}`}
              onPress={() => enter(item)}
              style={styles.character}>
              {item.thumbnail_url || item.id === featured?.id ? (
                <Image
                  source={
                    item.thumbnail_url
                      ? {uri: getFullThumbnailUri(item.thumbnail_url)}
                      : harbor
                  }
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.initial}>
                  <Text style={styles.initialText}>
                    {Array.from(item.name)[0]}
                  </Text>
                </View>
              )}
              <View style={styles.details}>
                <Text numberOfLines={1} style={[styles.name, {color: ink}]}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text
                    numberOfLines={2}
                    style={[styles.description, {color: muted}]}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`编辑${item.name}的设定`}
              onPress={() => setEditor(preparePalForEditing(item))}
              style={styles.edit}>
              <Text style={{color: muted}}>设定</Text>
            </Pressable>
          </View>
        )}
      />
      {editor && (
        <PalSheet pal={editor} isVisible onClose={() => setEditor(null)} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {flex: 1},
  page: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 48,
  },
  stack: {gap: 14, marginBottom: 14},
  hero: {
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#173642',
  },
  heroCopy: {padding: 24, alignItems: 'flex-start', gap: 8, maxWidth: 430},
  byline: {color: '#f6dcb1', fontWeight: '600', fontSize: 14},
  storyTitle: {fontSize: 37, fontWeight: '700', color: 'white'},
  excerpt: {color: '#f5f5ef', fontSize: 16, lineHeight: 24},
  heroButton: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 24,
    paddingHorizontal: 18,
    justifyContent: 'center',
    backgroundColor: '#f5ddb4',
  },
  heroButtonLabel: {fontWeight: '700', color: '#223430'},
  resume: {padding: 16, borderRadius: 14, gap: 5},
  resumeTitle: {fontSize: 17, fontWeight: '600'},
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  heading: {fontSize: 26, fontWeight: '700'},
  actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  action: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  field: {borderRadius: 12, paddingHorizontal: 14, minHeight: 48},
  row: {
    flexDirection: 'row',
    borderRadius: 15,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  character: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatar: {width: 52, height: 58, borderRadius: 10},
  initial: {
    width: 52,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#294d49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {fontSize: 23, fontWeight: '600', color: '#f3e5ce'},
  details: {flex: 1, gap: 4},
  name: {fontSize: 17, fontWeight: '700'},
  description: {fontSize: 14, lineHeight: 20},
  edit: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {padding: 16},
});
