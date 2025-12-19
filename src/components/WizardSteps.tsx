import React from "react";

type Props = {
  currentStep: 1 | 2 | 3 | 4;
};

const steps = [
  { n: 1, label: "Filtrar CPV" },
  { n: 2, label: "Comunidades" },
  { n: 3, label: "Licitaciones" },
  { n: 4, label: "Detalles" },
] as const;

export const WizardSteps: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => {
          const active = s.n === currentStep;
          const done = s.n < currentStep;

          return (
            <div
              key={s.n}
              className={[
                "px-3 py-2 rounded-md border text-sm",
                active ? "border-primary bg-primary/10 text-primary" : "border-border",
                done ? "opacity-90" : "opacity-80",
              ].join(" ")}
            >
              <span className="font-semibold mr-2">{s.n}</span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

