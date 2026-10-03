import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { productById, sellerOf } from '../lib/demo';
import { formatNGN, totalsForQty } from '../lib/money';
import { common, palette } from '../lib/theme';
import { clearCart, loadCart, type Cart } from '../lib/cart';

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ sellerId: null, lines: [] });
  const [paid, setPaid] = useState(false);

  useFocusEffect(useCallback(() => {
    loadCart().then(setCart);
    setPaid(false);
  }, []));

  const seller = cart.sellerId ? sellerOf(cart.sellerId) : null;
  const fee = seller?.deliveryFeeKobo ?? 0;
  let subtotal = 0;
  let discount = 0;
  for (const l of cart.lines) {
    const p = productById(l.productId);
    if (!p) continue;
    const offer = p.offers.find((o) => o.sellerId === l.sellerId) ?? p.offers[0];
    const t = totalsForQty(offer.priceKobo, offer.bulkBreaks, l.qty);
    subtotal += t.netKobo;
    discount += t.discountKobo;
  }
  const total = subtotal + fee;

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 16 }}>
      <Text style={[common.title, { marginBottom: 8 }]}>Checkout</Text>
      <View style={common.card}>
        <Text style={common.body}>Items: {formatNGN(subtotal)}</Text>
        <Text style={common.body}>Bulk savings: −{formatNGN(discount)}</Text>
        <Text style={common.body}>Delivery fee: {formatNGN(fee)}</Text>
        <Text style={[common.title, { marginTop: 4 }]}>Total: {formatNGN(total)}</Text>
      </View>
      <View style={[common.card, { borderColor: palette.info }]}>
        <Text style={[common.body, { fontWeight: '700' }]}>Buyer protection + COD</Text>
        <Text style={common.muted}>
          Protected payments are held until delivery is confirmed (OTP/POD). COD is available only
          from Tier-2 sellers within policy caps; the rider records cash collected on delivery.
        </Text>
      </View>
      {paid ? (
        <View style={[common.card, { borderColor: palette.primary }]}>
          <Text style={common.body}>Payment confirmed (demo). Order placed with {seller?.name}.</Text>
          <Pressable
            style={[common.btn, { marginTop: 8 }]}
            onPress={async () => {
              await clearCart();
              router.replace('/orders');
            }}
          >
            <Text style={common.btnText}>View orders</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[common.btn, { opacity: cart.lines.length ? 1 : 0.5 }]} disabled={!cart.lines.length} onPress={() => setPaid(true)}>
          <Text style={common.btnText}>Pay {formatNGN(total)} (demo)</Text>
        </Pressable>
      )}
    </View>
  );
}
