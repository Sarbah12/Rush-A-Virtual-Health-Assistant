import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Art, Avatar, Button, Logo, T } from '@/components/ui';
import { switchWebThumb } from '@/components/ui';
import { Colors, Fonts, MaxContentWidth, MinTap, Radius, Spacing, Stroke, Type } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { callNumber } from '@/lib/call';
import type { ChatMessage } from '@/lib/chat';
import { CHAT_API_URL, useChat } from '@/lib/use-chat';

const SUGGESTIONS = ['I have a fever and body pains', 'My blood pressure reading is 150/95', 'My child has diarrhoea', 'I can’t sleep well lately'];

// Figma "Go to Chat" (intro) and "Chat" / "CHAT 2" (conversation).
export default function Chat() {
  const { medicalId } = useAppState();
  const chat = useChat();
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);
  const { messages, share } = chat.state;
  const last = messages[messages.length - 1];

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length, chat.sending]);

  async function submit(value = text) {
    if (!value.trim()) return;
    setText('');
    await chat.send(value);
  }

  function confirmClear() {
    const go = () => chat.clear();
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Start a new chat? This conversation will be deleted from this phone.')) go();
      return;
    }
    Alert.alert('Start a new chat?', 'This conversation will be deleted from this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New chat', style: 'destructive', onPress: go },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <View style={styles.header}>
          <View style={{ width: MinTap }} />
          <T style={styles.title} accessibilityRole="header">
            RUSH CHAT
          </T>
          {messages.length > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Start a new chat" onPress={confirmClear} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={Colors.ink} />
            </Pressable>
          ) : (
            <View style={{ width: MinTap }} />
          )}
        </View>

        <ScrollView ref={scroll} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            {messages.length === 0 ? (
              <Intro share={share} onShare={chat.setShare} onPick={(s) => submit(s)} />
            ) : (
              messages.map((m) => <Bubble key={m.id} m={m} name={medicalId.name} />)
            )}
            {chat.sending ? (
              <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                <Logo size={28} wordmark={false} />
                <View style={[styles.bubble, styles.botBubble, { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }]}>
                  <ActivityIndicator color={Colors.ink} size="small" />
                  <T color={Colors.textMuted}>Rush is thinking…</T>
                </View>
              </View>
            ) : null}
            {!chat.sending && last?.local === 'error' ? <Button label="Try again" kind="secondary" icon="refresh" onPress={chat.retry} /> : null}
            {!chat.sending && (last?.local === 'emergency' || last?.local === 'selfharm') ? (
              <View style={{ gap: Spacing.sm }}>
                <Button label="Call 112" icon="call" kind="danger" onPress={() => callNumber('112')} />
                {last.local === 'emergency' ? <Button label="Call ambulance 193" icon="call" kind="danger" onPress={() => callNumber('193')} /> : null}
                <Button label="I’m safe, continue chatting" kind="secondary" onPress={chat.continueAfterAlert} />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={[styles.column, styles.inputRow]}>
            <TextInput
              accessibilityLabel="Message Rush"
              placeholder="Describe how you feel…"
              placeholderTextColor={Colors.placeholder}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={1}
              maxLength={2000}
              style={styles.input}
              onKeyPress={(e) => {
                // Enter sends on web; Shift+Enter adds a new line.
                const ne = e.nativeEvent as unknown as { key: string; shiftKey?: boolean };
                if (Platform.OS === 'web' && ne.key === 'Enter' && !ne.shiftKey) {
                  (e as unknown as { preventDefault: () => void }).preventDefault();
                  submit();
                }
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send"
              disabled={!text.trim() || chat.sending}
              onPress={() => submit()}
              style={[styles.send, (!text.trim() || chat.sending) && { opacity: 0.4 }]}>
              <Ionicons name="arrow-up" size={22} color={Colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Intro({ share, onShare, onPick }: { share: boolean; onShare: (v: boolean) => void; onPick: (s: string) => void }) {
  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ alignItems: 'center', paddingTop: Spacing.md }}>
        <Art icon="person-outline" size={140} />
      </View>
      <View style={styles.introCard}>
        <T variant="heading">Meet Rush, your health assistant</T>
        <T color={Colors.textMuted}>
          Describe how you feel in your own words. Rush helps you understand it and decide whether to rest at home, see a pharmacist or visit a clinic. It is general guidance, not a diagnosis.
        </T>
        {!CHAT_API_URL ? (
          <T variant="small" color={Colors.warning}>
            Chat is not connected in this build yet.
          </T>
        ) : null}
      </View>
      <View style={styles.shareRow}>
        <View style={{ flex: 1 }}>
          <T variant="bodyBold">Use my health info</T>
          <T variant="small" color={Colors.textMuted}>
            Shares your age, conditions, allergies, medicines and recent readings with Rush for better answers. Never your name or phone numbers.
          </T>
        </View>
        <Switch value={share} onValueChange={onShare} trackColor={{ true: Colors.ink, false: Colors.hairline }} thumbColor={Colors.surface} {...switchWebThumb} accessibilityLabel="Use my health info in chat" />
      </View>
      <T variant="label" color={Colors.textMuted}>
        TRY ASKING
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} accessibilityRole="button" onPress={() => onPick(s)} style={styles.suggestion}>
            <T variant="small">{s}</T>
          </Pressable>
        ))}
      </View>
      <T variant="small" color={Colors.textMuted}>
        Messages are sent securely to an AI service to get a reply and are not stored on a server. Your conversation is saved only on this phone.
      </T>
    </View>
  );
}

function Bubble({ m, name }: { m: ChatMessage; name: string }) {
  const mine = m.role === 'user';
  const alert = m.local === 'emergency' || m.local === 'selfharm';
  return (
    <View style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
      {!mine ? <Logo size={28} wordmark={false} /> : null}
      <View
        style={[
          styles.bubble,
          mine ? styles.myBubble : styles.botBubble,
          alert && { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
          m.local === 'error' && { borderColor: Colors.warning },
        ]}>
        {alert ? (
          <T variant="smallBold" color={Colors.danger}>
            {m.local === 'selfharm' ? 'YOU ARE NOT ALONE' : 'POSSIBLE EMERGENCY'}
          </T>
        ) : null}
        <T selectable>{m.text}</T>
      </View>
      {mine ? <Avatar name={name} size={28} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headerBtn: { width: MinTap, height: MinTap, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Fonts.extrabold, fontSize: 22, letterSpacing: 0.5 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  bubble: { maxWidth: '80%', borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 4 },
  botBubble: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  myBubble: { backgroundColor: Colors.surface, borderBottomRightRadius: 4 },
  introCard: { borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface, padding: Spacing.lg, gap: Spacing.sm },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  suggestion: { borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.surface },
  inputBar: { borderTopWidth: 1, borderTopColor: Colors.hairline, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  input: {
    ...Type.body,
    flex: 1,
    minHeight: MinTap,
    maxHeight: 140,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    color: Colors.text,
    outlineStyle: 'none',
  } as never,
  send: { width: MinTap, height: MinTap, borderRadius: Radius.md, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
});
