import Svg, { Circle, Path } from "react-native-svg";

export default function PersonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke="#9ca3af" strokeWidth={1.8} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}