import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type VoiceOption = {
  id: string;
  label: string;
  line: string;
};

const VOICES: VoiceOption[] = [
  {
    id: 'italian',
    label: 'Italian Restaurant',
    line: "There's an Italian restaurant nearby.",
  },
  {
    id: 'british',
    label: 'British',
    line: "Right then, there's a lovely spot just ahead.",
  },
  {
    id: 'funny',
    label: 'Funny',
    line: "Heads up. Pasta temptation detected.",
  },
];

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);

  const speakSelectedVoice = () => {
    Speech.speak(selectedVoice.line);
  };

  const chooseVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
    setModalVisible(false);
    Speech.speak(voice.line);
  };

  return (
    <View style={styles.container}>
      <View style={styles.fakeMap}>
        <Text style={styles.text}>🗺️ GPPS Map Loading...</Text>
        <Text style={styles.subtext}>Current voice: {selectedVoice.label}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.primaryButtonText}>Choose Voice</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={speakSelectedVoice}>
        <Text style={styles.secondaryButtonText}>Test Voice</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose a Voice</Text>

            {VOICES.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={styles.voiceOption}
                onPress={() => chooseVoice(voice)}
              >
                <Text style={styles.voiceOptionText}>{voice.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fakeMap: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtext: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  primaryButton: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#111',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  voiceOption: {
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  voiceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 4,
    padding: 14,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});