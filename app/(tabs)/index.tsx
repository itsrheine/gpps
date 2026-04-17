import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  { id: '2', type: 'italian', name: 'Luigi’s Trattoria' },
  { id: '3', type: 'gas', name: 'QuickFuel Station' },
];

export default function HomeScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [accent, setAccent] = useState<AccentOption>('classic');
  const [humorLevel, setHumorLevel] = useState<HumorLevel>('medium');
  const [autoCallouts, setAutoCallouts] = useState(true);

  const [isDriving, setIsDriving] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(-1);
  const [destination, setDestination] = useState('Downtown San Francisco');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getLineForPlace = (place: PlaceStop) => {
    if (accent === 'italian' && place.type === 'italian') {
      if (humorLevel === 'high') return `Mamma mia, pasta temptation ahead at ${place.name}.`;
      if (humorLevel === 'low') return `Italian restaurant nearby: ${place.name}.`;
      return `There is a lovely Italian restaurant nearby: ${place.name}.`;
    }

    if (accent === 'british') {
      if (place.type === 'coffee') {
        if (humorLevel === 'high') return `Bit of a coffee emergency, is it? ${place.name} is ahead.`;
        if (humorLevel === 'low') return `Coffee shop nearby: ${place.name}.`;
        return `Quite a nice coffee spot ahead: ${place.name}.`;
      }

      if (place.type === 'gas') {
        if (humorLevel === 'high') return `Petrol stop ahead. Let us not be dramatic about the fuel gauge.`;
        if (humorLevel === 'low') return `Petrol station nearby: ${place.name}.`;
        return `There is a petrol station nearby: ${place.name}.`;
      }
    }

    if (humorLevel === 'high') {
      if (place.type === 'italian') return `Pasta temptation detected at ${place.name}.`;
      if (place.type === 'coffee') return `Caffeine alert. ${place.name} is coming up.`;
      return `Fuel check. ${place.name} is nearby if your tank is feeling dramatic.`;
    }

    if (humorLevel === 'low') {
      if (place.type === 'italian') return `Italian restaurant nearby: ${place.name}.`;
      if (place.type === 'coffee') return `Coffee shop nearby: ${place.name}.`;
      return `Gas station nearby: ${place.name}.`;
    }

    if (place.type === 'italian') return `There is an Italian restaurant nearby: ${place.name}.`;
    if (place.type === 'coffee') return `There is a coffee shop nearby: ${place.name}.`;
    return `There is a gas station nearby: ${place.name}.`;
  };

  const speakPlace = (place: PlaceStop) => {
    if (!autoCallouts) return;
    Speech.speak(getLineForPlace(place));
  };

  const startDrive = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsDriving(true);
    setCurrentStopIndex(-1);
    Speech.speak(`Starting route to ${destination}.`);

    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index >= ROUTE_STOPS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsDriving(false);
        Speech.speak('Drive simulation complete.');
        return;
      }

      setCurrentStopIndex(index);
      speakPlace(ROUTE_STOPS[index]);
      index += 1;
    }, 5000);
  };

  const stopDrive = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDriving(false);
    Speech.stop();
  };

  const previewVoice = () => {
    Speech.speak(`Accent ${accent}. Humor ${humorLevel}. Auto callouts ${autoCallouts ? 'on' : 'off'}.`);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentPlace = currentStopIndex >= 0 ? ROUTE_STOPS[currentStopIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.fakeMap}>
        <View style={styles.mapBlobTopLeft} />
        <View style={styles.mapBlobBottomRight} />
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Where to?"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.topChips}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{accent}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{humorLevel} humor</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{autoCallouts ? 'auto on' : 'auto off'}</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetHandle}>﹘</Text>
        <Text style={styles.routeTitle}>{destination}</Text>
        <Text style={styles.routeMeta}>18 min • 6.4 mi • light traffic</Text>

        {currentPlace ? (
          <View style={styles.placeCard}>
            <Text style={styles.placeTitle}>Passing now</Text>
            <Text style={styles.placeName}>{currentPlace.name}</Text>
            <Text style={styles.placeType}>Type: {currentPlace.type}</Text>
          </View>
        ) : (
          <View style={styles.placeCard}>
            <Text style={styles.placeTitle}>Current GPPS Mode</Text>
            <Text style={styles.placeName}>Accent: {accent}</Text>
            <Text style={styles.placeType}>
              Humor: {humorLevel} • Auto: {autoCallouts ? 'On' : 'Off'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.voiceButton} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.voiceButtonText}>Voice Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.previewButton} onPress={previewVoice}>
          <Text style={styles.previewButtonText}>Preview Voice</Text>
        </TouchableOpacity>

        {!isDriving ? (
          <TouchableOpacity style={styles.startButton} onPress={startDrive}>
            <Text style={styles.startButtonText}>Start Drive</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopDrive}>
            <Text style={styles.stopButtonText}>Stop Drive</Text>
          </TouchableOpacity>
        )}
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
  container: {
    flex: 1,
    backgroundColor: '#dfe7ef',
  },
  fakeMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#dfe7ef',
  },
  mapBlobTopLeft: {
    position: 'absolute',
    top: 110,
    left: 20,
    width: 180,
    height: 120,
    backgroundColor: '#c9d7c1',
    borderRadius: 40,
    transform: [{ rotate: '-8deg' }],
  },
  mapBlobBottomRight: {
    position: 'absolute',
    right: 10,
    top: 280,
    width: 220,
    height: 150,
    backgroundColor: '#c9d7c1',
    borderRadius: 50,
    transform: [{ rotate: '12deg' }],
  },
  roadHorizontal: {
    position: 'absolute',
    top: 230,
    left: -20,
    right: -20,
    height: 20,
    backgroundColor: '#f7f2e7',
    borderRadius: 20,
    transform: [{ rotate: '-12deg' }],
  },
  roadVertical: {
    position: 'absolute',
    top: 120,
    left: 140,
    width: 22,
    height: 260,
    backgroundColor: '#f7f2e7',
    borderRadius: 20,
    transform: [{ rotate: '18deg' }],
  },
  searchBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffffee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    fontSize: 20,
    color: '#666',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  topChips: {
    position: 'absolute',
    top: 126,
    left: 16,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    right: 16,
  },
  chip: {
    backgroundColor: '#ffffffdd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  sheetHandle: {
    alignSelf: 'center',
    fontSize: 28,
    color: '#bbb',
    marginTop: -8,
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  routeMeta: {
    marginTop: 6,
    fontSize: 15,
    color: '#666',
  },
  placeCard: {
    marginTop: 18,
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 20,
  },
  placeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textTransform: 'capitalize',
  },
  placeType: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  voiceButton: {
    marginTop: 16,
    backgroundColor: '#f2f2f2',
    paddingVertical: 16,
    borderRadius: 26,
  },
  voiceButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  previewButton: {
    marginTop: 12,
    backgroundColor: '#e9eefc',
    paddingVertical: 16,
    borderRadius: 26,
  },
  previewButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  startButton: {
    marginTop: 12,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 26,
  },
  startButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stopButton: {
    marginTop: 12,
    backgroundColor: '#d92d20',
    paddingVertical: 16,
    borderRadius: 26,
  },
  stopButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});