export type EmergencyContact = {
  id: string;
  nome: string;
  parentesco: string;
  telefone: string;
};

export type PatientFormState = {
  nomeCompleto: string;
  nomeSocial: string;
  cpf: string;
  rg: string;
  orgaoExpedidor: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  convenio: string;
  plano: string;
  carteirinha: string;
  profissao: string;
  responsavelFinanceiro: string;
  telefoneResponsavel: string;
  comoConheceu: string;
  observacoes: string;
  observacoesInternas: string;
  contatosEmergencia: EmergencyContact[];
};

export const emptyPatientForm = (): PatientFormState => ({
  nomeCompleto: "",
  nomeSocial: "",
  cpf: "",
  rg: "",
  orgaoExpedidor: "",
  dataNascimento: "",
  sexo: "",
  estadoCivil: "",
  telefonePrincipal: "",
  telefoneSecundario: "",
  email: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  convenio: "",
  plano: "",
  carteirinha: "",
  profissao: "",
  responsavelFinanceiro: "proprio",
  telefoneResponsavel: "",
  comoConheceu: "",
  observacoes: "",
  observacoesInternas: "",
  contatosEmergencia: [
    { id: "1", nome: "", parentesco: "", telefone: "" },
  ],
});

/** Mock inicial só para pré-visualização visual (opcional). */
export const mockPatientFormPreview = (): PatientFormState => ({
  ...emptyPatientForm(),
  nomeCompleto: "",
  sexo: "",
});
