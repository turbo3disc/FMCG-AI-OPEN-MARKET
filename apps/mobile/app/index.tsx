import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { bestOffer, categories, products, sellerOf, sellers } from '../lib/demo';
import { formatNGN } from '../lib/money';
import { common, palette } from '../lib/theme';
import { addToCart } from '../lib/cart';

export default function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const featured = products.filter((p) => !cat || p.category === cat).slice(0, 6);
  const nearby = [...sellers].sort((a, b) => a.distanceKm - b.distanceKm);

  const onAdd = async (productId: string, sellerId: string) => {
    const { reset } = await addToCart(productId, sellerId, 1);
    setAdded(reset ? 'Cart reset — single seller only. Added.' : 'Added to cart.');
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 16 }}
      data={featured}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={
        <View>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search Indomie, Milo, sugar…"
            style={[common.input, { marginBottom: 12 }]}
          />
          <Link href={{ pathname: '/search', params: q ? { q } : {} }} asChild>
            <Pressable style={[common.btn, { marginBottom: 12 }]}>
              <Text style={common.btnText}>Search nearby</Text>
            </Pressable>
          </Link>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {categories.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCat(cat === c ? null : c)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: cat === c ? palette.primary : '#fff',
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <Text style={{ color: cat === c ? '#fff' : palette.text, fontWeight: '600' }}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[common.title, { marginBottom: 8 }]}>Featured offers</Text>
          {added ? <Text style={{ color: palette.primaryDark, marginBottom: 8 }}>{added}</Text> : null}
        </View>
      }
      renderItem={({ item }) => {
        const offer = bestOffer(item);
        const seller = sellerOf(offer.sellerId);
        return (
          <View style={common.card}>
            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            <Text style={common.title}>{item.name}</Text>
            <Text style={common.muted}>
              {seller.name} · {seller.distanceKm}km · Tier-{seller.tier}
            </Text>
            <Text style={[common.body, { fontWeight: '700', marginVertical: 4 }]}>
              {formatNGN(offer.priceKobo)}/{item.unit}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={[common.btn, { flex: 1 }]} onPress={() => onAdd(item.id, offer.sellerId)}>
                <Text style={common.btnText}>Add</Text>
              </Pressable>
              <Link href={{ pathname: '/search', params: { q: item.brand } }} asChild>
                <Pressable style={[common.btnSecondary, { flex: 1 }]}>
                  <Text style={common.btnText}>Compare</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        );
      }}
      ListFooterComponent={
        <View>
          <Text style={[common.title, { marginVertical: 8 }]}>Nearby sellers</Text>
          {nearby.map((s) => (
            <View key={s.id} style={common.card}>
              <Text style={common.body}>
                {s.name} — {s.market}
              </Text>
              <Text style={common.muted}>
                {s.distanceKm}km · ★{s.rating} ({s.reviews}) · {s.codEligible ? 'COD ✓' : 'Prepaid only'}
              </Text>
            </View>
          ))}
        </View>
      }
    />
  );
}
