import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { DEV_OTP, riderJobs, type RiderJob } from '../../lib/demo';
import { formatNGN } from '../../lib/money';
import { common, palette } from '../../lib/theme';

type JobState = Record<string, RiderJob['jobStatus']>;

export default function RiderJobs() {
  const [states, setStates] = useState<JobState>({});
  const [otp, setOtp] = useState<Record<string, string>>({});
  const [otpMsg, setOtpMsg] = useState<Record<string, string>>({});
  const [pod, setPod] = useState<Record<string, { photo: boolean; sig: boolean }>>({});
  const [cod, setCod] = useState<Record<string, string>>({});
  const [codMsg, setCodMsg] = useState<Record<string, string>>({});
  const [exc, setExc] = useState<Record<string, string>>({});
  const [excMsg, setExcMsg] = useState<Record<string, string>>({});

  const statusOf = (j: RiderJob): RiderJob['jobStatus'] => states[j.id] ?? j.jobStatus;
  const set = (id: string, s: RiderJob['jobStatus']) =>
    setStates((prev) => ({ ...prev, [id]: s }));

  const verifyOtp = (j: RiderJob) => {
    if ((otp[j.id] ?? '').trim() === DEV_OTP || (otp[j.id] ?? '').trim() === j.otp) {
      set(j.id, 'delivered');
      setOtpMsg((p) => ({ ...p, [j.id]: 'OTP verified — marked delivered.' }));
    } else {
      setOtpMsg((p) => ({ ...p, [j.id]: `Wrong code. Dev code is ${DEV_OTP}.` }));
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[common.title, { marginBottom: 4 }]}>Rider jobs queue</Text>
      <Text style={[common.muted, { marginBottom: 12 }]}>Offline-tolerant demo: status updates queue locally.</Text>
      {riderJobs.map((j) => {
        const st = statusOf(j);
        const p = pod[j.id] ?? { photo: false, sig: false };
        return (
          <View key={j.id} style={common.card}>
            <Text style={common.body}>
              {j.id} · {j.buyer}
            </Text>
            <Text style={common.muted}>{j.address}</Text>
            <Text style={common.muted}>
              Status: {st} · {formatNGN(j.totalKobo)}
              {j.codKobo ? ` · COD collect ${formatNGN(j.codKobo)}` : ' · prepaid'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Pressable style={[common.btnSecondary, { flex: 1 }]} onPress={() => set(j.id, 'accepted')}>
                <Text style={common.btnText}>Accept</Text>
              </Pressable>
              <Pressable style={[common.btnSecondary, { flex: 1 }]} onPress={() => set(j.id, 'picked_up')}>
                <Text style={common.btnText}>Pickup</Text>
              </Pressable>
              <Pressable style={[common.btn, { flex: 1 }]} onPress={() => set(j.id, 'delivered')}>
                <Text style={common.btnText}>Deliver</Text>
              </Pressable>
            </View>

            <Text style={[common.body, { fontWeight: '700', marginTop: 12 }]}>OTP check</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TextInput
                value={otp[j.id] ?? ''}
                onChangeText={(v) => setOtp((p2) => ({ ...p2, [j.id]: v }))}
                placeholder={`Enter OTP (dev ${DEV_OTP})`}
                keyboardType="number-pad"
                style={[common.input, { flex: 1 }]}
              />
              <Pressable style={common.btn} onPress={() => verifyOtp(j)}>
                <Text style={common.btnText}>Verify</Text>
              </Pressable>
            </View>
            {otpMsg[j.id] ? <Text style={common.muted}>{otpMsg[j.id]}</Text> : null}

            <Text style={[common.body, { fontWeight: '700', marginTop: 12 }]}>POD confirm</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Pressable
                style={[common.btnSecondary, { flex: 1, backgroundColor: p.photo ? palette.primary : palette.accent }]}
                onPress={() => setPod((prev) => ({ ...prev, [j.id]: { photo: true, sig: prev[j.id]?.sig ?? false } }))}
              >
                <Text style={common.btnText}>{p.photo ? 'Photo ✓' : 'Add photo'}</Text>
              </Pressable>
              <Pressable
                style={[common.btnSecondary, { flex: 1, backgroundColor: p.sig ? palette.primary : palette.accent }]}
                onPress={() => setPod((prev) => ({ ...prev, [j.id]: { photo: prev[j.id]?.photo ?? false, sig: true } }))}
              >
                <Text style={common.btnText}>{p.sig ? 'Signed ✓' : 'Signature'}</Text>
              </Pressable>
            </View>

            <Text style={[common.body, { fontWeight: '700', marginTop: 12 }]}>COD collection</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TextInput
                value={cod[j.id] ?? ''}
                onChangeText={(v) => setCod((p2) => ({ ...p2, [j.id]: v }))}
                placeholder="Amount collected ₦"
                keyboardType="numeric"
                style={[common.input, { flex: 1 }]}
              />
              <Pressable
                style={common.btn}
                onPress={() =>
                  setCodMsg((p2) => ({
                    ...p2,
                    [j.id]: cod[j.id]?.trim() ? `Recorded ₦${cod[j.id]} cash for ${j.id} (demo).` : 'Enter the cash amount first.',
                  }))
                }
              >
                <Text style={common.btnText}>Record</Text>
              </Pressable>
            </View>
            {codMsg[j.id] ? <Text style={common.muted}>{codMsg[j.id]}</Text> : null}

            <Text style={[common.body, { fontWeight: '700', marginTop: 12 }]}>Exception report</Text>
            <TextInput
              value={exc[j.id] ?? ''}
              onChangeText={(v) => setExc((p2) => ({ ...p2, [j.id]: v }))}
              placeholder="e.g. buyer absent, damaged carton…"
              style={[common.input, { marginTop: 4 }]}
            />
            <Pressable
              style={[common.btn, { marginTop: 8, backgroundColor: palette.danger }]}
              onPress={() =>
                setExcMsg((p2) => ({
                  ...p2,
                  [j.id]: exc[j.id]?.trim() ? `Exception filed for ${j.id}: “${exc[j.id]}” (demo).` : 'Describe the issue first.',
                }))
              }
            >
              <Text style={common.btnText}>Report exception</Text>
            </Pressable>
            {excMsg[j.id] ? <Text style={common.muted}>{excMsg[j.id]}</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
