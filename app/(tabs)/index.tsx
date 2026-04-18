import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import VoiceSettingsModal, {
  AccentOption,
  HumorLevel,
} from '../../components/VoiceSettingsModal';

type PlaceStop = {
  id: string;
  type: 'italian' | 'coffee' | 'gas';
  name: string;
};

const ROUTE_STOPS: PlaceStop[] = [
  { id: '1', type: 'coffee', name: 'Morning Brew Cafe' },
  { id: '2', type: 'italian', name: "Luigi's Trattoria" },
  { id: '3', type: 'gas', name: 'QuickFuel Station' },
];

const STORAGE_KEYS = {
  accent: 'gpps_accent',
  humorLevel: 'gpps_humorLevel',
  autoCallouts: 'gpps_autoCallouts',
};

export default function HomeScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [accent, setAccent] = useState<AccentOption>('classic');
  const [humorLevel, setHumorLevel] = useState<HumorLevel>('medium');
  const [autoCallouts, setAutoCallouts] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [destination, setDestination] = useState('San Leandro');
  const [command, setCommand] = useState('');

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAccent = await AsyncStorage.getItem(STORAGE_KEYS.accent);
        const savedHumor = await AsyncStorage.getItem(STORAGE_KEYS.humorLevel);
        const savedAuto = await AsyncStorage.getItem(STORAGE_KEYS.autoCallouts);

        if (savedAccent) setAccent(savedAccent as AccentOption);
        if (savedHumor) setHumorLevel(savedHumor as HumorLevel);
        if (savedAuto !== null) setAutoCallouts(savedAuto === 'true');
      } catch (e) {
        console.log(e);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    AsyncStorage.setItem(STORAGE_KEYS.accent, accent);
    AsyncStorage.setItem(STORAGE_KEYS.humorLevel, humorLevel);
    AsyncStorage.setItem(STORAGE_KEYS.autoCallouts, autoCallouts.toString());
  }, [accent, humorLevel, autoCallouts, settingsLoaded]);

  const previewVoice = () => {
    Speech.speak(`Accent ${accent}. Humor ${humorLevel}.`);
  };

  const speakPlace = (place: PlaceStop) => {
    let message = '';
    let language = 'en-US';

    if (accent === 'italian') {
      language = 'it-IT';
    } else if (accent === 'british') {
      language = 'en-GB';
    }

    if (humorLevel === 'high') {
      if (place.type === 'italian') message = `Mamma mia, pasta alert at ${place.name}.`;
      else if (place.type === 'coffee') message = `Coffee on your right. Stay alive.`;
      else message = `Gas station coming up. Do not get stranded.`;
    } else if (humorLevel === 'low') {
      message = `${place.type} nearby. ${place.name}.`;
    } else {
      message = `There is a ${place.type} nearby. ${place.name}.`;
    }

    if (autoCallouts) {
      Speech.speak(message, { language });
    }
  };

  const startFakeNavigation = () => {
    Speech.stop();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    Speech.speak(`Starting navigation to ${destination}.`);

    ROUTE_STOPS.forEach((place, index) => {
      const t = setTimeout(() => speakPlace(place), (index + 1) * 4000);
      timeoutsRef.current.push(t);
    });
  };

  const handleCommand = () => {
    const text = command.toLowerCase();

    if (text.includes('british')) {
      setAccent('british');
      Speech.speak('Switching to British voice.');
    } else if (text.includes('italian')) {
      setAccent('italian');
      Speech.speak('Switching to Italian voice.');
    } else if (text.includes('classic')) {
      setAccent('classic');
      Speech.speak('Switching to classic voice.');
    }

    if (text.includes('funny')) {
      setHumorLevel('high');
      Speech.speak('Humor increased.');
    } else if (text.includes('serious')) {
      setHumorLevel('low');
      Speech.speak('Humor lowered.');
    }

    if (text.includes('turn off')) {
      setAutoCallouts(false);
      Speech.speak('Callouts off.');
    } else if (text.includes('turn on')) {
      setAutoCallouts(true);
      Speech.speak('Callouts on.');
    }

    setCommand('');
  };

  if (!settingsLoaded) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.7249,
          longitude: -122.1561,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude: 37.7249, longitude: -122.1561 }} />
      </MapView>

      <View style={styles.searchBar}>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Where to?"
          style={styles.input}
        />
      </View>

      <View style={styles.commandBar}>
        <TextInput
          value={command}
          onChangeText={setCommand}
          placeholder="Try: 'British voice'..."
          style={styles.commandInput}
        />
        <TouchableOpacity onPress={handleCommand} style={styles.commandBtn}>
          <Text style={styles.commandBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btn} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.btnText}>Voice Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={previewVoice}>
          <Text style={styles.btnText}>Preview Voice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={startFakeNavigation}>
          <Text style={styles.btnText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>

      <VoiceSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        accent={accent}
        humorLevel={humorLevel}
        autoCallouts={autoCallouts}
        onSelectAccent={setAccent}
        onSelectHumor={setHumorLevel}
        onToggleAutoCallouts={setAutoCallouts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  searchBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 12,
  },

  commandBar: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
  },

  commandInput: { flex: 1 },

  commandBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },

  commandBtnText: { color: '#fff' },

  input: { fontSize: 16 },

  bottom: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },

  btn: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});