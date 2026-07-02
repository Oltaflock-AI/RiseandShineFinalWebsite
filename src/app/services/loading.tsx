import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function ServicesLoading() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 pt-24">
      <PlaneLoader
        message="Loading our services…"
        sub="Hotels, flights, cruises, visas and more, all in one place"
      />
    </div>
  );
}
