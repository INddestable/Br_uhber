
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import WorkScreen from "./work/WorkScreen";
import EarningsScreen from "./earnings/EarningsScreen";
import ProfileScreen from "./profile/ProfileScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainScreen() {
    const { colors, typography } = useTheme();
    const { t, i18n } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.secondaryText,

                tabBarStyle: {
                    backgroundColor: colors.surface,
                    paddingTop: 10,
                    height: 100
                },

                tabBarLabelStyle: {
                    fontSize: 15,
                    paddingTop: 10,
                    fontFamily: typography.regular
                },
            }}
        >
            <Tab.Screen
                name="Work"
                component={WorkScreen}
                options={{
                    tabBarLabel: t("navigation.work"),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "car-sharp" : "car-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{
                    tabBarLabel: t("navigation.earnings"),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "wallet-sharp" : "wallet-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: t("navigation.profile"),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person-sharp" : "person-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: t("navigation.settings"),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "settings-sharp" : "settings-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            
        </Tab.Navigator>
    );
}
