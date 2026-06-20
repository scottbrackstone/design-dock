import { AppShell } from "@/components/app-shell/AppShell";
import { DesignStoreProvider } from "@/store/useDesignStore";

export default function Home() {
  return (
    <DesignStoreProvider>
      <AppShell />
    </DesignStoreProvider>
  );
}
