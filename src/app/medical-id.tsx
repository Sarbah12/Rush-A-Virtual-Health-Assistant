import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { MedicalForm, useMedicalForm } from '@/components/medical-form';
import { Button, Screen, T, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';

export default function MedicalIdScreen() {
  const { medicalId, saveMedicalId } = useAppState();
  const form = useMedicalForm(medicalId, { requireName: true });
  const [saving, setSaving] = useState(false);

  async function save() {
    const record = form.validate();
    if (!record) return;
    setSaving(true);
    try {
      await saveMedicalId(record);
      if (router.canGoBack()) router.back();
      else router.replace('/records');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back
        edges={['top', 'bottom']}
        footer={<Button label={saving ? 'Saving…' : 'Save'} icon="checkmark" onPress={save} disabled={saving} />}>
        <Title subtitle="Fill in only what you are comfortable with. This stays on your phone and is shown on the SOS screen.">
          Medical ID
        </Title>
        <MedicalForm form={form} />
        {form.showErrors && Object.keys(form.errors).length > 0 ? (
          <T variant="small" color={Colors.danger}>
            Please fix the highlighted fields.
          </T>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
