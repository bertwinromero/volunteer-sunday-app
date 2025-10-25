import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton, Switch, FAB } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';
import { databaseService } from '../../../../services/database';
import { ProgramItemInsert, ProgramItemUpdate, ProgramWithItems, ProgramItem } from '../../../../types';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface ProgramItemForm {
  id: string;
  time: string;
  title: string;
  description: string;
  duration_minutes: string;
  person_in_charge: string;
  isNew?: boolean; // Track if this is a newly added item
  isDeleted?: boolean; // Track if this item should be deleted
  originalId?: string; // Store original DB id for existing items
}

export default function EditProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Program details
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Template field
  const [isTemplate, setIsTemplate] = useState(false);

  const [items, setItems] = useState<ProgramItemForm[]>([]);

  // Item time picker state
  const [showItemTimePicker, setShowItemTimePicker] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const program: ProgramWithItems = await databaseService.getProgram(id);

      // Set program details
      setTitle(program.title);
      if (program.date) {
        setDate(new Date(program.date));
      }

      // Set times if they exist
      if (program.start_time) {
        const [hours, minutes] = program.start_time.split(':').map(Number);
        setStartTime({ hours, minutes });
      }
      if (program.end_time) {
        const [hours, minutes] = program.end_time.split(':').map(Number);
        setEndTime({ hours, minutes });
      }

      // Set template field
      setIsTemplate(program.is_template);

      // Set program items
      const sortedItems = program.program_items.sort((a, b) => a.order - b.order);
      const formItems: ProgramItemForm[] = sortedItems.map((item: ProgramItem) => ({
        id: item.id,
        time: item.time,
        title: item.title,
        description: item.description || '',
        duration_minutes: item.duration_minutes.toString(),
        person_in_charge: item.person_in_charge || '',
        isNew: false,
        isDeleted: false,
        originalId: item.id,
      }));

      setItems(formItems.length > 0 ? formItems : [
        { id: 'new-1', time: '', title: '', description: '', duration_minutes: '', person_in_charge: '', isNew: true },
      ]);
    } catch (err: any) {
      console.error('Error loading program:', err);
      setError(err.message || 'Failed to load program');
      Alert.alert('Error', 'Failed to load program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newId = `new-${Date.now()}`;

    // Calculate next item's start time based on last item's end time
    let newItemTime = '';
    const lastItem = items[items.length - 1];
    if (lastItem && lastItem.time && lastItem.duration_minutes && !lastItem.isDeleted) {
      const [hours, minutes] = lastItem.time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const durationMins = parseInt(lastItem.duration_minutes);
        if (!isNaN(durationMins) && durationMins > 0) {
          let totalMinutes = hours * 60 + minutes + durationMins;

          // Handle day overflow
          if (totalMinutes >= 24 * 60) {
            totalMinutes = totalMinutes % (24 * 60);
          }

          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          newItemTime = formatTime({ hours: newHours, minutes: newMinutes });
        }
      }
    }

    setItems([
      ...items,
      {
        id: newId,
        time: newItemTime,
        title: '',
        description: '',
        duration_minutes: '',
        person_in_charge: '',
        isNew: true,
      },
    ]);
  };

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // If it's a new item, just remove it from the list
    if (item.isNew) {
      setItems(items.filter(item => item.id !== id));
    } else {
      // Mark existing item as deleted
      setItems(items.map(item =>
        item.id === id ? { ...item, isDeleted: true } : item
      ));
    }
  };

  const updateItem = (id: string, field: keyof ProgramItemForm, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const openItemTimePicker = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowItemTimePicker(true);
  };

  const handleItemTimeConfirm = (params: { hours: number; minutes: number }) => {
    if (selectedItemId) {
      const timeString = formatTime(params);
      updateItem(selectedItemId, 'time', timeString);
    }
    setShowItemTimePicker(false);
    setSelectedItemId(null);
  };

  const getItemTime = (itemId: string): { hours: number; minutes: number } | undefined => {
    const item = items.find(i => i.id === itemId);
    if (!item?.time) return undefined;

    const [hours, minutes] = item.time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;

    return { hours, minutes };
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: { hours: number; minutes: number }): string => {
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeDisplay = (time: { hours: number; minutes: number }): string => {
    const hours = time.hours % 12 || 12;
    const minutes = String(time.minutes).padStart(2, '0');
    const period = time.hours >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${period}`;
  };

  const calculateDuration = (): string | null => {
    if (!startTime || !endTime) return null;

    const startMinutes = startTime.hours * 60 + startTime.minutes;
    let endMinutes = endTime.hours * 60 + endTime.minutes;

    // If end time is before start time, assume it's the next day
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Please enter a program title');
      return false;
    }

    // Date is only required if not a template
    if (!isTemplate && !date) {
      setError('Please select a program date');
      return false;
    }

    // Get only non-deleted items for validation
    const activeItems = items.filter(item => !item.isDeleted);

    if (activeItems.length === 0) {
      setError('Please add at least one program item');
      return false;
    }

    // Validate items
    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];

      if (!item.title.trim()) {
        setError(`Item ${i + 1}: Please enter a title`);
        return false;
      }

      if (!item.time) {
        setError(`Item ${i + 1}: Please select a time`);
        return false;
      }

      if (!item.duration_minutes || parseInt(item.duration_minutes) <= 0) {
        setError(`Item ${i + 1}: Please enter a valid duration in minutes`);
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    if (!user) {
      setError('You must be logged in to update a program');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Update program
      await databaseService.updateProgram(id, {
        title: title.trim(),
        date: date ? formatDate(date) : null,
        start_time: startTime ? formatTime(startTime) : null,
        end_time: endTime ? formatTime(endTime) : null,
        is_template: isTemplate,
      });

      // Handle program items changes
      const activeItems = items.filter(item => !item.isDeleted);
      const deletedItems = items.filter(item => item.isDeleted && !item.isNew);

      // Delete removed items
      for (const item of deletedItems) {
        if (item.originalId) {
          await databaseService.deleteProgramItem(item.originalId);
        }
      }

      // Update existing items and create new ones - items are in drag-and-drop order
      for (let i = 0; i < activeItems.length; i++) {
        const item = activeItems[i];

        if (item.isNew) {
          // Create new item
          const programItem: ProgramItemInsert = {
            program_id: id,
            time: item.time,
            title: item.title.trim(),
            description: item.description.trim() || null,
            person_in_charge: item.person_in_charge.trim() || null,
            duration_minutes: parseInt(item.duration_minutes),
            order: i,
          };
          await databaseService.createProgramItem(programItem);
        } else {
          // Update existing item
          const updates: ProgramItemUpdate = {
            time: item.time,
            title: item.title.trim(),
            description: item.description.trim() || null,
            person_in_charge: item.person_in_charge.trim() || null,
            duration_minutes: parseInt(item.duration_minutes),
            order: i,
          };
          await databaseService.updateProgramItem(item.originalId!, updates);
        }
      }

      const successMessage = isTemplate
        ? 'Template updated successfully!'
        : 'Program updated successfully!';

      Alert.alert(
        'Success',
        successMessage,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error updating program:', err);
      setError(err.message || 'Failed to update program');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ProgramItemForm>) => {
    if (item.isDeleted) return null;
    const index = getIndex();
    if (index === undefined) return null;

    return (
      <ScaleDecorator>
        <View style={[styles.itemCard, isActive && styles.itemCardDragging]}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <IconButton
                icon="drag"
                size={20}
                onPressIn={drag}
                disabled={saving}
                style={styles.dragHandle}
              />
              <Text variant="labelLarge">Item {index + 1}</Text>
            </View>
            {visibleItems.length > 1 && (
              <IconButton
                icon="close"
                size={20}
                onPress={() => removeItem(item.id)}
                disabled={saving}
              />
            )}
          </View>

          <View style={styles.datePickerContainer}>
            <Text variant="labelLarge" style={styles.dateLabel}>
              Time *
            </Text>
            <Button
              mode="outlined"
              onPress={() => openItemTimePicker(item.id)}
              icon="clock-outline"
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
              disabled={saving}
            >
              {item.time ? (
                (() => {
                  const timeObj = getItemTime(item.id);
                  return timeObj ? formatTimeDisplay(timeObj) : item.time;
                })()
              ) : 'Select Time'}
            </Button>
          </View>

          <TextInput
            label="Title *"
            value={item.title}
            onChangeText={(value) => updateItem(item.id, 'title', value)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Praise and Worship"
            disabled={saving}
          />

          <TextInput
            label="Description (Optional)"
            value={item.description}
            onChangeText={(value) => updateItem(item.id, 'description', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Additional details..."
            multiline
            numberOfLines={2}
            disabled={saving}
          />

          <TextInput
            label="Person In Charge (Optional)"
            value={item.person_in_charge}
            onChangeText={(value) => updateItem(item.id, 'person_in_charge', value)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., John Doe"
            left={<TextInput.Icon icon="account-outline" />}
            disabled={saving}
          />

          <TextInput
            label="Duration (minutes) *"
            value={item.duration_minutes}
            onChangeText={(value) => updateItem(item.id, 'duration_minutes', value)}
            mode="outlined"
            style={styles.input}
            placeholder="30"
            keyboardType="number-pad"
            disabled={saving}
          />
        </View>
      </ScaleDecorator>
    );
  };

  // Filter out deleted items for display
  const visibleItems = items.filter(item => !item.isDeleted);

  // Header Component for form fields - memoized to prevent keyboard dismiss
  const ListHeader = useCallback(() => (
    <>
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Program Details
        </Text>

        <TextInput
          label="Program Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Sunday Morning Service"
          disabled={saving}
        />

        <View style={styles.datePickerContainer}>
          <Text variant="labelLarge" style={styles.dateLabel}>
            Date *
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            icon="calendar"
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
            disabled={saving}
          >
            {date ? formatDate(date) : 'Select Date'}
          </Button>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeField}>
            <Text variant="labelLarge" style={styles.dateLabel}>
              Start Time (Optional)
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowStartTimePicker(true)}
              icon="clock-outline"
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
              disabled={saving}
            >
              {startTime ? formatTimeDisplay(startTime) : 'Select Start Time'}
            </Button>
          </View>

          <View style={styles.timeField}>
            <Text variant="labelLarge" style={styles.dateLabel}>
              End Time (Optional)
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowEndTimePicker(true)}
              icon="clock-outline"
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
              disabled={saving}
            >
              {endTime ? formatTimeDisplay(endTime) : 'Select End Time'}
            </Button>
          </View>
        </View>

        {/* Duration Display */}
        {calculateDuration() && (
          <View style={styles.durationContainer}>
            <IconButton icon="timelapse" size={20} style={styles.durationIcon} />
            <View style={styles.durationContent}>
              <Text variant="labelSmall" style={styles.durationLabel}>
                Program Duration
              </Text>
              <Text variant="titleMedium" style={styles.durationValue}>
                {calculateDuration()}
              </Text>
            </View>
          </View>
        )}

        {/* Template Section */}
        <View style={styles.templateContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="labelLarge">Save as Template</Text>
              <Text variant="bodySmall" style={styles.switchHint}>
                Create a reusable template for future programs
              </Text>
            </View>
            <Switch value={isTemplate} onValueChange={setIsTemplate} />
          </View>

          {isTemplate && (
            <HelperText type="info">
              Templates can be reused when creating new programs. Date is optional for templates.
            </HelperText>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Program Items
          </Text>
          <Button
            mode="contained"
            onPress={addItem}
            icon="plus"
            compact
            disabled={saving}
            style={styles.addButton}
            buttonColor="#6366F1"
            textColor="#FFFFFF"
          >
            Add Item
          </Button>
        </View>
      </View>
    </>
  ), [title, date, startTime, endTime, saving, isTemplate]);

  // Footer Component for actions
  const ListFooter = () => (
    <View style={styles.content}>
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={saving}
          disabled={saving}
          style={styles.createButton}
          contentStyle={styles.buttonContent}
          buttonColor="#6366F1"
        >
          Update Program
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          disabled={saving}
          style={styles.cancelButton}
          textColor="#6B7280"
        >
          Cancel
        </Button>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#FFFFFF"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View>
            <Text variant="headlineMedium" style={styles.title}>
              Edit Program
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Update program details
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <DraggableFlatList
          data={visibleItems}
          onDragEnd={({ data }) => {
            // Merge with deleted items
            const deletedItems = items.filter(item => item.isDeleted);
            setItems([...data, ...deletedItems]);
          }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={date}
        onConfirm={(params) => {
          setShowDatePicker(false);
          setDate(params.date);
        }}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        onDismiss={() => setShowStartTimePicker(false)}
        onConfirm={(params) => {
          setShowStartTimePicker(false);
          setStartTime(params);
        }}
        hours={startTime?.hours}
        minutes={startTime?.minutes}
        label="Select Start Time"
      />

      <TimePickerModal
        visible={showEndTimePicker}
        onDismiss={() => setShowEndTimePicker(false)}
        onConfirm={(params) => {
          setShowEndTimePicker(false);
          setEndTime(params);
        }}
        hours={endTime?.hours}
        minutes={endTime?.minutes}
        label="Select End Time"
      />

      <TimePickerModal
        visible={showItemTimePicker}
        onDismiss={() => {
          setShowItemTimePicker(false);
          setSelectedItemId(null);
        }}
        onConfirm={handleItemTimeConfirm}
        hours={selectedItemId ? getItemTime(selectedItemId)?.hours : undefined}
        minutes={selectedItemId ? getItemTime(selectedItemId)?.minutes : undefined}
        label="Select Item Time"
      />

      {/* Floating Action Button for Adding Items */}
      <FAB
        icon="plus"
        label="Add Item"
        onPress={addItem}
        disabled={loading}
        style={styles.fab}
        color="#FFFFFF"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex1: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    backgroundColor: '#6366F1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    margin: 0,
  },
  title: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    color: '#E0E7FF',
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
    color: '#374151',
    fontWeight: '500',
  },
  dateButton: {
    justifyContent: 'flex-start',
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeField: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemCardDragging: {
    opacity: 0.9,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    margin: 0,
    marginRight: 4,
  },
  error: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  createButton: {
    borderRadius: 12,
  },
  cancelButton: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  durationIcon: {
    margin: 0,
    marginRight: 8,
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  durationValue: {
    fontWeight: '700',
    color: '#6366F1',
    fontSize: 18,
  },
  templateContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchHint: {
    marginTop: 4,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
