import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('Bilal ALTAN');

  const handleSwitch = () => {
    setName((prev) => (prev === 'Bilal ALTAN' ? 'Şeyma ALTAN' : 'Bilal ALTAN'));
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>{name}</Text>
      <Button title="İsmi Değiştir" onPress={handleSwitch} />
      <StatusBar style="auto" />
    </View>
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
