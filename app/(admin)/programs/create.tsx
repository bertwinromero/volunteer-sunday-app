import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton, Divider, Switch, Chip } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { databaseService } from '../../../services/database';
import { ProgramItemInsert, RecurrencePattern } from '../../../types';

interface ProgramItemForm {
  id: string;
  time: string;
  title: string;
  description: string;
  duration_minutes: string;
}

export default function CreateProgramScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Recurring program fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);

  const [items, setItems] = useState<ProgramItemForm[]>([
    { id: '1', time: '', title: '', description: '', duration_minutes: '' },
  ]);

  // Item time picker state
  const [showItemTimePicker, setShowItemTimePicker] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const addItem = () => {
    const newId = (Math.max(...items.map(i => parseInt(i.id))) + 1).toString();

    // Calculate next item's start time based on last item's end time
    let newItemTime = '';
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.time && lastItem.duration_minutes) {
        const [hours, minutes] = lastItem.time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const durationMins = parseInt(lastItem.duration_minutes);
          if (!isNaN(durationMins) && durationMins > 0) {
            // Calculate end time of last item
            let totalMinutes = hours * 60 + minutes + durationMins;

            // Handle day overflow (keep within 24 hours)
            if (totalMinutes >= 24 * 60) {
              totalMinutes = totalMinutes % (24 * 60);
            }

            const newHours = Math.floor(totalMinutes / 60);
            const newMinutes = totalMinutes % 60;
            newItemTime = formatTime({ hours: newHours, minutes: newMinutes });
          }
        }
      }
    }

    setItems([
      ...items,
      { id: newId, time: newItemTime, title: '', description: '', duration_minutes: '' },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
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

    if (!date) {
      setError('Please select a program date');
      return false;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

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

  const handleCreate = async () => {
    if (!validateForm()) return;

    if (!user) {
      setError('You must be logged in to create a program');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get day of week from date (0 = Sunday, 6 = Saturday)
      const dayOfWeek = date!.getDay();

      // Create program (share_code and share_token will be auto-generated by database trigger)
      const program = await databaseService.createProgram({
        title: title.trim(),
        date: formatDate(date!),
        start_time: startTime ? formatTime(startTime) : null,
        end_time: endTime ? formatTime(endTime) : null,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? formatDate(recurrenceEndDate) : null,
        recurrence_day_of_week: isRecurring ? dayOfWeek : null,
        status: 'draft',
        created_by: user.id,
      });

      // Create program items
      const sortedItems = items.sort((a, b) => a.time.localeCompare(b.time));

      for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        const programItem: ProgramItemInsert = {
          program_id: program.id,
          time: item.time,
          title: item.title.trim(),
          description: item.description.trim() || null,
          duration_minutes: parseInt(item.duration_minutes),
          order: i,
        };

        await databaseService.createProgramItem(programItem);
      }

      Alert.alert(
        'Success',
        'Program created successfully!',
        [
          {
            text: 'View Share Link',
            onPress: () => router.replace(`/(admin)/programs/${program.id}/share`),
          },
          {
            text: 'View Program',
            onPress: () => router.replace(`/(admin)/dashboard`),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Program
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Set up a new program flow for volunteers
        </Text>
      </View>

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
          disabled={loading}
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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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

        {/* Recurring Program Section */}
        <View style={styles.recurringContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="labelLarge">Make this recurring</Text>
              <Text variant="bodySmall" style={styles.switchHint}>
                Automatically create this program on a schedule
              </Text>
            </View>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </View>

          {isRecurring && (
            <View style={styles.recurringOptions}>
              <Text variant="labelLarge" style={styles.dateLabel}>
                Repeat Pattern
              </Text>
              <View style={styles.patternChips}>
                <Chip
                  mode={recurrencePattern === 'weekly' ? 'flat' : 'outlined'}
                  selected={recurrencePattern === 'weekly'}
                  onPress={() => setRecurrencePattern('weekly')}
                  style={styles.chip}
                >
                  Weekly
                </Chip>
                <Chip
                  mode={recurrencePattern === 'biweekly' ? 'flat' : 'outlined'}
                  selected={recurrencePattern === 'biweekly'}
                  onPress={() => setRecurrencePattern('biweekly')}
                  style={styles.chip}
                >
                  Every 2 Weeks
                </Chip>
                <Chip
                  mode={recurrencePattern === 'monthly' ? 'flat' : 'outlined'}
                  selected={recurrencePattern === 'monthly'}
                  onPress={() => setRecurrencePattern('monthly')}
                  style={styles.chip}
                >
                  Monthly
                </Chip>
              </View>

              <View style={styles.datePickerContainer}>
                <Text variant="labelLarge" style={styles.dateLabel}>
                  End Date (Optional)
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowRecurrenceEndDatePicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                  contentStyle={styles.dateButtonContent}
                  disabled={loading}
                >
                  {recurrenceEndDate ? formatDate(recurrenceEndDate) : 'No End Date'}
                </Button>
              </View>

              <HelperText type="info">
                {recurrencePattern === 'weekly' && 'Program will repeat every week on the same day'}
                {recurrencePattern === 'biweekly' && 'Program will repeat every 2 weeks on the same day'}
                {recurrencePattern === 'monthly' && 'Program will repeat monthly on the same day'}
              </HelperText>
            </View>
          )}
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Program Items
          </Text>
          <Button
            mode="outlined"
            onPress={addItem}
            icon="plus"
            compact
            disabled={loading}
          >
            Add Item
          </Button>
        </View>

        {items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text variant="labelLarge">Item {index + 1}</Text>
              {items.length > 1 && (
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => removeItem(item.id)}
                  disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />

            <TextInput
              label="Duration (minutes) *"
              value={item.duration_minutes}
              onChangeText={(value) => updateItem(item.id, 'duration_minutes', value)}
              mode="outlined"
              style={styles.input}
              placeholder="30"
              keyboardType="number-pad"
              disabled={loading}
            />
          </View>
        ))}
      </View>

      {error ? (
        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
          contentStyle={styles.buttonContent}
        >
          Create Program
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </View>

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

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showRecurrenceEndDatePicker}
        onDismiss={() => setShowRecurrenceEndDatePicker(false)}
        date={recurrenceEndDate}
        onConfirm={(params) => {
          setShowRecurrenceEndDatePicker(false);
          setRecurrenceEndDate(params.date);
        }}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  dateLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeField: {
    flex: 1,
  },
  divider: {
    marginVertical: 24,
  },
  itemCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  error: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 24,
  },
  createButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  durationIcon: {
    margin: 0,
    marginRight: 8,
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  durationValue: {
    fontWeight: '600',
    color: '#1976d2',
  },
  recurringContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    opacity: 0.6,
  },
  recurringOptions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  patternChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});
