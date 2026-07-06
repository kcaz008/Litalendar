export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  calendarId: string;
  location?: string;
  notes?: string;
}

export interface DisplayEvent extends FamilyEvent {
  calendarName: string;
  calendarColor: string;
}

export type ConnectionStatus = "connected" | "cached" | "offline" | "auth_error";

export interface DisplayState {
  title: string;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date;
  editingEnabled: boolean;
}
