import { Text, View } from 'react-native';
import { Hello } from './pages/Hello';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Hello />
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
