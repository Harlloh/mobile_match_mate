import TeamCard from "@/components/teamCard";
import { useAppStore } from "@/context/useAppStore";
// import { teams } from "@/lib/utils";
import { TeamType } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import teams from '../../data/teams.json';

function FavouritesScreen() {
    const { setFavList, setHateTeamList, favList, hateTeamList, subscribedLeagues } = useAppStore()
    // const {setFavList, setHateList,favList, hateList} = useAppStore()
    const tabs = ["Favourites", "Hate Watch"];
    const [list, setList] = useState<(TeamType)[]>([]);
    const [activeList, setActiveList] = useState<"Favourites" | "Hate Watch">("Favourites");
    const [type, setType] = useState<"favourite" | "hate">("favourite");
    const [searchText, setSearchText] = useState<string>('')


    // const sourceList = useMemo(() => {
    //     // const sortedTeams = subscribedLeagues.flatMap((leagueItem) =>
    //     //     teams.filter((team) => team.leagueCode == leagueItem.id)
    //     // );
    //     if (activeList === "Favourites") return teams;
    //     return teams;
    // }, [activeList]);
    const sourceList = useMemo(() => {
        if (!subscribedLeagues?.length) return [];

        return teams.filter(team =>
            subscribedLeagues.some(league =>
                league.id === team.leagueCode || league.id === team.leagueCode
            )
        );
    }, [subscribedLeagues]);


    const searchTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);


    useEffect(() => {
        setSearchText('')
        if (activeList === "Favourites") {
            setList(teams);
            setType("favourite");
        } else if (activeList === "Hate Watch") {
            setList(teams);
            setType("hate");
        }
    }, [activeList]);


    const handleToggle = (item: TeamType, toggleType: "favourite" | "hate") => {
        if (toggleType === "favourite") {
            setFavList(item)
            console.log("Favourites:", favList);
        } else {
            setHateTeamList(item)
            console.log("Hate List:", hateTeamList);
        }

    };

    const isItemInList = (list: (TeamType)[], id: string | number) =>
        list.some((item) => item.id === id);




    //DEBOUNCE THE FILTER LOGIC
    useEffect(() => {
        // First, tear up the old receipt if one exists
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Set a new timeout
        searchTimeoutRef.current = setTimeout(() => {
            if (searchText.trim() === '') {
                setList(sourceList)
            } else {
                const filtered = sourceList.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
                setList(filtered)
            }
        }, 250);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [sourceList, searchText])





    // useEffect(() => {
    //     const slimTeams = masterTeams.flatMap((comp: any) =>
    //         comp.teams.map((team: any) => ({
    //             id: team.id,
    //             name: team.name,
    //             shortName: team.shortName,
    //             leagueName: comp.competition.name,
    //             leagueId: comp.competition.id,
    //             leagueCode: comp.competition.code,
    //             icon: team.crest,
    //         }))
    //     );

    //     console.log(slimTeams, '*##**');
    // }, [masterTeams]);


    return (
        <View style={[styles.container]}>
            <TextInput
                value={searchText}
                mode='outlined'
                placeholder="Search teams..."
                left={<TextInput.Icon icon='magnify' />}
                onChangeText={setSearchText}
                outlineColor="#e5e7eb"
                activeOutlineColor="#10b981"
                theme={{ colors: { background: '#ffffff' } }}
                style={styles.searcHField}
                autoCorrect={false}
                autoComplete="off" autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
            />


            {/* Tabs */}
            <View style={styles.buttonWrapper}>
                {tabs.map((tab, index) => (
                    <Pressable
                        key={index}
                        onPress={() => setActiveList(tab as any)}
                        style={[styles.tabBtn, activeList === tab && styles.activeTabBtn]}
                    >
                        <Text style={{ color: activeList === tab ? "#10b981" : "#64748b" }}>
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* List */}
            {list.length > 0 ? (<FlatList
                data={list}
                keyExtractor={(item) => `${item.leagueCode}-${item.id})`}
                renderItem={({ item }) => (
                    <TeamCard
                        type={type}
                        team={item}
                        isSelected={
                            type === "favourite"
                                ? isItemInList(favList, item.id)
                                : isItemInList(hateTeamList, item.id)
                        }
                        isBlurred={
                            (type === "hate" && isItemInList(favList, item.id)) ||
                            (type === "favourite" && isItemInList(hateTeamList, item.id))
                        }
                        onToggle={() => handleToggle(item, type)}
                        onHateList={type === "hate" && isItemInList(favList, item.id)}
                        onFavList={type === "favourite" && isItemInList(hateTeamList, item.id)}
                    />
                )}
                contentContainerStyle={{
                    paddingVertical: 20,
                    paddingHorizontal: 7,
                    paddingBottom: Platform.OS === 'ios' ? 100 : 0,
                }}
            />
            ) : (
                <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>
                    {subscribedLeagues.length < 1 ? 'Please subscribe to leagues to see teams list' : 'No results found.'}
                </Text>
            )}
        </View>
    );
}

export default FavouritesScreen;

const styles = StyleSheet.create({
    searcHField: {
        marginHorizontal: 10,
        marginVertical: 10
    },
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    buttonWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        paddingVertical: 20,
        backgroundColor: "white",
        marginHorizontal: 10,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 5,
    },
    tabBtn: {
        backgroundColor: "#f1f5f9",
        textAlign: "center",
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    activeTabBtn: {
        borderBottomColor: "#10b981",
        borderBottomWidth: 1.5,
    },
});
