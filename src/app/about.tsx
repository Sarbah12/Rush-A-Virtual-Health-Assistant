import { useLocalSearchParams } from 'expo-router';

import { Card, Logo, Screen, T, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function About() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const privacyFirst = section === 'privacy';

  const privacy = (
    <Card key="privacy">
      <T variant="heading">Privacy</T>
      <T>
        Rush has no account. Your profile, medical ID and everything else you enter are saved only on this phone.
        Rush keeps no copy and nothing is shared or sold.
      </T>
      <T>
        When the chat arrives, your messages will be sent securely to an AI service to get a reply. They will not be
        stored on a server. You can delete everything at any time from Settings.
      </T>
    </Card>
  );

  const about = (
    <Card key="about">
      <T variant="heading">What Rush is</T>
      <T>
        Rush is a pocket health assistant for Ghana. It helps you understand how you feel, keep your medical
        information to hand, and get help fast in an emergency.
      </T>
      <T variant="bodyBold">Rush is not a doctor</T>
      <T>
        It gives general guidance only. It cannot examine you, diagnose you or prescribe medicine. For anything
        serious or that keeps going, see a pharmacist, nurse or doctor. In an emergency call 112 or the ambulance on
        193.
      </T>
    </Card>
  );

  return (
    <Screen back>
      <Logo size={48} />
      <Title>{privacyFirst ? 'Privacy' : 'About Rush'}</Title>
      {privacyFirst ? [privacy, about] : [about, privacy]}
      <T variant="small" color={Colors.textMuted} style={{ textAlign: 'center' }}>
        Version 1.0
      </T>
    </Screen>
  );
}
