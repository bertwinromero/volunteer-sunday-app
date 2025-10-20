import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Admin Dashboard</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Welcome, {user?.display_name}!
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Today's Program" subtitle="No active program" />
          <Card.Content>
            <Text variant="bodyMedium">
              Create a new program for Sunday service
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => {}}>
              Create Program
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Volunteers" subtitle="Manage volunteer team" />
          <Card.Content>
            <Text variant="bodyMedium">View and manage volunteers</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={() => {}}>
              View Volunteers
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Past Programs" subtitle="Program history" />
          <Card.Content>
            <Text variant="bodyMedium">View previous Sunday programs</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={() => {}}>
              View History
            </Button>
          </Card.Actions>
        </Card>

        <Button mode="text" onPress={handleLogout} style={styles.logoutButton}>
          Sign Out
        </Button>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Program"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    color: '#fff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
