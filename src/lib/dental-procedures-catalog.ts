import type { ProcedureCatalogItem } from "./budget-types";

/**
 * Catálogo local de procedimentos odontológicos (códigos TUSS) com
 * valor médio de referência para clínica particular no Brasil.
 *
 * Não existe API pública gratuita estável com preços médios de mercado.
 * Valores são referência editável no orçamento — não tabela oficial.
 */
export type DentalProcedureCatalogItem = ProcedureCatalogItem & {
  aliases?: string[];
};

export const DENTAL_PROCEDURES_CATALOG: DentalProcedureCatalogItem[] = [
  // Diagnóstico / consulta (mantém primeiros itens compatíveis com mocks)
  { id: "proc-001", code: "81000065", name: "Consulta inicial", category: "Diagnóstico", price: 150, estimatedMinutes: 30, aliases: ["consulta", "primeira consulta"] },
  { id: "proc-002", code: "81000421", name: "Radiografia periapical", category: "Radiologia", price: 80, estimatedMinutes: 15, aliases: ["rx periapical", "raio x"] },
  { id: "proc-003", code: "81000405", name: "Radiografia panorâmica", category: "Radiologia", price: 180, estimatedMinutes: 20, aliases: ["panoramica", "rx panoramico"] },
  { id: "proc-004", code: "84000198", name: "Limpeza dental (profilaxia)", category: "Preventivo", price: 220, estimatedMinutes: 45, aliases: ["limpeza", "profilaxia", "polimento"] },
  { id: "proc-005", code: "85100110", name: "Restauração em resina", category: "Restaurador", price: 280, estimatedMinutes: 60, aliases: ["resina", "obturação", "restauracao"] },
  { id: "proc-006", code: "85100099", name: "Tratamento de canal", category: "Endodontia", price: 850, estimatedMinutes: 90, aliases: ["canal", "endodontia", "tratamento endodontico"] },
  { id: "proc-007", code: "85500020", name: "Implante unitário", category: "Implantodontia", price: 3500, estimatedMinutes: 120, aliases: ["implante", "pino"] },
  { id: "proc-008", code: "85400106", name: "Coroa em porcelana", category: "Prótese", price: 1800, estimatedMinutes: 90, aliases: ["coroa", "porcelana", "cerâmica"] },
  { id: "proc-009", code: "85100030", name: "Clareamento dental", category: "Estética", price: 1200, estimatedMinutes: 60, aliases: ["clareamento", "branqueamento"] },
  { id: "proc-010", code: "82000867", name: "Extração simples", category: "Cirurgia", price: 350, estimatedMinutes: 45, aliases: ["extracao", "exodontia", "arrancar dente"] },
  { id: "proc-011", code: "82000980", name: "Extração de siso", category: "Cirurgia", price: 650, estimatedMinutes: 60, aliases: ["siso", "terceiro molar"] },
  { id: "proc-012", code: "85100064", name: "Faceta em resina", category: "Estética", price: 950, estimatedMinutes: 75, aliases: ["faceta", "lente de contato"] },
  { id: "proc-013", code: "85400482", name: "Prótese total superior", category: "Prótese", price: 2800, estimatedMinutes: 120, aliases: ["dentadura", "protese total"] },
  { id: "proc-014", code: "85400394", name: "Prótese parcial removível", category: "Prótese", price: 2200, estimatedMinutes: 90, aliases: ["ppr", "protese parcial"] },
  { id: "proc-015", code: "84000090", name: "Aplicação de flúor", category: "Preventivo", price: 90, estimatedMinutes: 20, aliases: ["fluor", "fluoretação"] },

  // Diagnóstico
  { id: "proc-016", code: "81000030", name: "Consulta odontológica", category: "Diagnóstico", price: 150, estimatedMinutes: 30 },
  { id: "proc-017", code: "81000049", name: "Consulta de urgência", category: "Diagnóstico", price: 220, estimatedMinutes: 40, aliases: ["urgencia", "emergencia"] },
  { id: "proc-018", code: "81000189", name: "Diagnóstico e planejamento odontológico", category: "Diagnóstico", price: 300, estimatedMinutes: 45, aliases: ["planejamento"] },
  { id: "proc-019", code: "81000014", name: "Condicionamento em odontologia", category: "Diagnóstico", price: 180, estimatedMinutes: 30 },
  { id: "proc-020", code: "81000219", name: "Diagnóstico e tratamento da halitose", category: "Diagnóstico", price: 280, estimatedMinutes: 40, aliases: ["halitose", "mau halito"] },

  // Radiologia
  { id: "proc-021", code: "81000375", name: "Radiografia interproximal (bite-wing)", category: "Radiologia", price: 70, estimatedMinutes: 10, aliases: ["bitewing", "interproximal"] },
  { id: "proc-022", code: "81000383", name: "Radiografia oclusal", category: "Radiologia", price: 90, estimatedMinutes: 15 },
  { id: "proc-023", code: "81000340", name: "Radiografia da ATM", category: "Radiologia", price: 250, estimatedMinutes: 25, aliases: ["atm"] },
  { id: "proc-024", code: "81000480", name: "Telerradiografia com traçado", category: "Radiologia", price: 220, estimatedMinutes: 25, aliases: ["teleradiografia"] },
  { id: "proc-025", code: "81000510", name: "Tomografia cone beam", category: "Radiologia", price: 450, estimatedMinutes: 30, aliases: ["tomografia", "cbct", "cone beam"] },
  { id: "proc-026", code: "81000278", name: "Fotografia clínica (unidade)", category: "Radiologia", price: 40, estimatedMinutes: 10 },
  { id: "proc-027", code: "81000308", name: "Modelos ortodônticos (par)", category: "Radiologia", price: 180, estimatedMinutes: 40 },

  // Preventivo
  { id: "proc-028", code: "84000074", name: "Aplicação de selante (por elemento)", category: "Preventivo", price: 120, estimatedMinutes: 20, aliases: ["selante"] },
  { id: "proc-029", code: "84000112", name: "Aplicação de verniz fluoretado", category: "Preventivo", price: 100, estimatedMinutes: 20 },
  { id: "proc-030", code: "84000163", name: "Controle de biofilme (sessão)", category: "Preventivo", price: 180, estimatedMinutes: 40 },
  { id: "proc-031", code: "84000139", name: "Atividade educativa em saúde bucal", category: "Preventivo", price: 80, estimatedMinutes: 20 },
  { id: "proc-032", code: "84000015", name: "Aparelho protetor bucal (por arcada)", category: "Preventivo", price: 450, estimatedMinutes: 40, aliases: ["protetor bucal", "mouthguard"] },
  { id: "proc-033", code: "84000201", name: "Remineralização (por sessão)", category: "Preventivo", price: 150, estimatedMinutes: 30 },

  // Dentística / restaurador
  { id: "proc-034", code: "85100013", name: "Capeamento pulpar direto", category: "Restaurador", price: 220, estimatedMinutes: 40 },
  { id: "proc-035", code: "85100048", name: "Colagem de fragmentos dentários", category: "Restaurador", price: 350, estimatedMinutes: 50 },
  { id: "proc-036", code: "85100056", name: "Curativo de demora", category: "Restaurador", price: 180, estimatedMinutes: 30 },
  { id: "proc-037", code: "85100137", name: "Adequação do meio bucal (por arcada)", category: "Restaurador", price: 200, estimatedMinutes: 40 },
  { id: "proc-038", code: "85300012", name: "Dessensibilização dentária", category: "Restaurador", price: 160, estimatedMinutes: 30, aliases: ["sensibilidade"] },
  { id: "proc-039", code: "85100129", name: "Restauração em amálgama", category: "Restaurador", price: 200, estimatedMinutes: 45, aliases: ["amalgama"] },
  { id: "proc-040", code: "85100145", name: "Restauração provisória", category: "Restaurador", price: 120, estimatedMinutes: 25 },

  // Endodontia
  { id: "proc-041", code: "85100080", name: "Tratamento endodôntico unirradicular", category: "Endodontia", price: 650, estimatedMinutes: 75, aliases: ["canal unirradicular"] },
  { id: "proc-042", code: "85100088", name: "Tratamento endodôntico birradicular", category: "Endodontia", price: 850, estimatedMinutes: 90 },
  { id: "proc-043", code: "85100096", name: "Tratamento endodôntico multirradicular", category: "Endodontia", price: 1100, estimatedMinutes: 120, aliases: ["canal molar"] },
  { id: "proc-044", code: "85100153", name: "Retratamento endodôntico", category: "Endodontia", price: 1400, estimatedMinutes: 120, aliases: ["retratamento canal"] },
  { id: "proc-045", code: "85200018", name: "Clareamento de dente desvitalizado", category: "Endodontia", price: 350, estimatedMinutes: 45 },
  { id: "proc-046", code: "85200026", name: "Preparo para núcleo intrarradicular", category: "Endodontia", price: 280, estimatedMinutes: 40 },

  // Periodontia
  { id: "proc-047", code: "82000417", name: "Cirurgia periodontal a retalho", category: "Periodontia", price: 650, estimatedMinutes: 90, aliases: ["retalho periodontal"] },
  { id: "proc-048", code: "84100020", name: "Raspagem subgengival (por sextante)", category: "Periodontia", price: 280, estimatedMinutes: 45, aliases: ["raspagem", "periodontal"] },
  { id: "proc-049", code: "84100038", name: "Raspagem coronorradicular", category: "Periodontia", price: 320, estimatedMinutes: 50 },
  { id: "proc-050", code: "84100046", name: "Gengivectomia (por elemento)", category: "Periodontia", price: 400, estimatedMinutes: 45, aliases: ["gengivectomia"] },
  { id: "proc-051", code: "84100054", name: "Gengivoplastia", category: "Periodontia", price: 450, estimatedMinutes: 50 },
  { id: "proc-052", code: "82000212", name: "Aumento de coroa clínica", category: "Periodontia", price: 550, estimatedMinutes: 60 },

  // Cirurgia
  { id: "proc-053", code: "82000875", name: "Extração de dente retido", category: "Cirurgia", price: 750, estimatedMinutes: 75, aliases: ["incluso", "retido"] },
  { id: "proc-054", code: "82000034", name: "Alveoloplastia", category: "Cirurgia", price: 480, estimatedMinutes: 60 },
  { id: "proc-055", code: "82000182", name: "Apicetomia (incisivos/caninos)", category: "Cirurgia", price: 680, estimatedMinutes: 90, aliases: ["apicetomia"] },
  { id: "proc-056", code: "82000166", name: "Apicetomia de molares", category: "Cirurgia", price: 950, estimatedMinutes: 110 },
  { id: "proc-057", code: "82000239", name: "Biópsia de boca", category: "Cirurgia", price: 450, estimatedMinutes: 40, aliases: ["biopsia"] },
  { id: "proc-058", code: "82001014", name: "Ulectomia", category: "Cirurgia", price: 320, estimatedMinutes: 30 },
  { id: "proc-059", code: "82001022", name: "Ulotomia", category: "Cirurgia", price: 280, estimatedMinutes: 25 },
  { id: "proc-060", code: "82000395", name: "Cirurgia para torus palatino", category: "Cirurgia", price: 900, estimatedMinutes: 90 },
  { id: "proc-061", code: "82000905", name: "Frenectomia labial", category: "Cirurgia", price: 480, estimatedMinutes: 40, aliases: ["freio", "frenectomia"] },
  { id: "proc-062", code: "82000913", name: "Frenectomia lingual", category: "Cirurgia", price: 520, estimatedMinutes: 45 },

  // Prótese
  { id: "proc-063", code: "85400157", name: "Coroa metalocerâmica", category: "Prótese", price: 1600, estimatedMinutes: 90 },
  { id: "proc-064", code: "85400114", name: "Coroa em cerômero", category: "Prótese", price: 1400, estimatedMinutes: 80 },
  { id: "proc-065", code: "85400149", name: "Coroa total metálica", category: "Prótese", price: 900, estimatedMinutes: 70 },
  { id: "proc-066", code: "85400076", name: "Coroa provisória", category: "Prótese", price: 280, estimatedMinutes: 40 },
  { id: "proc-067", code: "85400220", name: "Núcleo metálico fundido", category: "Prótese", price: 450, estimatedMinutes: 50 },
  { id: "proc-068", code: "85400211", name: "Núcleo de preenchimento", category: "Prótese", price: 320, estimatedMinutes: 40 },
  { id: "proc-069", code: "85400262", name: "Pino pré-fabricado", category: "Prótese", price: 280, estimatedMinutes: 35 },
  { id: "proc-070", code: "85400050", name: "Conserto em prótese total/parcial", category: "Prótese", price: 280, estimatedMinutes: 40, aliases: ["conserto protese", "reparo"] },
  { id: "proc-071", code: "85400490", name: "Prótese total inferior", category: "Prótese", price: 2800, estimatedMinutes: 120 },
  { id: "proc-072", code: "85400300", name: "Prótese fixa adesiva indireta", category: "Prótese", price: 1200, estimatedMinutes: 80, aliases: ["maryland"] },
  { id: "proc-073", code: "85400246", name: "Placa oclusal estabilizadora", category: "Prótese", price: 900, estimatedMinutes: 60, aliases: ["placa miorrelaxante", "placa oclusal"] },
  { id: "proc-074", code: "85400025", name: "Ajuste oclusal por desgaste seletivo", category: "Prótese", price: 220, estimatedMinutes: 30 },

  // Estética
  { id: "proc-075", code: "85100021", name: "Clareamento caseiro (por arcada)", category: "Estética", price: 800, estimatedMinutes: 40 },
  { id: "proc-076", code: "85400181", name: "Faceta em cerâmica pura", category: "Estética", price: 2200, estimatedMinutes: 90, aliases: ["lente de contato dental", "faceta porcelana"] },
  { id: "proc-077", code: "85400190", name: "Faceta em cerômero", category: "Estética", price: 1600, estimatedMinutes: 80 },

  // Implantodontia
  { id: "proc-078", code: "85500038", name: "Coroa metalocerâmica sobre implante", category: "Implantodontia", price: 2200, estimatedMinutes: 90 },
  { id: "proc-079", code: "85500011", name: "Coroa provisória sobre implante", category: "Implantodontia", price: 450, estimatedMinutes: 40 },
  { id: "proc-080", code: "85500062", name: "Guia cirúrgico para implantes", category: "Implantodontia", price: 650, estimatedMinutes: 50 },
  { id: "proc-081", code: "85500070", name: "Intermediário protético (abutment)", category: "Implantodontia", price: 800, estimatedMinutes: 30, aliases: ["abutment", "pilar"] },
  { id: "proc-082", code: "85500089", name: "Manutenção de prótese sobre implantes", category: "Implantodontia", price: 250, estimatedMinutes: 40 },
  { id: "proc-083", code: "85500097", name: "Overdenture sobre 2 implantes", category: "Implantodontia", price: 6500, estimatedMinutes: 150 },
  { id: "proc-084", code: "82001405", name: "Enxerto ósseo (por região)", category: "Implantodontia", price: 1800, estimatedMinutes: 90, aliases: ["enxerto"] },
  { id: "proc-085", code: "82001448", name: "Levantamento de seio maxilar", category: "Implantodontia", price: 2800, estimatedMinutes: 120, aliases: ["sinus lift"] },

  // Ortodontia
  { id: "proc-086", code: "86000342", name: "Aparelho ortodôntico fixo (instalação)", category: "Ortodontia", price: 2500, estimatedMinutes: 90, aliases: ["aparelho", "ortodontia", "brackets"] },
  { id: "proc-087", code: "86000350", name: "Manutenção ortodôntica mensal", category: "Ortodontia", price: 250, estimatedMinutes: 30, aliases: ["manutencao aparelho"] },
  { id: "proc-088", code: "86000474", name: "Contenção ortodôntica fixa", category: "Ortodontia", price: 450, estimatedMinutes: 40, aliases: ["contenção"] },
  { id: "proc-089", code: "86000369", name: "Aparelho ortodôntico removível", category: "Ortodontia", price: 1200, estimatedMinutes: 60 },
  { id: "proc-090", code: "86000520", name: "Alinhadores transparentes (arcada)", category: "Ortodontia", price: 4500, estimatedMinutes: 60, aliases: ["invisalign", "alinhador", "clear aligner"] },

  // Pediatria
  { id: "proc-091", code: "87000024", name: "Atividade educativa para pais/cuidadores", category: "Odontopediatria", price: 100, estimatedMinutes: 20 },
  { id: "proc-092", code: "85100200", name: "Restauração em dente decíduo", category: "Odontopediatria", price: 220, estimatedMinutes: 40, aliases: ["dente de leite"] },
  { id: "proc-093", code: "82000840", name: "Extração de dente decíduo", category: "Odontopediatria", price: 180, estimatedMinutes: 25 },
  { id: "proc-094", code: "85100218", name: "Pulpotomia em dente decíduo", category: "Odontopediatria", price: 350, estimatedMinutes: 45 },

  // ATM / DTM
  { id: "proc-095", code: "85400254", name: "Placa oclusal reposicionadora", category: "DTM", price: 1100, estimatedMinutes: 60, aliases: ["dtm", "placa atm"] },
  { id: "proc-096", code: "85300020", name: "Imobilização dentária", category: "DTM", price: 380, estimatedMinutes: 40 },
];

export const POPULAR_PROCEDURE_IDS = [
  "proc-001",
  "proc-002",
  "proc-003",
  "proc-004",
  "proc-005",
  "proc-006",
] as const;
