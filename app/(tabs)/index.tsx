import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import VoiceSettingsModal from '../../components/VoiceSettingsModal';

// REPLACE WITH YOUR NEW ELEVENLABS KEY
const ELEVEN_API_KEY = 'sk_0325a06059d39f73ee9f024ef15d4f781bda99277c8049e9';
const VOICE_ID = 'oTQK6KgOJHp8UGGZjwUu';

export default function HomeScreen() {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [accent, setAccent] = useState<string>('default');
  const [humorLevel, setHumorLevel] = useState<string>('normal');
  const [autoCallouts, setAutoCallouts] = useState(true);

const getPersonalityLine = () => {
  if (accent === 'indian') {
    return "We are continuing navigation. Keep going, my friend.";
  }

  if (accent === 'british') {
    return "Quite a lovely route ahead.";
  }

  if (humorLevel === 'funny') {
    return "I hope you're not driving like that on purpose.";
  }

  return "Continuing navigation.";
};

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAccent = await AsyncStorage.getItem('accent');
        const savedHumor = await AsyncStorage.getItem('humor');
        const savedCallouts = await AsyncStorage.getItem('callouts');

        if (savedAccent) setAccent(savedAccent);
        if (savedHumor) setHumorLevel(savedHumor);
        if (savedCallouts !== null) setAutoCallouts(savedCallouts === 'true');
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const playVoice = async (text: string) => {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVEN_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      const contentType = response.headers.get('content-type') || '';
      console.log('status:', response.status, 'content-type:', contentType);

      if (!response.ok || !contentType.includes('audio')) {
        const errorText = await response.text();
        console.log('ElevenLabs returned non-audio:', errorText);
        return;
      }

      const blob = await response.blob();
      const fileUri = `${FileSystem.cacheDirectory}voice.mp3`;

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        try {
          if (typeof reader.result !== 'string') {
            console.log('reader.result was not a string');
            return;
          }

          const parts = reader.result.split(',');
          if (parts.length < 2) {
            console.log('Invalid data URL from FileReader');
            return;
          }

          const base64 = parts[1];

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
          await sound.playAsync();

          sound.setOnPlaybackStatusUpdate((status) => {
            if ('didJustFinish' in status && status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } catch (err) {
          console.log('Playback/write error:', err);
        }
      };
    } catch (error) {
      console.log('Direct TTS error:', error);
    }
  };

  const handleMicPress = () => {
    const newState = !isListening;
    setIsListening(newState);

    if (newState) {
      playVoice('Listening mode on.');
    } else {
      playVoice('Listening mode off.');
    }
  };

  const handleCommand = () => {
    const text = command.toLowerCase();

    if (text.includes('turn off')) {
      setAutoCallouts(false);
      playVoice('Callouts off.');
    } else if (text.includes('turn on')) {
      setAutoCallouts(true);
      playVoice('Callouts on.');
    } else if (text.includes('funny')) {
      setHumorLevel('funny');
      playVoice('Humor mode activated.');
    } else if (text.includes('british')) {
      setAccent('british');
      playVoice('Switching to British voice.');
    } else if (text.includes('indian')) {
      setAccent('indian');
      playVoice('Switching to Indian voice.');
    } else {
      playVoice(`Command received: ${command}`);
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
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7249,
          longitude: -122.1561,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />

      <View style={styles.searchBar}>
        <Text style={{ color: '#000' }}>San Leandro</Text>
      </View>

      <View style={styles.commandContainer}>
        <TextInput
          value={command}
          onChangeText={setCommand}
          placeholder="Type command..."
          style={styles.input}
        />

        <TouchableOpacity onPress={handleCommand} style={styles.button}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMicPress}
          style={[styles.button, isListening && styles.micActive]}
        >
          <Text style={styles.buttonText}>🎙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={styles.bigButtonText}>Voice Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => playVoice(getPersonalityLine())}
        >
          <Text style={styles.bigButtonText}>Preview Voice</Text>
        </TouchableOpacity>
      </View>

      <VoiceSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        accent={accent}
        humorLevel={humorLevel}
        autoCallouts={autoCallouts}
        setAccent={setAccent}
        setHumorLevel={setHumorLevel}
        setAutoCallouts={setAutoCallouts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  searchBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
  },

  commandContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 15,
    marginLeft: 8,
  },

  buttonText: {
    color: '#fff',
  },

  micActive: {
    backgroundColor: '#d92d20',
  },

  actions: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },

  bigButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },

  bigButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});