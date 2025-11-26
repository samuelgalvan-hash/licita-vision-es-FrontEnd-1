import { Check, MapPin, FileText, Filter, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 1, name: "Comunidades", icon: MapPin },
  { id: 2, name: "Licitaciones", icon: FileText },
  { id: 3, name: "Filtrar CPV", icon: Filter },
  { id: 4, name: "Detalles", icon: FileDown },
];

interface WizardStepsProps {
  currentStep: number;
}

export function WizardSteps({ currentStep }: WizardStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  isCompleted && "bg-primary/10 text-primary",
                  isCurrent && "bg-primary text-primary-foreground shadow-md",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary-foreground bg-transparent",
                    !isCompleted && !isCurrent && "border-muted-foreground bg-transparent"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 md:w-12 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
