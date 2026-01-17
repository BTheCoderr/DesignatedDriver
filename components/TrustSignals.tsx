import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';

export default function TrustSignals({ showModal = false }: { showModal?: boolean }) {
  const [modalVisible, setModalVisible] = useState(showModal);

  return (
    <>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.trustButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.trustButtonText}>Trust & Safety</Text>
        </TouchableOpacity>
        <View style={styles.trustItems}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Background-checked drivers</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🛡️</Text>
            <Text style={styles.trustText}>Fully insured rides</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>📞</Text>
            <Text style={styles.trustText}>24/7 Support</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🚗</Text>
            <Text style={styles.trustText}>Never leave your car overnight</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trust & Safety</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalItem}>
                <Text style={styles.modalIcon}>✓</Text>
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>Background-Checked Drivers</Text>
                  <Text style={styles.modalItemText}>
                    All drivers undergo comprehensive background checks including criminal history, driving record, and identity verification.
                  </Text>
                </View>
              </View>

              <View style={styles.modalItem}>
                <Text style={styles.modalIcon}>🛡️</Text>
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>Fully Insured Rides</Text>
                  <Text style={styles.modalItemText}>
                    Every trip is covered by comprehensive insurance. Your vehicle and our drivers are protected throughout the entire journey.
                  </Text>
                </View>
              </View>

              <View style={styles.modalItem}>
                <Text style={styles.modalIcon}>📞</Text>
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>24/7 Support</Text>
                  <Text style={styles.modalItemText}>
                    Need help? Contact us anytime at support@designateddriver.com or call (401) 555-DRIVE.
                  </Text>
                </View>
              </View>

              <View style={styles.modalItem}>
                <Text style={styles.modalIcon}>🚗</Text>
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>Never Leave Your Car Overnight</Text>
                  <Text style={styles.modalItemText}>
                    We guarantee your car arrives with you. No overnight parking, no delays, just safe transport home.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  trustButton: {
    marginBottom: 16,
    alignItems: 'center',
  },
  trustButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  trustItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  trustIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trustText: {
    color: '#888',
    fontSize: 11,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
    fontWeight: '300',
  },
  modalBody: {
    gap: 20,
  },
  modalItem: {
    flexDirection: 'row',
    gap: 16,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
