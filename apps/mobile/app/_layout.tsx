import { Tabs } from 'expo-router';
import { palette } from '../lib/theme';

// Root tab layout: buyer tabs (home, search, cart, orders) + logistics jobs.
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.primary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: palette.primaryDark,
        tabBarInactiveTintColor: '#8a8a8a',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="checkout" options={{ title: 'Checkout', href: null }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="order/[id]" options={{ title: 'Order', href: null }} />
      <Tabs.Screen name="(logistics)/jobs" options={{ title: 'Rider Jobs' }} />
    </Tabs>
  );
}
