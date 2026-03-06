import Svg, { Circle, Path } from "react-native-svg";

export default function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#9ca3af" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" stroke="#9ca3af" strokeWidth={1.8} />
      <Circle cx={12} cy={16} r={1.5} fill="#9ca3af" />
    </Svg>
  );
}