"use client";

import { Button } from "@/components/ui";
import {
  DropZone,
  Field,
  SectionCard,
  TextArea,
  TextInput,
  TextSelect,
} from "./clinic-data-ui";
import type { ClinicDataForm, ClinicDaySchedule } from "@/lib/clinic-data-types";
import { maskCep, maskCnpj, maskCpf, maskPhone, maskRg } from "@/lib/masks";
import { Plus } from "lucide-react";

type Props = {
  data: ClinicDataForm;
  setData: React.Dispatch<React.SetStateAction<ClinicDataForm>>;
  tab: string;
  cepLoading?: boolean;
  onCepBlur?: () => void;
};

export function ClinicDataTabContent({
  data,
  setData,
  tab,
  cepLoading,
  onCepBlur,
}: Props) {
  if (tab === "gerais") {
    return (
      <SectionCard
        title="Informações Gerais"
        description="Dados institucionais da clínica"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Nome da Clínica" required>
            <TextInput
              value={data.gerais.nomeClinica}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, nomeClinica: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Nome Fantasia" required>
            <TextInput
              value={data.gerais.nomeFantasia}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, nomeFantasia: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Razão Social" required>
            <TextInput
              value={data.gerais.razaoSocial}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, razaoSocial: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="CNPJ" required>
            <TextInput
              value={data.gerais.cnpj}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, cnpj: maskCnpj(e.target.value) },
                }))
              }
              placeholder="00.000.000/0000-00"
            />
          </Field>
          <Field label="Inscrição Estadual">
            <TextInput
              value={data.gerais.inscricaoEstadual}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, inscricaoEstadual: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Inscrição Municipal">
            <TextInput
              value={data.gerais.inscricaoMunicipal}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, inscricaoMunicipal: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="CNAE" className="md:col-span-2">
            <TextInput
              value={data.gerais.cnae}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, cnae: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Data de Fundação">
            <TextInput
              type="date"
              value={data.gerais.dataFundacao}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, dataFundacao: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Descrição da Clínica" className="md:col-span-2 xl:col-span-3">
            <TextArea
              value={data.gerais.descricao}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, descricao: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Especialidades oferecidas" className="md:col-span-2 xl:col-span-3">
            <TextInput
              value={data.gerais.especialidades}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  gerais: { ...d.gerais, especialidades: e.target.value },
                }))
              }
              placeholder="Separe por vírgula"
            />
          </Field>
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={data.gerais.exibirDescricaoDocumentos}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                gerais: { ...d.gerais, exibirDescricaoDocumentos: e.target.checked },
              }))
            }
          />
          Exibir descrição da clínica em documentos
        </label>
      </SectionCard>
    );
  }

  if (tab === "endereco") {
    const mapQuery = encodeURIComponent(
      `${data.endereco.rua} ${data.endereco.numero}, ${data.endereco.bairro}, ${data.endereco.cidade} ${data.endereco.estado}`
    );
    return (
      <SectionCard title="Endereço" description="Localização da clínica">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="CEP" required hint={cepLoading ? "Consultando CEP..." : "Busca automática ViaCEP"}>
            <TextInput
              value={data.endereco.cep}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, cep: maskCep(e.target.value) },
                }))
              }
              onBlur={onCepBlur}
              placeholder="00000-000"
            />
          </Field>
          <Field label="Rua" required className="md:col-span-2">
            <TextInput
              value={data.endereco.rua}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, rua: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Número" required>
            <TextInput
              value={data.endereco.numero}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, numero: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Complemento">
            <TextInput
              value={data.endereco.complemento}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, complemento: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Bairro" required>
            <TextInput
              value={data.endereco.bairro}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, bairro: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Cidade" required>
            <TextInput
              value={data.endereco.cidade}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, cidade: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Estado" required>
            <TextInput
              value={data.endereco.estado}
              maxLength={2}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, estado: e.target.value.toUpperCase() },
                }))
              }
            />
          </Field>
          <Field label="País">
            <TextInput
              value={data.endereco.pais}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  endereco: { ...d.endereco, pais: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            title="Mapa da clínica"
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
          />
        </div>
      </SectionCard>
    );
  }

  if (tab === "contatos") {
    return (
      <SectionCard title="Contatos" description="Canais de comunicação da clínica">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["telefonePrincipal", "Telefone Principal", true],
              ["whatsapp", "WhatsApp", false],
              ["telefoneSecundario", "Telefone Secundário", false],
              ["email", "E-mail", true],
              ["site", "Site", false],
              ["instagram", "Instagram", false],
              ["facebook", "Facebook", false],
              ["linkedin", "LinkedIn", false],
              ["horarioContato", "Horário para contato", false],
            ] as const
          ).map(([key, label, required]) => (
            <Field key={key} label={label} required={required}>
              <TextInput
                type={key === "email" ? "email" : "text"}
                value={data.contatos[key]}
                onChange={(e) => {
                  const value =
                    key.includes("telefone") || key === "whatsapp"
                      ? maskPhone(e.target.value)
                      : e.target.value;
                  setData((d) => ({
                    ...d,
                    contatos: { ...d.contatos, [key]: value },
                  }));
                }}
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (tab === "responsavel") {
    return (
      <SectionCard
        title="Responsável Técnico"
        description="Cirurgião-dentista responsável técnico pela clínica"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Nome" required className="md:col-span-2">
            <TextInput
              value={data.responsavel.nome}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, nome: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Especialidade">
            <TextInput
              value={data.responsavel.especialidade}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, especialidade: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="CPF" required>
            <TextInput
              value={data.responsavel.cpf}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, cpf: maskCpf(e.target.value) },
                }))
              }
            />
          </Field>
          <Field label="RG">
            <TextInput
              value={data.responsavel.rg}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, rg: maskRg(e.target.value) },
                }))
              }
            />
          </Field>
          <Field label="CRO" required>
            <TextInput
              value={data.responsavel.cro}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, cro: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="UF do CRO" required>
            <TextInput
              value={data.responsavel.ufCro}
              maxLength={2}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: {
                    ...d.responsavel,
                    ufCro: e.target.value.toUpperCase(),
                  },
                }))
              }
            />
          </Field>
          <Field label="Telefone">
            <TextInput
              value={data.responsavel.telefone}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: {
                    ...d.responsavel,
                    telefone: maskPhone(e.target.value),
                  },
                }))
              }
            />
          </Field>
          <Field label="E-mail">
            <TextInput
              type="email"
              value={data.responsavel.email}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  responsavel: { ...d.responsavel, email: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <DropZone label="Foto" accept="image/*" />
          <DropZone label="Assinatura Digital" accept="image/*" />
          <DropZone label="Carimbo" accept="image/*" />
        </div>
      </SectionCard>
    );
  }

  if (tab === "horario") {
    return (
      <SectionCard
        title="Horário de Funcionamento"
        description="Grade semanal de atendimento"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-3 font-semibold">Dia</th>
                <th className="px-2 py-3 font-semibold">Abertura</th>
                <th className="px-2 py-3 font-semibold">Fechamento</th>
                <th className="px-2 py-3 font-semibold">Intervalo</th>
                <th className="px-2 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.horario.map((row, idx) => (
                <tr key={row.day} className="border-b border-slate-50">
                  <td className="px-2 py-3 font-medium text-slate-800">{row.label}</td>
                  <td className="px-2 py-2">
                    <TextInput
                      type="time"
                      disabled={row.status === "fechado"}
                      value={row.open}
                      onChange={(e) => updateDay(setData, idx, { open: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      type="time"
                      disabled={row.status === "fechado"}
                      value={row.close}
                      onChange={(e) => updateDay(setData, idx, { close: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <TextInput
                        type="time"
                        disabled={row.status === "fechado"}
                        value={row.breakStart}
                        onChange={(e) =>
                          updateDay(setData, idx, { breakStart: e.target.value })
                        }
                      />
                      <span className="text-slate-400">–</span>
                      <TextInput
                        type="time"
                        disabled={row.status === "fechado"}
                        value={row.breakEnd}
                        onChange={(e) =>
                          updateDay(setData, idx, { breakEnd: e.target.value })
                        }
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <TextSelect
                      value={row.status}
                      onChange={(e) =>
                        updateDay(setData, idx, {
                          status: e.target.value as ClinicDaySchedule["status"],
                        })
                      }
                    >
                      <option value="aberto">Aberto</option>
                      <option value="fechado">Fechado</option>
                    </TextSelect>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    );
  }

  if (tab === "bancarios") {
    return (
      <SectionCard
        title="Dados Bancários"
        description="Usados em contratos, recibos, PIX e cobranças"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["banco", "Banco"],
              ["agencia", "Agência"],
              ["conta", "Conta"],
              ["tipo", "Tipo"],
              ["pix", "PIX"],
              ["titular", "Titular"],
              ["documento", "CPF/CNPJ"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextInput
                value={data.bancarios[key]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    bancarios: { ...d.bancarios, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (tab === "financeiros") {
    return (
      <SectionCard title="Dados Financeiros" description="Regras comerciais padrão">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Moeda">
            <TextSelect
              value={data.financeiros.moeda}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  financeiros: { ...d.financeiros, moeda: e.target.value },
                }))
              }
            >
              <option value="BRL">BRL — Real</option>
              <option value="USD">USD — Dólar</option>
              <option value="EUR">EUR — Euro</option>
            </TextSelect>
          </Field>
          <Field label="Dias para vencimento">
            <TextInput
              type="number"
              value={data.financeiros.diasVencimento}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  financeiros: {
                    ...d.financeiros,
                    diasVencimento: Number(e.target.value) || 0,
                  },
                }))
              }
            />
          </Field>
          {(
            [
              ["juros", "Juros"],
              ["multa", "Multa"],
              ["descontoMaximo", "Desconto máximo"],
              ["taxaAdministrativa", "Taxa administrativa"],
              ["contaPadrao", "Conta padrão"],
              ["centroCustoPadrao", "Centro de custo padrão"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextInput
                value={data.financeiros[key]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    financeiros: { ...d.financeiros, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (tab === "fiscais") {
    return (
      <SectionCard
        title="Dados Fiscais"
        description="Preparados para integração futura com NFSe"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["regimeTributario", "Regime Tributário"],
              ["cnae", "CNAE"],
              ["inscricaoMunicipal", "Inscrição Municipal"],
              ["codigoIbge", "Código IBGE"],
              ["codigoMunicipio", "Código do Município"],
              ["emissorNf", "Emissor de Nota Fiscal"],
              ["serie", "Série"],
              ["proximoNumero", "Próximo número"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextInput
                value={data.fiscais[key]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    fiscais: { ...d.fiscais, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (tab === "convenios") {
    return (
      <SectionCard
        title="Convênios"
        description="Operadoras e planos odontológicos"
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setData((d) => ({
                ...d,
                convenios: [
                  ...d.convenios,
                  {
                    id: `cv-${Date.now()}`,
                    name: "Novo convênio",
                    code: "",
                    contact: "",
                    phone: "",
                    paymentTermDays: 30,
                    status: "ativo",
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Novo Convênio
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-3">Nome</th>
                <th className="px-2 py-3">Código</th>
                <th className="px-2 py-3">Contato</th>
                <th className="px-2 py-3">Telefone</th>
                <th className="px-2 py-3">Prazo</th>
                <th className="px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.convenios.map((cv, idx) => (
                <tr key={cv.id} className="border-b border-slate-50">
                  <td className="px-2 py-2">
                    <TextInput
                      value={cv.name}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = { ...cv, name: e.target.value };
                          return { ...d, convenios };
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      value={cv.code}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = { ...cv, code: e.target.value };
                          return { ...d, convenios };
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      value={cv.contact}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = { ...cv, contact: e.target.value };
                          return { ...d, convenios };
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      value={cv.phone}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = {
                            ...cv,
                            phone: maskPhone(e.target.value),
                          };
                          return { ...d, convenios };
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      type="number"
                      value={cv.paymentTermDays}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = {
                            ...cv,
                            paymentTermDays: Number(e.target.value) || 0,
                          };
                          return { ...d, convenios };
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextSelect
                      value={cv.status}
                      onChange={(e) =>
                        setData((d) => {
                          const convenios = [...d.convenios];
                          convenios[idx] = {
                            ...cv,
                            status: e.target.value as "ativo" | "inativo",
                          };
                          return { ...d, convenios };
                        })
                      }
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </TextSelect>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    );
  }

  if (tab === "identidade") {
    return (
      <div className="space-y-4">
        <SectionCard
          title="Identidade Visual"
          description="Logos e assets da marca"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DropZone label="Logo Principal" accept="image/*" />
            <DropZone label="Logo Branca" accept="image/*" />
            <DropZone label="Logo Escura" accept="image/*" />
            <DropZone label="Ícone (Favicon)" accept="image/*" />
            <DropZone label="Marca d'água" accept="image/*" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Cor primária">
              <TextInput
                type="color"
                value={data.identidade.corPrimaria}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    identidade: { ...d.identidade, corPrimaria: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Cor secundária">
              <TextInput
                type="color"
                value={data.identidade.corSecundaria}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    identidade: { ...d.identidade, corSecundaria: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Cor de destaque">
              <TextInput
                type="color"
                value={data.identidade.corDestaque}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    identidade: { ...d.identidade, corDestaque: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Fonte">
              <TextSelect
                value={data.identidade.fonte}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    identidade: { ...d.identidade, fonte: e.target.value },
                  }))
                }
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Open Sans">Open Sans</option>
              </TextSelect>
            </Field>
          </div>
        </SectionCard>
        <SectionCard title="Pré-visualização de documentos">
          <div
            className="rounded-2xl border border-slate-200 p-6"
            style={{
              borderTopWidth: 4,
              borderTopColor: data.identidade.corPrimaria,
              fontFamily: data.identidade.fonte,
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{ color: data.identidade.corSecundaria }}
            >
              {data.gerais.nomeClinica}
            </p>
            <p className="mt-1 text-sm text-slate-500">{data.documentos.cabecalho}</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {data.gerais.descricao}
            </div>
            <p className="mt-4 text-xs text-slate-400">{data.documentos.rodape}</p>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (tab === "documentos") {
    return (
      <SectionCard
        title="Contratos e Documentos"
        description="Textos padrão utilizados na geração de documentos"
      >
        <div className="grid gap-4">
          {(
            [
              ["cabecalho", "Cabeçalho dos contratos"],
              ["rodape", "Rodapé"],
              ["termosUso", "Termos de uso"],
              ["textoOrcamentos", "Texto padrão dos orçamentos"],
              ["textoRecibos", "Texto padrão dos recibos"],
              ["textoReceitas", "Texto padrão das receitas"],
              ["textoAtestados", "Texto padrão dos atestados"],
              ["modeloContratos", "Modelo padrão de contratos"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextArea
                value={data.documentos[key]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    documentos: { ...d.documentos, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (tab === "lgpd") {
    return (
      <SectionCard title="LGPD" description="Políticas de proteção de dados">
        <div className="grid gap-4">
          {(
            [
              ["politicaPrivacidade", "Política de Privacidade"],
              ["consentimento", "Consentimento"],
              ["compartilhamento", "Compartilhamento de Dados"],
              ["tempoArmazenamento", "Tempo de armazenamento"],
              ["dadosSensiveis", "Tratamento de dados sensíveis"],
              ["retencaoProntuarios", "Retenção de prontuários"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextArea
                value={data.lgpd[key]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    lgpd: { ...d.lgpd, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Configurações" description="Preferências do sistema">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Fuso horário">
          <TextInput
            value={data.configuracoes.fusoHorario}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                configuracoes: { ...d.configuracoes, fusoHorario: e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Formato de data">
          <TextSelect
            value={data.configuracoes.formatoData}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                configuracoes: { ...d.configuracoes, formatoData: e.target.value },
              }))
            }
          >
            <option value="DD/MM/AAAA">DD/MM/AAAA</option>
            <option value="MM/DD/AAAA">MM/DD/AAAA</option>
            <option value="AAAA-MM-DD">AAAA-MM-DD</option>
          </TextSelect>
        </Field>
        <Field label="Formato de moeda">
          <TextInput
            value={data.configuracoes.formatoMoeda}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                configuracoes: {
                  ...d.configuracoes,
                  formatoMoeda: e.target.value,
                },
              }))
            }
          />
        </Field>
        <Field label="Idioma">
          <TextSelect
            value={data.configuracoes.idioma}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                configuracoes: { ...d.configuracoes, idioma: e.target.value },
              }))
            }
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English</option>
            <option value="es-ES">Español</option>
          </TextSelect>
        </Field>
        <Field label="Tema">
          <TextSelect
            value={data.configuracoes.tema}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                configuracoes: { ...d.configuracoes, tema: e.target.value },
              }))
            }
          >
            <option value="claro">Claro</option>
            <option value="escuro">Escuro</option>
            <option value="sistema">Sistema</option>
          </TextSelect>
        </Field>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(
          [
            ["backupAutomatico", "Backup automático"],
            ["notificacoes", "Notificações"],
            ["assinaturaEletronica", "Assinatura eletrônica"],
            ["autoSave", "Auto Save opcional"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={data.configuracoes[key]}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  configuracoes: {
                    ...d.configuracoes,
                    [key]: e.target.checked,
                  },
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Integrações futuras: NFSe, WhatsApp Business API, gateways de pagamento.
      </p>
    </SectionCard>
  );
}

function updateDay(
  setData: React.Dispatch<React.SetStateAction<ClinicDataForm>>,
  idx: number,
  patch: Partial<ClinicDaySchedule>
) {
  setData((d) => {
    const horario = [...d.horario];
    horario[idx] = { ...horario[idx], ...patch };
    return { ...d, horario };
  });
}
