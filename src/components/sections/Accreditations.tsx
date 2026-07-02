import Image from "next/image";
import { accreditations } from "@/data/accreditations";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { cn } from "@/lib/cn";

export function Accreditations({ soft = false }: { soft?: boolean }) {
  return (
    <section className={cn("py-16", soft && "bg-cream-2")}>
      <Container className="text-center">
        <Eyebrow center>Recognised &amp; accredited</Eyebrow>
        <h2 className="h-md mb-8">A proud member of</h2>
        <Reveal>
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {accreditations.map((a) => (
              <li
                key={a.name}
                title={a.full}
                className="flex h-24 w-40 items-center justify-center rounded-2xl border border-line bg-white px-6 py-4 shadow-brand-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-brand"
              >
                <Image
                  src={a.logo}
                  alt={a.full}
                  width={160}
                  height={96}
                  sizes="160px"
                  className="max-h-14 w-auto object-contain"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
