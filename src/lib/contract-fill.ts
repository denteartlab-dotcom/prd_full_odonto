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

export type FilledExtracaoContract = {
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

function dash(value?: string | null) {
  const v = (value || "").trim();
  return v || "________________";
}

export function buildExtracaoContractData(
  patient: PatientProfile,
  clinic: Partial<ClinicContractParty> | null | undefined
): FilledExtracaoContract {
  const base = buildFilledContractPatient(patient);
  const clinicCity = clinic?.city || base.city || "São Paulo";
  const clinicState = clinic?.state || base.state || "SP";

  return {
    clinic: {
      name: dash(clinic?.name),
      cnpj: dash(clinic?.cnpj),
      address: dash(clinic?.address),
      city: clinicCity,
      state: clinicState,
      responsibleDentist: dash(clinic?.responsibleDentist),
      cro: dash(clinic?.cro),
    },
    patient: {
      ...base,
      nationality: "brasileira(o)",
      profession: dash(patient.profession || "Não informado"),
      orgaoExpedidor: dash(patient.orgaoExpedidor || "SSP"),
      numero: dash(patient.numero),
      complemento: dash(patient.complemento || "—"),
      bairro: dash(patient.bairro),
      name: dash(base.name),
      cpf: dash(base.cpf),
      rg: dash(base.rg),
      phone: dash(base.phone),
      email: dash(base.email),
      address: dash(patient.endereco || base.address),
      city: dash(base.city),
      state: dash(base.state),
      cep: dash(base.cep),
      estadoCivil: dash(base.estadoCivil),
    },
    generatedAtLabel: todayDisplay(),
    generatedDateShort: new Date().toLocaleDateString("pt-BR"),
  };
}

export function fillBlank(value: string) {
  return value;
}
