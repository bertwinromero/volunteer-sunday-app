import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton, Switch, Menu, FAB } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { databaseService } from '../../../services/database';
import { ProgramItemInsert, Program } from '../../../types';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface ProgramItemForm {
  id: string;
  time: string;
  title: string;
  description: string;
  duration_minutes: string;
  person_in_charge: string;
}

export default function CreateProgramScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | undefined>(undefined);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Template fields
  const [isTemplate, setIsTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Program[]>([]);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const [items, setItems] = useState<ProgramItemForm[]>([
    { id: '1', time: '', title: '', description: '', duration_minutes: '', person_in_charge: '' },
  ]);

  // Item time picker state
  const [showItemTimePicker, setShowItemTimePicker] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const allPrograms = await databaseService.getPrograms();
      const programTemplates = allPrograms.filter(p => p.is_template);
      setTemplates(programTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const loadTemplateItems = async (templateId: string) => {
    try {
      const template = await databaseService.getProgram(templateId);
      const templateItems: ProgramItemForm[] = template.program_items
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({
          id: `template-${index + 1}`,
          time: item.time,
          title: item.title,
          description: item.description || '',
          duration_minutes: item.duration_minutes.toString(),
          person_in_charge: item.person_in_charge || '',
        }));

      setItems(templateItems.length > 0 ? templateItems : [
        { id: '1', time: '', title: '', description: '', duration_minutes: '', person_in_charge: '' },
      ]);
      setTitle(template.title);
      if (template.start_time) {
        const [hours, minutes] = template.start_time.split(':').map(Number);
        setStartTime({ hours, minutes });
      }
      if (template.end_time) {
        const [hours, minutes] = template.end_time.split(':').map(Number);
        setEndTime({ hours, minutes });
      }
    } catch (err) {
      console.error('Error loading template items:', err);
      Alert.alert('Error', 'Failed to load template items');
    }
  };

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
      { id: newId, time: newItemTime, title: '', description: '', duration_minutes: '', person_in_charge: '' },
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

    // Date is only required if not a template
    if (!isTemplate && !date) {
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
      // Create program (share_code and share_token will be auto-generated by database trigger)
      const program = await databaseService.createProgram({
        title: title.trim(),
        date: date ? formatDate(date) : null,
        start_time: startTime ? formatTime(startTime) : null,
        end_time: endTime ? formatTime(endTime) : null,
        is_template: isTemplate,
        template_id: selectedTemplateId,
        status: isTemplate ? 'draft' : 'draft',
        created_by: user.id,
      });

      // Create program items - items are already in the correct order from drag-and-drop
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const programItem: ProgramItemInsert = {
          program_id: program.id,
          time: item.time,
          title: item.title.trim(),
          description: item.description.trim() || null,
          person_in_charge: item.person_in_charge.trim() || null,
          duration_minutes: parseInt(item.duration_minutes),
          order: i,
        };

        await databaseService.createProgramItem(programItem);
      }

      const successMessage = isTemplate
        ? 'Template created successfully!'
        : 'Program created successfully!';

      Alert.alert(
        'Success',
        successMessage,
        isTemplate ? [
          {
            text: 'OK',
            onPress: () => router.replace('/(admin)/dashboard'),
          },
        ] : [
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

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ProgramItemForm>) => {
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
                disabled={loading}
                style={styles.dragHandle}
              />
              <Text variant="labelLarge">Item {index + 1}</Text>
            </View>
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
            label="Person In Charge (Optional)"
            value={item.person_in_charge}
            onChangeText={(value) => updateItem(item.id, 'person_in_charge', value)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., John Doe"
            left={<TextInput.Icon icon="account-outline" />}
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
      </ScaleDecorator>
    );
  };

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

        {/* Template Section */}
        <View style={styles.templateContainer}>
          {/* Copy from Template */}
          {templates.length > 0 && !isTemplate && (
            <View style={styles.datePickerContainer}>
              <Text variant="labelLarge" style={styles.dateLabel}>
                Copy from Template (Optional)
              </Text>
              <Menu
                visible={showTemplateMenu}
                onDismiss={() => setShowTemplateMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setShowTemplateMenu(true)}
                    icon="content-copy"
                    style={styles.dateButton}
                    contentStyle={styles.dateButtonContent}
                    disabled={loading}
                  >
                    {selectedTemplateId
                      ? templates.find(t => t.id === selectedTemplateId)?.title || 'Select Template'
                      : 'Select Template'}
                  </Button>
                }
              >
                {templates.map((template) => (
                  <Menu.Item
                    key={template.id}
                    onPress={() => {
                      setSelectedTemplateId(template.id);
                      setShowTemplateMenu(false);
                      loadTemplateItems(template.id);
                    }}
                    title={template.title}
                  />
                ))}
              </Menu>
              <HelperText type="info">
                Copy program flow from an existing template
              </HelperText>
            </View>
          )}

          {/* Save as Template */}
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
            disabled={loading}
            style={styles.addButton}
            buttonColor="#6366F1"
            textColor="#FFFFFF"
          >
            Add Item
          </Button>
        </View>
      </View>
    </>
  ), [title, date, startTime, endTime, loading, templates, showTemplateMenu, selectedTemplateId, isTemplate]);

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
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
          contentStyle={styles.buttonContent}
          buttonColor="#6366F1"
        >
          Create Program
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          disabled={loading}
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
              Create Program
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Set up a new program flow
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
          data={items}
          onDragEnd={({ data }) => setItems(data)}
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
