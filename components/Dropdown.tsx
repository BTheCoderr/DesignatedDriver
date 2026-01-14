import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';

interface DropdownProps {
  label: string;
  value: string;
  options: readonly string[] | number[];
  onSelect: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Dropdown({ label, value, options, onSelect, placeholder = 'Select...', required = false, disabled = false }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string | number) => {
    onSelect(option);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!disabled && options.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.asterisk}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.dropdown,
          !value && styles.placeholder,
          disabled && styles.disabled,
        ]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownText,
          (!value || disabled) && styles.placeholderText,
        ]}>
          {value || placeholder}
        </Text>
        <Text style={[styles.arrow, disabled && styles.disabledArrow]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    value === String(option) && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === String(option) && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {value === String(option) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    paddingLeft: 4,
  },
  asterisk: {
    color: '#ff4444',
  },
  dropdown: {
    backgroundColor: '#0a0a0a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    borderColor: '#2a2a2a',
  },
  dropdownText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  placeholderText: {
    color: '#666',
  },
  arrow: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#888',
    fontWeight: '300',
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#0a0a0a',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 12,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#0a0a0a',
  },
  disabledArrow: {
    opacity: 0.3,
  },
});
