const { execSync } = require("child_process");

// Padrões de segredos mais comuns (chaves de API, tokens, credenciais, chaves privadas).
const SECRET_PATTERNS = [
  { name: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/ },
  {
    name: "AWS Secret Access Key",
    regex: /aws_secret_access_key\s*=\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i,
  },
  {
    name: "Chave privada",
    regex: /-----BEGIN (RSA|EC|DSA|OPENSSH|PGP)? ?PRIVATE KEY-----/,
  },
  { name: "GitHub Token", regex: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: "Slack Token", regex: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: "JWT", regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  {
    name: "Credencial genérica (senha/token/segredo)",
    regex:
      /(password|senha|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"\s]{8,}['"]/i,
  },
];

// Arquivos que nunca devem ser commitados, mesmo sem conteúdo sensível óbvio.
const FORBIDDEN_FILES = [
  /(^|\/)\.env(\..+)?$/,
  /(^|\/)id_rsa$/,
  /(^|\/)id_ed25519$/,
];

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf-8",
  });
  return output.split("\n").filter(Boolean);
}

function getStagedDiff(file) {
  return execSync(`git diff --cached -U0 -- "${file}"`, {
    encoding: "utf-8",
  });
}

function findIssues() {
  const issues = [];
  const stagedFiles = getStagedFiles();

  for (const file of stagedFiles) {
    if (FORBIDDEN_FILES.some((pattern) => pattern.test(file))) {
      issues.push(`Arquivo não permitido: "${file}" não deve ser commitado.`);
      continue;
    }

    const diff = getStagedDiff(file);
    const addedLines = diff
      .split("\n")
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"));

    for (const line of addedLines) {
      for (const { name, regex } of SECRET_PATTERNS) {
        if (regex.test(line)) {
          issues.push(`Possível "${name}" encontrado em "${file}".`);
        }
      }
    }
  }

  return issues;
}

const issues = findIssues();

if (issues.length > 0) {
  console.error("\n🚫 Commit bloqueado: informações sensíveis detectadas!\n");
  issues.forEach((issue) => console.error(`  - ${issue}`));
  console.error(
    "\nRemova os dados sensíveis do commit (git restore --staged <arquivo>) antes de tentar novamente.\n",
  );
  process.exit(1);
}

process.exit(0);
