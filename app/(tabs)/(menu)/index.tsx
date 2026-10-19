import Loading from "@/components/shared/loading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useSession } from "@/contexts/Authentication";
import { useMyLessonPackages } from "@/hooks/useMyLessonPackages";
import { getMyProfile } from "@/services/customer.service";
import { runnerProgram } from "@/services/program.services";
import { UserType } from "@/types/ProfileType";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  HeartPulse,
  Lock,
  LogOut,
  Pencil,
  Ticket,
  WalletCards,
} from "lucide-react-native";
import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AvatarImage, { AvatarImageHandle } from "./avatar-image";

interface ProgramItem {
  id: number;
}

interface MenuItem {
  key: string;
  title: string;
  description: string;
  iconBackgroundColor: string;
  icon: ReactNode;
  onPress: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

const formatMemberSince = (createdAt?: string | null) => {
  if (!createdAt) return null;

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return `Entrou em ${new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(parsedDate)}`;
};

const MenuRow = ({ item, isLast }: { item: MenuItem; isLast: boolean }) => {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={item.onPress}
        style={styles.rowButton}
      >
        <View style={styles.rowLeftContent}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: item.iconBackgroundColor },
            ]}
          >
            {item.icon}
          </View>

          <View style={styles.rowTextContent}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowDescription}>{item.description}</Text>
          </View>
        </View>

        <ChevronRight color="#9CA3AF" size={24} />
      </TouchableOpacity>

      {!isLast ? <View style={styles.sectionDivider} /> : null}
    </>
  );
};

