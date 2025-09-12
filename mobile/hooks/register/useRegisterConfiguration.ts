import { useMemo } from "react";
import { COUNTRIES } from "../../constants/countries";
import { STEPS_CONFIG, TOTAL_STEPS } from "./register.constants";
import useI18n from "../useI18n";

export function useRegisterConfiguration() {
  const { t } = useI18n();
  const countryItems = useMemo(() => 
    Object.entries(COUNTRIES).map(([code, name]) => ({
      label: name,
      value: code,
    })),
    []
  );
  const stepTitles = useMemo(() => 
    STEPS_CONFIG.map(step => t(step)),
    [t]
  );

  return {
    countryItems,
    stepTitles,
    totalSteps: TOTAL_STEPS,
    t,
  };
}
