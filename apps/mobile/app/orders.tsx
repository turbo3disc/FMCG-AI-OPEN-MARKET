import { FlatList, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { orders, productById, sellerOf } from '../lib/demo';
import { formatNGN } from '../lib/money';
import { common, palette } from '../lib/theme';

const STEPS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'completed'];

export function trackerStep(status: string): number {
  return Math.max(0, STEPS.indexOf(status));
}

export default function Orders() {
  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 16 }}>
      <Text style={[common.title, { marginBottom: 8 }]}>My orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => {
          const s = sellerOf(item.sellerId);
          const names = item.items.map((i) => productById(i.productId)?.name ?? i.productId).join(', ');
          return (
            <Link href={{ pathname: '/order/[id]', params: { id: item.id } }} asChild>
              <Pressable style={common.card}>
                <Text style={common.body}>
                  {item.id} · {s.name}
                </Text>
                <Text style={common.muted} numberOfLines={1}>
                  {names}
                </Text>
                <Text style={common.muted}>
                  {item.status.replaceAll('_', ' ')} · {item.paymentState} · {formatNGN(item.totalKobo)}
                </Text>
              </Pressable>
            </Link>
          );
        }}
      />
    </View>
  );
}
