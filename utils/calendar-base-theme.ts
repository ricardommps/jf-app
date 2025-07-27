export const calendarBaseTheme = {
  backgroundColor: "#334155",
  calendarBackground: "#334155",
  textSectionTitleColor: "#CBD5E1",
  selectedDayBackgroundColor: "#0EA5E9",
  selectedDayTextColor: "#ffffff",
  todayTextColor: "#1E40AF",
  dayTextColor: "#CBD5E1",
  textDisabledColor: "#64748B",
  dotColor: "#4ADE80",
  selectedDotColor: "#ffffff",
  arrowColor: "#CBD5E1",
  monthTextColor: "#F8FAFC",
  indicatorColor: "#0EA5E9",
  textDayFontFamily: "System",
  textMonthFontFamily: "System",
  textDayHeaderFontFamily: "System",
  textDayFontWeight: "400",
  textMonthFontWeight: "600",
  textDayHeaderFontWeight: "500",
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
  "stylesheet.calendar.header": {
    monthText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#F8FAFC",
      marginBottom: 10,
    },
    arrow: {
      padding: 10,
      color: "#CBD5E1",
    },
    arrowImage: {
      tintColor: "#CBD5E1",
    },
  },
  "stylesheet.calendar.main": {
    container: {
      backgroundColor: "#334155",
      borderRadius: 16,
    },
    monthView: {
      backgroundColor: "#334155",
    },
  },
  "stylesheet.day.basic": {
    base: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      margin: 2,
    },
    selected: {
      backgroundColor: "#0EA5E9",
      borderRadius: 16,
    },
    today: {
      backgroundColor: "#1E40AF",
      borderRadius: 16,
    },
    text: {
      fontSize: 16,
      color: "#CBD5E1",
      fontWeight: "400",
    },
    selectedText: {
      color: "#ffffff",
      fontWeight: "500",
    },
    todayText: {
      color: "#ffffff",
      fontWeight: "600",
    },
  },
};
