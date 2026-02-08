import 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { BlurPillTabBar } from '@/components/blur-pill-tab-bar';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
    const colorScheme = useColorScheme() ?? 'light';

    const text = Colors[colorScheme].text;
    const inactiveIcon = Colors[colorScheme].tabIconDefault;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: text,
                tabBarInactiveTintColor: inactiveIcon,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme].tabBarBackground,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 80,
                    justifyContent: 'space-between',
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                tabBarButton: (props) => <HapticTab {...props} />,
            }}>
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon
                            name="time"
                            focused={focused}
                            color={color}
                            accent={text}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Record',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon
                            name="mic"
                            focused={focused}
                            color={color}
                            accent={text}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon
                            name="person-outline"
                            focused={focused}
                            color={color}
                            accent={text}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

type TabIconProps = {
    name:
        | keyof typeof Ionicons.glyphMap
        | 'person-outline'
        | 'mic'
        | 'time';
    focused: boolean;
    color: string;
    accent: string;
};

function TabIcon({name, focused, color, accent}: TabIconProps) {
    const tint = focused ? accent : color;

    return (
        <View style={{alignItems: 'center', justifyContent: 'center', gap: 2}}>
            <View
                style={{
                    width: 32,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: accent,
                    marginBottom: 2,
                    opacity: focused ? 1 : 0,
                }}
            />
            <Ionicons
                name={name as keyof typeof Ionicons.glyphMap}
                size={22}
                color={tint}
            />
        </View>
    );
}
