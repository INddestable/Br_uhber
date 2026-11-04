import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from "./src/context/AuthContext";


export default function App() {
  return (
      <AuthProvider>
          <View style={styles.container}>
              <Text>Bruhber</Text>
              <StatusBar style="auto" />
          </View>
      </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