const MenuSection = ({ title, items }: MenuSectionProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <MenuRow
            key={item.key}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

export default function Menu() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const avatarRef = useRef<AvatarImageHandle>(null);

  const { getProfile, signOut, updateProfile } = useSession();
  const sessionProfile = getProfile();
  const { data: lessonPackages = [] } = useMyLessonPackages();
  const hasLessonPackages = lessonPackages.length > 0;

  const { data: runnerProgramData, isLoading: isRunnerProgramLoading } =
    useQuery<ProgramItem[]>({
      staleTime: 0,
      gcTime: 0,
      queryKey: ["runnerProgram", "menu-screen"],
      queryFn: runnerProgram,
      retry: false,
    });

  const { data: profileData } = useQuery<UserType>({
    queryKey: ["customer-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  const shouldSyncProfile = useMemo(() => {
    if (!profileData) {
      return false;
    }

    return (
      profileData.id !== sessionProfile?.id ||
      profileData.name !== sessionProfile?.name ||
      profileData.email !== sessionProfile?.email ||
      profileData.avatar !== sessionProfile?.avatar ||
      profileData.phone !== sessionProfile?.phone ||
      profileData.createdAt !== sessionProfile?.createdAt ||
      profileData.temporaryPassword !== sessionProfile?.temporaryPassword ||
      profileData.isYoungLife !== sessionProfile?.isYoungLife
    );
  }, [profileData, sessionProfile]);

  useEffect(() => {
    if (!profileData || !shouldSyncProfile) {
      return;
    }

    void updateProfile(profileData);
  }, [profileData, shouldSyncProfile]);

  const displayProfile = profileData ?? sessionProfile;
  const runnerProgramId = runnerProgramData?.[0]?.id;
  const memberSinceLabel = formatMemberSince(displayProfile?.createdAt);

  const appendFromMenuParam = (path: string) =>
    path + (path.includes("?") ? "&" : "?") + "fromMenu=1";

  const buildProgramRoute = (path: string) =>
    appendFromMenuParam(
      runnerProgramId ? path + "?programId=" + runnerProgramId : path,
    );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/(home)" as any);
  };

  const accountItems = useMemo<MenuItem[]>(
    () => [
      {
        key: "password",
        title: "Senha",
        description: "Altere sua senha de acesso",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <Lock color="#9CA3AF" size={22} />,
        onPress: () => router.push(appendFromMenuParam("/password") as any),
      },
      {
        key: "invoice",
        title: "Financeiro",
        description: "Gerencie pagamentos e faturas",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <WalletCards color="#9CA3AF" size={22} />,
        onPress: () => router.push(appendFromMenuParam("/invoice") as any),
      },
      ...(hasLessonPackages
        ? [
            {
              key: "lesson-packages",
              title: "Pacotes de aula",
              description: "Confira suas aulas e pacotes anteriores",
              iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
              icon: <CalendarDays color="#9CA3AF" size={22} />,
              onPress: () =>
                router.push(appendFromMenuParam("/lesson-packages") as any),
            },
          ]
        : []),
      {
        key: "push",
        title: "Push",
        description: "Gerencie suas notificações",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <Bell color="#9CA3AF" size={22} />,
        onPress: () => router.push(appendFromMenuParam("/settings") as any),
      },
    ],
    [router, hasLessonPackages],
  );

  const runningItems = useMemo<MenuItem[]>(
    () => [
      {
        key: "strava",
        title: "Strava",
        description: "Conecte e sincronize seus dados",
        iconBackgroundColor: "rgba(252, 76, 2, 0.14)",
        icon: <FontAwesome5 name="strava" size={20} color="#9CA3AF" />,
        onPress: () =>
          router.push(appendFromMenuParam("/stravaConnect") as any),
      },
      {
        key: "running-races",
        title: "Inscrições",
        description: "Gerencie suas inscrições em provas",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <Ticket color="#9CA3AF" size={22} />,
        onPress: () => router.push(buildProgramRoute("/runningRaces") as any),
      },
      {
        key: "table-pace",
        title: "Tabela - Pace X Km/h",
        description: "Veja a conversão de pace para km/h",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <Gauge color="#9CA3AF" size={22} />,
        onPress: () => router.push(appendFromMenuParam("/tablePace") as any),
      },
      {
        key: "extrapolative-validity",
        title: "Validade Extrapolativa",
        description: "Consulte o tempo estimado para diferentes distâncias",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <ClipboardList color="#9CA3AF" size={22} />,
        onPress: () =>
          router.push(buildProgramRoute("/extrapolativeValidity") as any),
      },
      {
        key: "exertion-zone",
        title: "Zonas de esforço",
        description: "Conheça suas zonas de intensidade",
        iconBackgroundColor: "rgba(55, 222, 188, 0.12)",
        icon: <HeartPulse color="#9CA3AF" size={22} />,
        onPress: () => router.push(buildProgramRoute("/exertionZone") as any),
      },
    ],
    [router, runnerProgramId],
  );

  if (isRunnerProgramLoading && !displayProfile) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#07111C" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.85}
            style={styles.backButton}
          >
            <ArrowLeft color="#F5F7FA" size={30} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <AvatarImage
            ref={avatarRef}
            profile={displayProfile}
            updateProfile={updateProfile}
            size={120}
            showTrigger={false}
          />

          <Text style={styles.profileName}>
            {displayProfile?.name || "Aluno"}
          </Text>

          {memberSinceLabel ? (
            <Text style={styles.memberSince}>{memberSinceLabel}</Text>
          ) : null}

          <Button
            action="primary"
            size="lg"
            onPress={() => avatarRef.current?.openPicker()}
            className="mt-7 rounded-full px-8"
          >
            <ButtonIcon as={Pencil} />
            <ButtonText>Editar foto</ButtonText>
          </Button>
        </View>

        <MenuSection title="CONFIGURAÇÕES DA CONTA" items={accountItems} />
        <MenuSection title="CORRIDA" items={runningItems} />

        <View style={styles.logoutContainer}>
          <View style={styles.logoutDivider} />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.logoutButton}
            onPress={() => void signOut()}
          >
            <View style={styles.logoutIconWrapper}>
              <LogOut color="#9CA3AF" size={22} />
            </View>

            <View style={styles.rowTextContent}>
              <Text style={styles.logoutTitle}>Logout</Text>
              <Text style={styles.logoutDescription}>Sair da sua conta</Text>
            </View>

            <ChevronRight color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07111C",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  profileContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  profileName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F7F8FA",
    textAlign: "center",
  },
  memberSince: {
    marginTop: 4,
    fontSize: 17,
    color: "#92A0B7",
    textAlign: "center",
  },
  sectionContainer: {
    paddingHorizontal: 18,
    marginTop: 34,
  },
  sectionTitle: {
    color: "#C5CEDB",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(216, 223, 233, 0.12)",
    backgroundColor: "rgba(13, 29, 46, 0.88)",
    overflow: "hidden",
  },
  rowButton: {
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
    paddingRight: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextContent: {
    flex: 1,
  },
  rowTitle: {
    color: "#F7F8FA",
    fontSize: 16,
    fontWeight: "600",
  },
  rowDescription: {
    color: "#9AA8BD",
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(216, 223, 233, 0.12)",
    marginLeft: 74,
    marginRight: 16,
  },
  logoutContainer: {
    paddingHorizontal: 18,
    marginTop: 20,
  },
  logoutDivider: {
    height: 1,
    backgroundColor: "rgba(216, 223, 233, 0.12)",
    marginBottom: 20,
  },
  logoutButton: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoutIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 79, 100, 0.12)",
    marginRight: 14,
  },
  logoutTitle: {
    color: "#FF4F64",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutDescription: {
    color: "#9AA8BD",
    fontSize: 13,
    marginTop: 3,
  },
});
