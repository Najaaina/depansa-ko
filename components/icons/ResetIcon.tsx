import Svg, { Path } from "react-native-svg";

export default function ResetIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4v5h5M20 12A8 8 0 006.93 6.93L4 9M20 20v-5h-5M4 12a8 8 0 0013.07 5.07L20 15"
        stroke="#7c3aed"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 8v4l3 2" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}