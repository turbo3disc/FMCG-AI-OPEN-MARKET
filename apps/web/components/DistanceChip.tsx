export default function DistanceChip({ km }: { km: number }) {
  const label = km <= 2 ? 'Very close' : km <= 5 ? 'Nearby' : 'City-wide (B2B)';
  return (
    <span className="badge b-sky">
      {km} km • {label}
    </span>
  );
}
