import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  FlatList,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import * as Calendar from "expo-calendar";

type CalendarEvent = {
  id: string;
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: string;
  notes?: string;
};

export default function App() {
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const id = await createOrGetCalendar();
        setCalendarId(id);
        loadEvents(id);
      } else {
        Alert.alert("Permissão negada para acessar o calendário.");
      }
    })();
  }, []);

  const createOrGetCalendar = async (): Promise<string> => {
    const calendars = await Calendar.getCalendarsAsync();

    const existing = calendars.find((cal) => cal.title === "Agenda App");
    if (existing) return existing.id;

    if (Platform.OS === "ios") {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();

      const source = {
        id: defaultCalendar.id,
        name: defaultCalendar.title,
        type: defaultCalendar.source
          ? String(defaultCalendar.source.type)
          : "default",
      };

      const newCalendarId = await Calendar.createCalendarAsync({
        title: "Agenda App",
        color: "#2196F3",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: source.id,
        source: source,
        name: "Agenda App",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    } else {
      // Android e outros
      const source = {
        isLocalAccount: true,
        name: "Agenda App",
        type: "local",
      };

      const newCalendarId = await Calendar.createCalendarAsync({
        title: "Agenda App",
        color: "#2196F3",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: undefined,
        source: source,
        name: "Agenda App",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    }
  };

  const addEvent = async () => {
    if (!calendarId) return;

    const now = new Date();
    const startDate = new Date(now.getTime() + 5 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    await Calendar.createEventAsync(calendarId, {
      title: "Compromisso Teste",
      startDate,
      endDate,
      location: "Online",
      notes: "Criado via app React Native",
      timeZone: "America/Sao_Paulo",
    });

    loadEvents(calendarId);
  };

  const loadEvents = async (calendarId: string) => {
    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);

    const futureEvents = await Calendar.getEventsAsync(
      [calendarId],
      now,
      oneWeekLater
    );

    setEvents(futureEvents);
  };

  const renderEvent = ({ item }: { item: CalendarEvent }) => (
    <View style={styles.event}>
      <Text style={styles.eventTitle}>📝 {item.title}</Text>
      <Text>
        ⏰ {new Date(item.startDate).toLocaleString()} até{" "}
        {new Date(item.endDate).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Minha Agenda</Text>
      <Button title="Adicionar Compromisso" onPress={addEvent} />

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum evento nos próximos dias.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  event: {
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 6,
  },
  eventTitle: {
    fontWeight: "bold",
  },
  empty: {
    marginTop: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
});
