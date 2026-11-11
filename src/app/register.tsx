import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { MedicalForm, useMedicalForm } from '@/components/medical-form';
import { Button, Screen, T, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';

// Figma "Register": Medical Information. Only the name is required; the
// rest can be filled in later from the profile.
export default function Register() {
  const { medicalId, saveMedicalId } = useAppState();
  const form = useMedicalForm(medicalId, { requireName: true });
  const [saving, setSaving] = useState(false);

  async function save() {
    const record = form.validate();
    if (!record) return;
    setSaving(true);
    try {
      await saveMedicalId(record);
      router.replace('/success');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back
        edges={['top', 'bottom']}
        footer={
          <View style={styles.actions}>
            <Button label="Cancel" kind="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
            <Button label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving} style={{ flex: 1 }} />
          </View>
        }>
        <Title subtitle="This helps Rush give you better guidance and lets a doctor help you fast in an emergency. Only your name is needed now.">
          Medical Information
        </Title>
        <MedicalForm form={form} showContact={false} />
        {form.showErrors && Object.keys(form.errors).length > 0 ? (
          <T variant="small" color={Colors.danger}>
            Please fix the highlighted fields.
          </T>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.md },
});
