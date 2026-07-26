import type { PatientProfile } from "@/lib/patient-profile-types";
import { buildFilledContractPatient, todayDisplay } from "@/lib/patient-contracts";

export type ClinicContractParty = {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  responsibleDentist: string;
  cro: string;
};

export type FilledContractParties = {
  clinic: ClinicContractParty;
  patient: ReturnType<typeof buildFilledContractPatient> & {
    nationality: string;
    profession: string;
    orgaoExpedidor: string;
    numero: string;
    complemento: string;
    bairro: string;
  };
  generatedAtLabel: string;
  generatedDateShort: string;
};

/** @deprecated use FilledContractParties */
export type FilledExtracaoContract = FilledContractParties;

function text(value?: string | null, fallback = "") {
  const v = (value || "").trim();
  return v || fallback;
}

function cleanClinicAddress(address: string, city: string, state: string) {
  let cleaned = address.trim();
  const suffix = [city, state].filter(Boolean).join("/");
  if (suffix && cleaned.toLowerCase().includes(suffix.toLowerCase())) {
    return cleaned;
  }
  if (cleaned && suffix) return `${cleaned} — ${suffix}`;
  return cleaned || suffix;
}

export function buildFilledContractParties(
  patient: PatientProfile,
  clinic: Partial<ClinicContractParty> | null | undefined
): FilledContractParties {
  const base = buildFilledContractPatient(patient);
  const clinicCity = text(clinic?.city, text(base.city, "São Paulo"));
  const clinicState = text(clinic?.state, text(base.state, "SP"));
  const clinicAddressRaw = text(clinic?.address);
  const clinicAddress = cleanClinicAddress(clinicAddressRaw, clinicCity, clinicState);

  return {
    clinic: {
      name: text(clinic?.name, "Clínica"),
      cnpj: text(clinic?.cnpj),
      address: clinicAddress,
      city: clinicCity,
      state: clinicState,
      responsibleDentist: text(clinic?.responsibleDentist),
      cro: text(clinic?.cro),
    },
    patient: {
      ...base,
      nationality: "brasileira(o)",
      profession: text(patient.profession),
      orgaoExpedidor: text(patient.orgaoExpedidor, "SSP"),
      numero: text(patient.numero),
      complemento: text(patient.complemento),
      bairro: text(patient.bairro),
      name: text(base.name),
      cpf: text(base.cpf),
      rg: text(base.rg),
      phone: text(base.phone),
      email: text(base.email),
      address: text(patient.endereco || base.address),
      city: text(base.city),
      state: text(base.state),
      cep: text(base.cep),
      estadoCivil: text(base.estadoCivil),
    },
    generatedAtLabel: todayDisplay(),
    generatedDateShort: new Date().toLocaleDateString("pt-BR"),
  };
}

/** Alias mantido para o contrato de extrações */
export function buildExtracaoContractData(
  patient: PatientProfile,
  clinic: Partial<ClinicContractParty> | null | undefined
) {
  return buildFilledContractParties(patient, clinic);
}
