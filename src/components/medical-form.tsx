import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card, Choice, Field, SectionLabel, T } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke, Type } from '@/constants/theme';
import {
  BLOOD_GROUPS,
  dobParts,
  parseDob,
  SEXES,
  SICKLE_STATUSES,
  validateMedicalId,
  type EmergencyContact,
  type MedicalId,
  type MedicalIdErrors,
} from '@/lib/medical-id';

export type MedicalFormState = {
  draft: MedicalId;
  setDraft: React.Dispatch<React.SetStateAction<MedicalId>>;
  dob: { day: string; month: string; year: string };
  setDob: React.Dispatch<React.SetStateAction<{ day: string; month: string; year: string }>>;
  showErrors: boolean;
  setShowErrors: (v: boolean) => void;
  /** Returns the cleaned record, or null (and shows errors) if something is wrong. */
  validate: () => MedicalId | null;
  errors: MedicalIdErrors & { dob?: string };
};

export function useMedicalForm(initial: MedicalId, opts: { requireName?: boolean } = {}): MedicalFormState {
  const [draft, setDraft] = useState<MedicalId>(initial);
  const [dob, setDob] = useState(() => dobParts(initial.dateOfBirth));
  const [showErrors, setShowErrors] = useState(false);

  const dobResult = parseDob(dob.day, dob.month, dob.year);
  const errors = {
    ...validateMedicalId(draft, opts),
    ...(dobResult.ok ? {} : { dob: dobResult.reason }),
  };

  function validate(): MedicalId | null {
    if (Object.keys(errors).length > 0 || !dobResult.ok) {
      setShowErrors(true);
      return null;
    }
    return { ...draft, dateOfBirth: dobResult.iso };
  }

  return { draft, setDraft, dob, setDob, showErrors, setShowErrors, validate, errors };
}

export function MedicalForm({
  form,
  showContact = true,
  showIdentity = true,
}: {
  form: MedicalFormState;
  showContact?: boolean;
  showIdentity?: boolean;
}) {
  const { draft, setDraft, dob, setDob, showErrors, errors } = form;
  const set = <K extends keyof MedicalId>(key: K, value: MedicalId[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const setContact = (key: keyof EmergencyContact, value: string) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, [key]: value } }));
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);

  return (
    <>
      {showIdentity ? (
        <>
          <Field
            label="Your name"
            placeholder="Full name"
            icon="person-outline"
            value={draft.name}
            onChangeText={(v) => set('name', v)}
            autoComplete="name"
            error={err('name')}
          />
          <Field
            label="Phone number"
            placeholder="e.g. 024 123 4567"
            icon="call-outline"
            value={draft.phone}
            onChangeText={(v) => set('phone', v)}
            keyboardType="phone-pad"
            autoComplete="tel"
            error={err('phone')}
          />
        </>
      ) : null}

      <Field
        label="Location"
        placeholder="Town or area, e.g. Kumasi"
        icon="location-outline"
        value={draft.location}
        onChangeText={(v) => set('location', v)}
      />

      <View style={{ gap: Spacing.xs }}>
        <T variant="smallBold">Date of birth</T>
        <View style={styles.dobRow}>
          <DobBox label="Day" placeholder="DD" value={dob.day} max={2} onChange={(v) => setDob((d) => ({ ...d, day: v }))} />
          <DobBox label="Month" placeholder="MM" value={dob.month} max={2} onChange={(v) => setDob((d) => ({ ...d, month: v }))} />
          <DobBox label="Year" placeholder="YYYY" value={dob.year} max={4} onChange={(v) => setDob((d) => ({ ...d, year: v }))} wide />
        </View>
        {err('dob') ? (
          <T variant="small" color={Colors.danger}>
            {err('dob')}
          </T>
        ) : null}
      </View>

      <Choice label="Blood group" options={BLOOD_GROUPS} value={draft.bloodGroup} onChange={(v) => set('bloodGroup', v)} noneLabel="Not sure" />
      <Choice label="Sex" options={SEXES} value={draft.sex} onChange={(v) => set('sex', v)} />
      <Choice label="Sickle cell status" options={SICKLE_STATUSES} value={draft.sickleCell} onChange={(v) => set('sickleCell', v)} noneLabel="Not sure" />

      <Field label="Allergies" placeholder="e.g. Penicillin, groundnuts" value={draft.allergies} onChangeText={(v) => set('allergies', v)} />
      <Field label="Medical conditions" placeholder="e.g. Asthma, diabetes, hypertension" value={draft.conditions} onChangeText={(v) => set('conditions', v)} />
      <Field label="Medicines you take" placeholder="e.g. Metformin 500mg twice a day" value={draft.medications} onChangeText={(v) => set('medications', v)} />
      <Field
        label="Additional medical information"
        placeholder="e.g. Pregnant, pacemaker, NHIS member"
        value={draft.notes}
        onChangeText={(v) => set('notes', v)}
        multiline
      />

      {showContact ? (
        <>
          <SectionLabel>Emergency contact</SectionLabel>
          <Card>
            <Field label="Name" value={draft.contact.name} onChangeText={(v) => setContact('name', v)} />
            <Field
              label="Relationship"
              placeholder="e.g. Mother, husband, friend"
              value={draft.contact.relationship}
              onChangeText={(v) => setContact('relationship', v)}
            />
            <Field
              label="Phone number"
              placeholder="e.g. 024 123 4567"
              value={draft.contact.phone}
              onChangeText={(v) => setContact('phone', v)}
              keyboardType="phone-pad"
              error={err('contactPhone')}
            />
          </Card>
        </>
      ) : null}
    </>
  );
}

function DobBox({
  label,
  placeholder,
  value,
  onChange,
  max,
  wide,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  wide?: boolean;
}) {
  return (
    <TextInput
      accessibilityLabel={`Date of birth ${label.toLowerCase()}`}
      placeholder={placeholder}
      placeholderTextColor={Colors.placeholder}
      value={value}
      onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, max))}
      keyboardType="number-pad"
      maxLength={max}
      style={[styles.dob, wide && { flex: 1.6 }]}
    />
  );
}

const styles = StyleSheet.create({
  dobRow: { flexDirection: 'row', gap: Spacing.sm },
  dob: {
    ...Type.body,
    flex: 1,
    // Without these, web inputs keep their default ~200px width and overflow.
    flexBasis: 0,
    minWidth: 0,
    minHeight: MinTap,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
    textAlign: 'center',
  },
});
