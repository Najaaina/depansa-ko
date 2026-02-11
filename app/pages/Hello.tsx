import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function Hello() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex-row">
          <View className="flex-1 gap-1.5">
            <CardTitle>Here is our baseline little peasant</CardTitle>
            <CardDescription>3 weeks to go</CardDescription>
          </View>
        </CardHeader>
      </Card>
    </View>
  );
}
