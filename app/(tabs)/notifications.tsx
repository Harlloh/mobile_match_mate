// import NotificationCard from "@/components/notificationCard";
// import { useCallback, useMemo, useState } from "react";
// import { FlatList, Pressable, StyleSheet, View } from "react-native";
// import { Text } from "react-native-paper";

// function NotificationsScreen() {
//     const [activeTabs, setActiveTabs] = useState<'all' | 'unRead' | 'read'>('all')
//     const [notifications, setNotifications] = useState([
//         {
//             isRead: false,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '1'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '2'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '3'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '4'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '5'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '6'
//         },
//         {
//             isRead: true,
//             home: 'Manchester United',
//             away: 'Liverpool',
//             startIn: '300',
//             title: 'New Match Alert',
//             receivedAt: '17/10/2025',
//             startTime: '9:00pm',
//             id: '7'
//         },
//     ])

//     const sourceList = useMemo(() => {
//         if (activeTabs == 'unRead') {
//             return notifications.filter((item) => !item.isRead)
//         } else if (activeTabs == 'read') {
//             return notifications.filter((item) => item.isRead)
//         } else {
//             return notifications
//         }
//     }, [activeTabs, notifications])



//     const tabs = [
//         {
//             label: 'All',
//             key: 'all',
//         },
//         {
//             label: 'Unread',
//             key: 'unRead',
//         },
//         {
//             label: 'Read',
//             key: 'read',
//         },
//     ]

//     const handleRead = useCallback((item: any, type: string) => {
//         if (type === "read") {
//             setNotifications((prev) =>
//                 prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
//             );
//         } else if (type === "delete") {
//             setNotifications((prev) => prev.filter((n) => n.id !== item.id));
//         }
//     }, []);



//     const handleReadAll = useCallback(() => {
//         setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//     }, []);

//     const handleClearAll = useCallback(() => {
//         setNotifications([]);
//     }, []);

//     return (
//         <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
//             <View style={styles.header}>
//                 <View style={styles.headerActions}>
//                     <Pressable style={styles.headerButton} onPress={handleReadAll}>
//                         <Text style={styles.headerButtonText}>Read all</Text>
//                     </Pressable>
//                     <Pressable style={styles.headerButton} onPress={handleClearAll}>
//                         <Text style={styles.headerButtonText}>Clear all</Text>
//                     </Pressable>
//                 </View>
//             </View>
//             <View style={styles.tabContainer}>
//                 {
//                     tabs?.map((tab, index) => (
//                         <Pressable key={index} style={[styles.tab, tab.key === activeTabs && styles.activeTab]} onPress={() => {
//                             setActiveTabs(tab.key as any)
//                         }}>
//                             <Text style={[styles.tabLabel, tab.key === activeTabs && styles.activeTabLabel]}>
//                                 {tab.label}
//                             </Text>
//                         </Pressable>
//                     ))
//                 }
//             </View>
//             {sourceList.length > 0 ?
//                 <FlatList
//                     data={sourceList}
//                     // data={notifications}
//                     keyExtractor={(item) => String(item.id)}
//                     renderItem={({ item }) => <NotificationCard item={item} onRead={handleRead} />}
//                     scrollEnabled
//                     showsVerticalScrollIndicator
//                 />
//                 :
//                 <View style={styles.allRead}>
//                     <Text style={styles.readText}>You are all caught up 🎉</Text>
//                 </View>
//             }
//         </View>
//     );
// }

// export default NotificationsScreen;

// const styles = StyleSheet.create({
//     header: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginHorizontal: 15,
//         marginTop: 20,
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: "700",
//         color: "#111827", // dark slate
//     },
//     headerActions: {
//         flexDirection: "row",
//         gap: 10,
//         flex: 1,
//         display: 'flex',
//         justifyContent: 'flex-end'
//     },
//     headerButton: {
//         paddingVertical: 6,
//         paddingHorizontal: 14,
//         backgroundColor: "white",
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: "#e5e7eb",
//     },
//     headerButtonText: {
//         color: "#111827",
//         fontWeight: "500",
//     },
//     tabContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-around", // evenly distribute
//         backgroundColor: "#f1f5f9", // light gray background
//         borderRadius: 12,
//         paddingVertical: 6,
//         marginHorizontal: 10,
//         marginVertical: 15,
//     },
//     tab: {
//         // backgroundColor: "transparent", // default gray background shows
//         paddingVertical: 10,
//         paddingHorizontal: 25,
//         borderRadius: 10,
//     },
//     activeTab: {
//         backgroundColor: "white", // highlight active tab
//         shadowColor: "#000",
//         shadowOpacity: 0.08,
//         shadowRadius: 2,
//         shadowOffset: { width: 0, height: 2 },
//         elevation: 2,
//     },
//     tabLabel: {
//         color: "#64748b", // slate gray
//         fontWeight: "500",
//     },
//     activeTabLabel: {
//         color: "#10b981", // green accent
//         fontWeight: "600",
//     },
//     allRead: {
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     readText: { textAlign: 'center', marginTop: 40, color: '#64748b' }
// });
