import Svg, { Path, Rect } from "react-native-svg";

export default function CreateWalletIcon({ color = "#3b82f6" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={15} rx={3} stroke={color} strokeWidth={1.8} />
      <Path d="M2 10h20" stroke={color} strokeWidth={1.8} />
      <Path d="M12 14v4M10 16h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}