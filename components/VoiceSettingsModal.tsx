import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export type AccentOption = 'classic' | 'british' | 'italian';
export type HumorLevel = 'low' | 'medium' | 'high';

type VoiceSettingsModalProps = {
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
}: VoiceSettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Voice Settings</Text>

          <Text style={styles.sectionLabel}>Accent</Text>
          <View style={styles.row}>
            {(['classic', 'british', 'italian'] as AccentOption[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.pill, accent === item && styles.pillActive]}
                onPress={() => onSelectAccent(item)}
              >
                <Text style={[styles.pillText, accent === item && styles.pillTextActive]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Humor Level</Text>
          <View style={styles.row}>
            {(['low', 'medium', 'high'] as HumorLevel[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.pill, humorLevel === item && styles.pillActive]}
                onPress={() => onSelectHumor(item)}
              >
                <Text style={[styles.pillText, humorLevel === item && styles.pillTextActive]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Auto Callouts</Text>
              <Text style={styles.toggleSubtitle}>Announce places while driving</Text>
            </View>
            <Switch value={autoCallouts} onValueChange={onToggleAutoCallouts} />
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#111',
  },
  pillText: {
    color: '#111',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  toggleRow: {
    marginTop: 10,
    marginBottom: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 26,
    marginTop: 8,
  },
  doneButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});