import Svg, { Path } from "react-native-svg";

export default function SignOutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#9ca3af" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke="#9ca3af" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}