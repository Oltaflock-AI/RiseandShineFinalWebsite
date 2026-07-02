import { Icon, type IconName } from "./Icon";

/**
 * Rich, equal-height service card for the Services page: a prominent gradient
 * icon tile + title + description, with a subtle lift/pop on hover. Non-link
 * (informational), so it doesn't imply a click target.
 */
export function ServiceFeatureCard({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-brand-lg border border-line bg-white p-7 shadow-brand-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-red/25 hover:shadow-brand">
      {/* faint corner wash for depth */}
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red/5 transition-transform duration-500 group-hover:scale-150"
        aria-hidden
      />
      <span className="grad-red mb-5 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-brand-red transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <Icon name={icon} size={26} strokeWidth={1.9} />
      </span>
      <h3 className="mb-2 text-[1.15rem]">{title}</h3>
      <p className="text-[0.93rem] leading-relaxed text-muted">{description}</p>
    </div>
  );
}
