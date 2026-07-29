import { createReadStream, existsSync, writeFileSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { prisma } from "../src/lib/db";
import { DENTAL_CID_CATALOG } from "../src/lib/certificate-types";

const GIST_URL =
  "https://gist.githubusercontent.com/manuholiveira/9441735/raw";
const LOCAL_SQL = path.join(process.cwd(), "prisma", "data-cid10-raw.sql");

type CidRow = { code: string; description: string; source: string };

function parseInsertLine(line: string): CidRow | null {
  const m = /INSERT INTO CID10 VALUES \('([^']+)','((?:\\'|[^'])*)'\);/i.exec(
    line
  );
  if (!m) return null;
  const code = m[1].trim().toUpperCase();
  const description = m[2]
    .replace(/\\'/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (!code || !description) return null;
  return { code, description, source: "datasus" };
}

async function loadFromLocalSql(): Promise<CidRow[]> {
  if (!existsSync(LOCAL_SQL)) return [];
  const rows: CidRow[] = [];
  const rl = createInterface({
    input: createReadStream(LOCAL_SQL, { encoding: "latin1" }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const parsed = parseInsertLine(line);
    if (parsed) rows.push(parsed);
  }
  return rows;
}

async function loadFromRemote(): Promise<CidRow[]> {
  const res = await fetch(GIST_URL);
  if (!res.ok) throw new Error(`Falha ao baixar CID-10 (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("latin1");
  writeFileSync(LOCAL_SQL, text, { encoding: "latin1" });
  const rows: CidRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseInsertLine(line);
    if (parsed) rows.push(parsed);
  }
  return rows;
}

async function main() {
  console.log("Carregando base CID-10…");
  let rows = await loadFromLocalSql();
  if (rows.length < 1000) {
    console.log("Baixando base pública CID-10 (DATASUS/gist)…");
    rows = await loadFromRemote();
  }

  const byCode = new Map<string, CidRow>();
  for (const row of rows) byCode.set(row.code, row);
  for (const d of DENTAL_CID_CATALOG) {
    byCode.set(d.code.toUpperCase(), {
      code: d.code.toUpperCase(),
      description: d.description,
      source: "odonto",
    });
  }
  const unique = Array.from(byCode.values());

  console.log(`Limpando e importando ${unique.length} códigos (createMany)…`);
  await prisma.cid10.deleteMany({});

  const chunk = 1000;
  for (let i = 0; i < unique.length; i += chunk) {
    const slice = unique.slice(i, i + chunk);
    await prisma.cid10.createMany({
      data: slice,
      skipDuplicates: true,
    });
    process.stdout.write(
      `\r${Math.min(i + chunk, unique.length)}/${unique.length}`
    );
  }
  console.log("\nCID-10 importado com sucesso.");
  console.log(`Total no banco: ${await prisma.cid10.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
