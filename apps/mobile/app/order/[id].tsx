import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { orders, productById, sellerOf } from '../../lib/demo';
import { formatNGN } from '../../lib/money';
import { common, palette } from '../../lib/theme';
import { trackerStep } from '../orders';

const LABELS = ['Confirmed', 'Preparing', 'Out for delivery', 'Delivered', 'Completed'];

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const seller = sellerOf(order.sellerId);
  const step = trackerStep(order.status);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 16 }}>
      <Text style={common.title}>
        {order.id} · {formatNGN(order.totalKobo)}
      </Text>
      <Text style={[common.muted, { marginBottom: 12 }]}>
        {seller.name} · {order.paymentState} · fee {formatNGN(order.deliveryFeeKobo)}
      </Text>
      {LABELS.map((label, i) => (
        <View key={label} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          <Text>{i <= step ? '●' : '○'}</Text>
          <Text style={[common.body, { color: i <= step ? palette.primaryDark : palette.muted, fontWeight: i === step ? '700' : '400' }]}>
            {label}
          </Text>
        </View>
      ))}
      <View style={[common.card, { marginTop: 12 }]}>
        <Text style={[common.body, { fontWeight: '700' }]}>Delivery OTP (show rider)</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: 4 }}>{order.otp}</Text>
        <Text style={common.muted}>Rider asks for this code at handover. Never share in advance.</Text>
      </View>
      {order.items.map((i) => (
        <View key={i.productId} style={common.card}>
          <Text style={common.body}>
            {productById(i.productId)?.name ?? i.productId} × {i.qty}
          </Text>
          <Text style={common.muted}>{formatNGN(i.unitKobo)} each</Text>
        </View>
      ))}
    </View>
  );
}
