import { onlyDigits } from "@/lib/masks";

export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error("Falha ao consultar CEP.");

  const json = (await res.json()) as ViaCepAddress & { erro?: boolean };
  if (json.erro) return null;

  return {
    cep: json.cep || digits,
    logradouro: json.logradouro || "",
    complemento: json.complemento || "",
    bairro: json.bairro || "",
    localidade: json.localidade || "",
    uf: json.uf || "",
  };
}
