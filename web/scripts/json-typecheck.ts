/**
 * Type-check JSON documents against `contracts/schema.ts` with the TypeScript compiler.
 *
 * Plain `import x from "./file.json"` widens literals ("goto" -> string, [1, 10] -> number[]),
 * so it cannot prove conformance to unions/tuples. Instead each document is embedded in a
 * virtual source file as `(<json>) satisfies <Type>`, which keeps literal types and reports
 * excess or missing properties. Used by the fixture test; P4 can reuse it for real data
 * (fine for a few MB; for very large files prefer a runtime validator).
 */
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const SCHEMA_PATH = fileURLToPath(new URL("../../contracts/schema.ts", import.meta.url));

export interface JsonCheck {
  /** Label used in error messages, e.g. the file name. */
  name: string;
  /** Raw JSON text. */
  json: string;
  /** A type expression over the schema exports, e.g. `Guide` or `QuestInfo[]`. */
  type: string;
}

/** Returns formatted diagnostics; an empty array means every document conforms. */
export function typecheckJson(checks: JsonCheck[], schemaPath: string = SCHEMA_PATH): string[] {
  const schemaImport = schemaPath.replace(/\\/g, "/").replace(/\.ts$/, "");
  const exported = [...ts.sys.readFile(schemaPath)!.matchAll(/^export\s+(?:type|interface)\s+(\w+)/gm)].map(
    (m) => m[1]!,
  );
  const virtual = new Map<string, string>();
  checks.forEach((c, i) => {
    const fileName = `/__json_check__/${i}.ts`;
    // Everything stays on one line before the JSON so diagnostics map to JSON line numbers.
    virtual.set(
      fileName,
      `import type { ${exported.join(", ")} } from ${JSON.stringify(schemaImport)};\n` +
        `export const value = (\n${c.json}\n) satisfies ${c.type};\n`,
    );
  });

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
    lib: ["lib.es2022.d.ts"],
  };
  const host = ts.createCompilerHost(options, true);
  const baseGetSourceFile = host.getSourceFile.bind(host);
  const baseFileExists = host.fileExists.bind(host);
  const baseReadFile = host.readFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const text = virtual.get(fileName);
    if (text !== undefined) return ts.createSourceFile(fileName, text, languageVersion, true);
    return baseGetSourceFile(fileName, languageVersion, onError, shouldCreate);
  };
  host.fileExists = (fileName) => virtual.has(fileName) || baseFileExists(fileName);
  host.readFile = (fileName) => virtual.get(fileName) ?? baseReadFile(fileName);

  const program = ts.createProgram([...virtual.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return diagnostics.map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (!d.file) return msg;
    const idx = Number(/__json_check__\/(\d+)\.ts$/.exec(d.file.fileName)?.[1] ?? NaN);
    const label = Number.isNaN(idx) ? d.file.fileName : (checks[idx]?.name ?? d.file.fileName);
    const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
    // line 0 = import, line 1 = "export const value = (": JSON line = line - 1
    return `${label}:${Number.isNaN(idx) ? line + 1 : line - 1}: ${msg}`;
  });
}
