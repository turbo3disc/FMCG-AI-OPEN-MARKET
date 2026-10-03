import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { productById, searchOffers, sellerOf } from '../lib/demo';
import { formatNGN } from '../lib/money';
import { common, palette } from '../lib/theme';
import { addToCart } from '../lib/cart';

const RADII = [3, 5, 10];

export default function Search() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(typeof params.q === 'string' ? params.q : '');
  const [radius, setRadius] = useState(5);
  const [added, setAdded] = useState<string | null>(null);

  const results = useMemo(() => searchOffers(q, radius), [q, radius]);

  // Alternative sellers: same canonical products from other sellers (all demo sellers).
  const first = results[0];
  const alternatives = useMemo(() => {
    if (!first) return [];
    const p = productById(first.product.id);
    return (p?.offers ?? []).filter((o) => o.sellerId !== first.offer.sellerId);
  }, [first]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 16 }}>
      <TextInput value={q} onChangeText={setQ} placeholder="Product, brand, category…" style={[common.input, { marginBottom: 8 }]} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {RADII.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRadius(r)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: radius === r ? palette.primary : '#fff',
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <Text style={{ color: radius === r ? '#fff' : palette.text, fontWeight: '600' }}>{r}km</Text>
          </Pressable>
        ))}
      </View>
      {added ? <Text style={{ color: palette.primaryDark, marginBottom: 8 }}>{added}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(r, i) => `${r.product.id}-${r.offer.sellerId}-${i}`}
        ListEmptyComponent={<Text style={common.muted}>No offers within {radius}km. Try a wider radius.</Text>}
        renderItem={({ item }) => {
          const s = sellerOf(item.offer.sellerId);
          return (
            <View style={common.card}>
              <Text style={common.body}>
                {item.product.emoji} {item.product.name}
              </Text>
              <Text style={common.muted}>
                {s.name} · {s.distanceKm}km · MOQ {item.offer.moq} · updated {item.offer.updatedMinAgo}m ago
              </Text>
              <Text style={[common.body, { fontWeight: '700' }]}>{formatNGN(item.offer.priceKobo)}</Text>
              <Pressable
                style={[common.btn, { marginTop: 8 }]}
                onPress={async () => {
                  const { reset } = await addToCart(item.product.id, item.offer.sellerId, item.offer.moq);
                  setAdded(reset ? 'Cart reset to new seller.' : 'Added.');
                  setTimeout(() => setAdded(null), 1500);
                }}
              >
                <Text style={common.btnText}>Add (MOQ {item.offer.moq})</Text>
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          alternatives.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={[common.title, { marginBottom: 8 }]}>Alternative sellers</Text>
              {alternatives.map((o) => {
                const s = sellerOf(o.sellerId);
                return (
                  <View key={o.sellerId} style={common.card}>
                    <Text style={common.body}>{s.name} — Tier-{s.tier}</Text>
                    <Text style={common.muted}>
                      {formatNGN(o.priceKobo)} · stock {o.stock} · {s.distanceKm}km
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null
        }
      />
    </View>
  );
}
