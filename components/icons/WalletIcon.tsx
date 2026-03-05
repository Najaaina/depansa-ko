import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function WalletIcon({ color = "#6c5ce7" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={15} rx={3} stroke={color} strokeWidth={1.8} />
      <Path d="M2 10h20" stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={15} r={1.5} fill={color} />
    </Svg>
  );
}
