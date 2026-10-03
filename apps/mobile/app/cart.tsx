import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { productById, sellerOf } from '../lib/demo';
import { formatNGN, totalsForQty } from '../lib/money';
import { common, palette } from '../lib/theme';
import { loadCart, updateQty, type Cart } from '../lib/cart';

export default function CartScreen() {
  const [cart, setCart] = useState<Cart>({ sellerId: null, lines: [] });

  useFocusEffect(useCallback(() => {
    loadCart().then(setCart);
  }, []));

  const seller = cart.sellerId ? sellerOf(cart.sellerId) : null;
  let subtotal = 0;
  let discount = 0;

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 16 }}>
      <Text style={[common.title, { marginBottom: 8 }]}>Cart (single seller)</Text>
      {!cart.lines.length ? (
        <Text style={common.muted}>Cart is empty. Add offers from Home or Search.</Text>
      ) : (
        <>
          <Text style={[common.muted, { marginBottom: 8 }]}>
            Seller: {seller?.name} · {seller?.market}
          </Text>
          {cart.lines.map((l) => {
            const p = productById(l.productId);
            if (!p) return null;
            const offer = p.offers.find((o) => o.sellerId === l.sellerId) ?? p.offers[0];
            const t = totalsForQty(offer.priceKobo, offer.bulkBreaks, l.qty);
            subtotal += t.netKobo;
            discount += t.discountKobo;
            return (
              <View key={l.productId} style={common.card}>
                <Text style={common.body}>
                  {p.emoji} {p.name}
                </Text>
                <Text style={common.muted}>
                  {formatNGN(t.unitKobo)} each · bulk breaks: {offer.bulkBreaks.length ? offer.bulkBreaks.map((b) => `${b.minQty}+ ${formatNGN(b.priceKobo)}`).join(', ') : '—'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Pressable
                    style={[common.btnSecondary, { paddingHorizontal: 12 }]}
                    onPress={() => updateQty(l.productId, l.qty - 1).then(setCart)}
                  >
                    <Text style={common.btnText}>−</Text>
                  </Pressable>
                  <Text style={common.body}>{l.qty}</Text>
                  <Pressable
                    style={[common.btnSecondary, { paddingHorizontal: 12 }]}
                    onPress={() => updateQty(l.productId, l.qty + 1).then(setCart)}
                  >
                    <Text style={common.btnText}>+</Text>
                  </Pressable>
                  <Text style={[common.body, { fontWeight: '700', marginLeft: 'auto' }]}>{formatNGN(t.netKobo)}</Text>
                </View>
              </View>
            );
          })}
          <View style={common.card}>
            <Text style={common.body}>Subtotal: {formatNGN(subtotal)}</Text>
            <Text style={common.body}>Bulk savings: −{formatNGN(discount)}</Text>
            <Text style={common.muted}>Delivery fee calculated at checkout.</Text>
          </View>
          <Link href="/checkout" asChild>
            <Pressable style={common.btn}>
              <Text style={common.btnText}>Go to checkout</Text>
            </Pressable>
          </Link>
        </>
      )}
    </View>
  );
}
