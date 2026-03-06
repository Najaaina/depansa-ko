import Svg, { Circle, Path } from "react-native-svg";

export default function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" stroke="#9ca3af" strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={3} stroke="#9ca3af" strokeWidth={1.8} />
    </Svg>
  ) : (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-6.4 0-10-8-10-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c6.4 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="#9ca3af" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}