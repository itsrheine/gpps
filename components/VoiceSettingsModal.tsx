import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export type AccentOption = 'classic' | 'british' | 'italian';
export type HumorLevel = 'low' | 'medium' | 'high';

type Props = {
  visible: boolean;
  onClose: () => void;
  accent: AccentOption;
  humorLevel: HumorLevel;
  autoCallouts: boolean;
  onSelectAccent: (accent: AccentOption) => void;
  onSelectHumor: (level: HumorLevel) => void;
  onToggleAutoCallouts: (value: boolean) => void;
};

export default function VoiceSettingsModal({
  visible,
  onClose,
  accent,
  humorLevel,
  autoCallouts,
  onSelectAccent,
  onSelectHumor,
  onToggleAutoCallouts,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Voice Settings</Text>

          <Text style={styles.section}>Accent</Text>
          <View style={styles.row}>
            {(['classic', 'british', 'italian'] as AccentOption[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.pill, accent === item && styles.active]}
                onPress={() => onSelectAccent(item)}
              >
                <Text style={[styles.pillText, accent === item && styles.activeText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Humor Level</Text>
          <View style={styles.row}>
            {(['low', 'medium', 'high'] as HumorLevel[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.pill, humorLevel === item && styles.active]}
                onPress={() => onSelectHumor(item)}
              >
                <Text style={[styles.pillText, humorLevel === item && styles.activeText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Auto Callouts</Text>
              <Text style={styles.toggleSub}>Speak automatically while driving</Text>
            </View>
            <Switch value={autoCallouts} onValueChange={onToggleAutoCallouts} />
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  active: {
    backgroundColor: '#111',
  },
  pillText: {
    color: '#111',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activeText: {
    color: '#fff',
  },
  toggleRow: {
    marginTop: 18,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 12,
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 24,
  },
  doneText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});